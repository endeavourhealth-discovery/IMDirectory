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
      console.log(newValue);
      // this.getTree(newValue);
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
      if (iri && iri !== IM.NAMESPACE + "InformationModel") {
        this.root = await this.createTree(iri);
        await this.expandUntilSelected(iri);
      } else {
        const entity = await EntityService.getPartialEntity(IM.NAMESPACE + "InformationModel", [RDFS.LABEL, RDF.TYPE]);
        this.root.push(this.createTreeNode(entity[RDFS.LABEL], entity["@id"], entity[RDF.TYPE], true));
        this.expandedKeys[this.root[0].label] = true;
        this.onNodeExpand(this.root[0]);
      }
      this.loading = false;
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
        treeNodes.push(parentNode);
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
      console.log(this.selected);
      this.$router.push({
        name: "Folder",
        params: { selectedIri: node.data }
      });
    },

    async onNodeExpand(node: TreeNode) {
      node.loading = true;
      const children = await EntityService.getEntityChildren(node.data);
      children.forEach(child => {
        if (!this.nodeHasChild(node, child)) node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
      });
      node.loading = false;
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    },

    findNode(key: string, nodes: TreeNode[]) {
      const foundNode = nodes.find(node => node.key === key);
      if (foundNode) {
        return foundNode;
      }
      const result = [] as TreeNode[];
      this.findNodeRecursive(key, nodes, result);
      return result[0];
    },

    findNodeRecursive(key: string, nodes: TreeNode[], result: TreeNode[]) {
      const foundNode = nodes.find(node => node.key === key);
      if (foundNode) {
        result.push(foundNode);
      } else {
        nodes.forEach(node => {
          if (node.children.length != 0) {
            this.findNodeRecursive(key, node.children, result);
          }
        });
      }
    },

    async expandUntilSelected(iri: string) {
      const folderPath = await EntityService.getFolderPath(iri);
      folderPath.forEach(path => {
        this.expandedKeys[path.name] = true;
        const nodeToExpand = this.findNode(path.name, this.root);
        this.onNodeExpand(nodeToExpand);
      });
      const selected = folderPath[folderPath.length - 1];
      this.selected[selected.name] = true;
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: calc(100% - 3rem);
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
