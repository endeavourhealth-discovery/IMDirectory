<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import { TreeNode, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers } from "im-library";
const { IM, RDF, RDFS } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes }
} = Helpers;

export default defineComponent({
  name: "NavTree",
  computed: mapState(["conceptIri", "selectedOnNavTree"]),
  watch: {
    selectedOnNavTree() {
      if (!this.selectedOnNavTree) {
        this.selected = {};
      }
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
    this.addParentFoldersToRoot();
    if (this.conceptIri) this.focusTree(this.conceptIri);
  },
  methods: {
    async addParentFoldersToRoot() {
      const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
      for (let IMchild of IMChildren) {
        const hasNode = !!this.root.find(node => node.data === IMchild["@id"]);
        if (!hasNode) this.root.push(this.createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasChildren));
      }
      this.root.sort((a, b) => (a.key > b.key ? 1 : b.key > a.key ? -1 : 0));
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
      this.$store.commit("updateSelectedConceptIri", node.data);
      this.$store.commit("updateSelectedOnNavTree", true);
    },

    async onNodeExpand(node: TreeNode) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await EntityService.getEntityChildren(node.data);
        children.forEach(child => {
          if (!this.nodeHasChild(node, child) && child.hasChildren)
            node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
        });
        node.loading = false;
      }
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
          if (node.children.length === 0) {
            this.onNodeExpand(node);
          }
          this.findNodeRecursive(data, node.children, result);
        });
      }
    },

    async expandUntilSelected(iri: string) {
      const folderPath = await EntityService.getFolderPath(iri);
      const iris = new Set(folderPath.map(path => path["@id"]));
      this.expandRecursive(iris, this.root);
      this.expandedKeys = { ...this.expandedKeys };
      const selected = folderPath[folderPath.length - 1];
      this.selectKey(selected.name);
    },

    expandRecursive(iris: Set<string>, nodes: TreeNode[]) {
      if (iris) {
        for (let node of nodes) {
          if (iris.has(node.data)) {
            this.expandedKeys[node.key] = true;
            this.onNodeExpand(node);
            iris.delete(node.data);
            this.expandRecursive(iris, node.children);
          }
        }
      }
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
        await this.expandUntilSelected(iri);
      }
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: calc(100%);
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
</style>
