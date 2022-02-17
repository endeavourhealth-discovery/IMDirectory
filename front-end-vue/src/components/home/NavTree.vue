<template>
  <div id="side-bar">
    <div class="p-d-flex p-flex-column p-jc-start" id="hierarchy-tree-bar-container">
      <Tree
        :value="root"
        selectionMode="single"
        v-model:selectionKeys="selected"
        :expandedKeys="expandedKeys"
        @node-select="onNodeSelect"
        @node-expand="onNodeExpand"
        class="tree-root"
        :loading="loading"
      >
        <template #default="slotProps">
          <div class="tree-row">
            <span v-if="!slotProps.node.loading">
              <div :style="'color:' + slotProps.node.color">
                <font-awesome-icon :icon="slotProps.node.typeIcon" class="fa-fw"></font-awesome-icon>
              </div>
            </span>
            <ProgressSpinner v-if="slotProps.node.loading" />
            <span>{{ slotProps.node.label }}</span>
          </div>
        </template>
      </Tree>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { getColourFromType, getFAIconFromType, isOfTypes } from "@/helpers/ConceptTypeMethods";
import { TreeNode } from "@/models/TreeNode";
import { TTIriRef } from "@/models/TripleTree";
import EntityService from "@/services/EntityService";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { IM } from "@/vocabulary/IM";
import { RDFS } from "@/vocabulary/RDFS";
import { RDF } from "@/vocabulary/RDF";

export default defineComponent({
  name: "NavTree",
  computed: mapState(["conceptIri"]),
  watch: {
    async conceptIri(newValue) {
      if (newValue) this.focusTree(newValue);
    }
  },
  data() {
    return {
      selected: {} as any,
      root: [] as TreeNode[],
      loading: false,
      expandedKeys: {} as any
    };
  },
  async mounted() {
    this.getTree(this.conceptIri);
  },
  methods: {
    async getTree(iri: string) {
      this.loading = true;
      this.addParentFoldersToRoot();
      if (iri && iri !== IM.NAMESPACE + "Favourites") {
        this.root = await this.createTree(iri);
        await this.expandUntilSelected(iri);
      }
      this.loading = false;
    },

    async addParentFoldersToRoot() {
      const sets = await EntityService.getPartialEntity(IM.NAMESPACE + "Sets", [RDFS.LABEL, RDF.TYPE]);
      const datamodels = await EntityService.getPartialEntity(IM.NAMESPACE + "DiscoveryCommonDataModel", [RDFS.LABEL, RDF.TYPE]);
      const ontologies = await EntityService.getPartialEntity(IM.NAMESPACE + "DiscoveryOntology", [RDFS.LABEL, RDF.TYPE]);
      const queries = await EntityService.getPartialEntity(IM.NAMESPACE + "Q_Queries", [RDFS.LABEL, RDF.TYPE]);
      [sets, datamodels, queries, ontologies].forEach(parentFolder => {
        const hasNode = !!this.root.find(node => node.data === parentFolder["@id"]);
        if (!hasNode) {
          this.root.push(this.createTreeNode(parentFolder[RDFS.LABEL], parentFolder["@id"], parentFolder[RDF.TYPE], true));
        }
      });
      this.root.sort((a, b) => (a.key > b.key ? 1 : b.key > a.key ? -1 : 0));
      this.addFavouritesFolder();
    },

    async addFavouritesFolder() {
      const favourites = await EntityService.getPartialEntity(IM.NAMESPACE + "Favourites", [RDFS.LABEL, RDF.TYPE]);
      this.root.push({
        key: favourites[RDFS.LABEL],
        label: favourites[RDFS.LABEL],
        typeIcon: ["fas", "star"],
        color: "#e39a36",
        data: favourites["@id"],
        leaf: false,
        loading: false,
        children: [] as TreeNode[]
      });
    },

    async createTree(iri: string) {
      const parentHierarchy = await EntityService.getParentHierarchy(iri);
      const treeNodes = [] as TreeNode[];
      this.createTreeRecursive(parentHierarchy, treeNodes);
      for (let i = treeNodes.length - 1; i > 0; i--) {
        treeNodes[i - 1].children = [];
        treeNodes[i - 1].children.push(treeNodes[i]);
        treeNodes.splice(i);
      }
      return treeNodes;
    },

    createTreeRecursive(childRef: EntityReferenceNode, treeNodes: TreeNode[]) {
      const childNode = this.createTreeNode(childRef.name, childRef["@id"], childRef.type, true);
      if (childRef.parents.length != 0) {
        const parentNode = this.createTreeNode(childRef.parents[0].name, childRef.parents[0]["@id"], childRef.parents[0].type, true);
        parentNode.children.push(childNode);
        this.createTreeRecursive(childRef.parents[0], treeNodes);
        if (parentNode.data !== IM.NAMESPACE + "InformationModel") treeNodes.push(parentNode);
      }
    },

    createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean): TreeNode {
      return {
        key: conceptName,
        label: conceptName,
        typeIcon: getFAIconFromType(conceptTypes),
        color: getColourFromType(conceptTypes),
        data: conceptIri,
        leaf: !hasChildren,
        loading: false,
        children: [] as TreeNode[]
      };
    },

    async onNodeSelect(node: TreeNode): Promise<void> {
      this.$router.push({
        name: "Folder",
        params: { selectedIri: node.data }
      });
    },

    async onNodeExpand(node: TreeNode) {
      node.loading = true;
      const children = await EntityService.getEntityChildren(node.data);
      children.forEach(child => {
        if (!this.nodeHasChild(node, child) && isOfTypes(child.type, IM.FOLDER))
          node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
      });

      node.loading = false;
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    },

    findNode(data: string, nodes: TreeNode[]) {
      const foundNode = nodes.find(node => node.data === data);
      if (foundNode) {
        return foundNode;
      }
      const result = [] as TreeNode[];
      this.findNodeRecursive(data, nodes, result);
      return result[0];
    },

    findNodeRecursive(data: string, nodes: TreeNode[], result: TreeNode[]) {
      const foundNode = nodes.find(node => node.data === data);
      if (foundNode) {
        result.push(foundNode);
      } else {
        nodes.forEach(node => {
          if (node.children.length != 0) {
            this.findNodeRecursive(data, node.children, result);
          }
        });
      }
    },

    async expandUntilSelected(iri: string) {
      const folderPath = await EntityService.getFolderPath(iri);
      folderPath.forEach(path => {
        this.expandedKeys[path.name] = true;
        const nodeToExpand = this.findNode(path["@id"], this.root);
        this.onNodeExpand(nodeToExpand);
      });
      const selected = folderPath[folderPath.length - 1];
      this.selectKey(selected.name);
    },

    selectKey(selectedKey: string) {
      Object.keys(this.selected).forEach(key => {
        this.selected[key] = false;
      });
      this.selected[selectedKey] = true;
    },

    async focusTree(iri: string) {
      const foundNode = this.findNode(iri, this.root);
      if (foundNode) {
        this.selectKey(foundNode.key);
      } else {
        this.root = await this.createTree(iri);
        await this.expandUntilSelected(iri);
      }
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: calc(100% - 2rem);
}

.p-tree .p-tree-container .p-treenode .p-treenode-content {
  padding: 0rem !important;
  transition: box-shadow 3600s 3600s !important;
}

.p-tree-toggler {
  margin-right: 0 !important;
}

.tree-root {
  height: 100%;
  overflow: auto;
  border: none;
  padding: 0;
}
.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
}

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

#parent-button-bar {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

.toggle-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.tree-locked-button,
.tree-lock-button,
.home-button,
.next-parent-button {
  width: fit-content !important;
}

#side-bar {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  max-height: calc(100vh);
  grid-area: sidebar;
  height: calc(100vh);
  width: 30vw;
}
</style>
