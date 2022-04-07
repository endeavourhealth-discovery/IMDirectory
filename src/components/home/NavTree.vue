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
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;

export default defineComponent({
  name: "NavTree",
  computed: mapState(["conceptIri", "favourites", "locateOnNavTreeIri"]),
  watch: {
    async locateOnNavTreeIri() {
      await this.findPathToNode(this.locateOnNavTreeIri);
    },
    async conceptIri() {
      await this.findPathToNode(this.conceptIri);
    }
  },
  data() {
    return {
      selected: {} as any,
      selectedNode: {} as TreeNode,
      root: [] as TreeNode[],
      loading: true,
      expandedKeys: {} as any
    };
  },
  async mounted() {
    this.loading = true;
    await this.addParentFoldersToRoot();
    if (this.conceptIri) await this.findPathToNode(this.conceptIri);
    this.loading = false;
  },
  methods: {
    async addParentFoldersToRoot() {
      const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
      for (let IMchild of IMChildren) {
        const hasNode = !!this.root.find(node => node.data === IMchild["@id"]);
        if (!hasNode) this.root.push(this.createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren));
      }
      this.root.sort(this.byKey);
      const favNode = this.createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false);
      favNode.typeIcon = ["fas", "star"];
      favNode.color = "#e39a36";
      this.root.push(favNode);
    },

    byKey(a: any, b: any): number {
      if (a.key > b.key) {
        return 1;
      } else if (b.key > a.key) {
        return -1;
      } else {
        return 0;
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

    onNodeSelect(node: TreeNode): void {
      this.selectedNode = node;
      this.$router.push({
        name: "Folder",
        params: { selectedIri: node.data }
      });
      this.$store.commit("updateSelectedConceptIri", node.data);
    },

    async onNodeExpand(node: TreeNode) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await EntityService.getEntityChildren(node.data);
        children.forEach(child => {
          if (!this.nodeHasChild(node, child) && child.hasChildren)
            node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasGrandChildren));
        });
        node.loading = false;
      }
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    },

    selectKey(selectedKey: string) {
      Object.keys(this.selected).forEach(key => {
        this.selected[key] = false;
      });
      this.selected[selectedKey] = true;
    },

    async findPathToNode(iri: string) {
      this.loading = true;
      const path = await EntityService.getPathBetweenNodes(iri, IM.MODULE_IM);

      // Recursively expand
      let n = this.root.find(c => path.find(p => p["@id"] === c.data));
      let i = 0;
      if (n) {
        this.expandedKeys = {};
        while (n && n.data != path[0]["@id"] && i++ < 50) {
          this.selectKey(n.key);
          // Expand node if necessary
          if (!n.children || n.children.length == 0) {
            await this.onNodeExpand(n);
          }
          this.expandedKeys[n.key] = true;

          // Find relevant child
          n = n.children.find(c => path.find(p => p["@id"] === c.data));
        }

        if (n && n.data === path[0]["@id"]) {
          this.selectKey(n.key);
          // Expand node if necessary
          if (!n.children || n.children.length == 0) {
            await this.onNodeExpand(n);
          }
          for (const gc of n.children) {
            if (gc.data === iri) {
              this.selectKey(gc.key);
            }
          }
          this.expandedKeys[n.key] = true;
          this.selectedNode = n;
          this.$store.commit("updateSelectedConceptIri", n.data);
        } else {
          this.$toast.add({
            severity: "warn",
            summary: "Unable to locate",
            detail: "Unable to locate concept in the current hierarchy"
          });
        }
        const container = document.getElementById("hierarchy-tree-bar-container") as HTMLElement;
        const highlighted = container.getElementsByClassName("p-highlight")[0];
        if (highlighted) highlighted.scrollIntoView();
      }
      this.loading = false;
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
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

.tree-row .p-progress-spinner {
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
