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
        <div class="tree-row" @mouseover="showOverlay($event, slotProps.node.data)" @mouseleave="hideOverlay($event)">
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw" aria-hidden="true"></i>
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>

    <OverlayPanel ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem;">
        <div class="left-side" style="width: 50%">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span style="word-break:break-all;">{{ hoveredResult.iri }}</span>
          </p>
          <p v-if="hoveredResult.code">
            <strong>Code: </strong>
            <span>{{ hoveredResult.code }}</span>
          </p>
        </div>
        <div class="right-side" style="width: 50%">
          <p v-if="hoveredResult.status">
            <strong>Status: </strong>
            <span>{{ hoveredResult.status.name }}</span>
          </p>
          <p v-if="hoveredResult.scheme">
            <strong>Scheme: </strong>
            <span>{{ hoveredResult.scheme.name }}</span>
          </p>
          <p v-if="hoveredResult.entityType">
            <strong>Type: </strong>
            <span>{{ getConceptTypes(hoveredResult.entityType) }}</span>
          </p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { TreeNode, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Models } from "im-library";
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength, isObject },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes }
} = Helpers;

export default defineComponent({
  name: "NavTree",
  computed: mapState(["conceptIri", "favourites", "locateOnNavTreeIri"]),
  watch: {
    async locateOnNavTreeIri() {
      await this.findPathToNode(this.locateOnNavTreeIri);
    }
  },
  data() {
    return {
      selected: {} as any,
      selectedNode: {} as TreeNode,
      root: [] as TreeNode[],
      loading: true,
      expandedKeys: {} as any,
      hoveredResult: {} as Models.Search.ConceptSummary,
      overlayLocation: {} as any
    };
  },
  async mounted() {
    this.loading = true;
    await this.addParentFoldersToRoot();
    if (this.conceptIri) await this.findPathToNode(this.conceptIri);
    this.loading = false;
  },
  beforeUnmount() {
    if (isObject(this.overlayLocation) && isArrayHasLength(Object.keys(this.overlayLocation))) {
      this.hideOverlay(this.overlayLocation);
    }
  },
  methods: {
    async addParentFoldersToRoot() {
      const IMChildren = await this.$entityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
      for (let IMchild of IMChildren) {
        const hasNode = !!this.root.find(node => node.data === IMchild["@id"]);
        if (!hasNode) this.root.push(this.createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren));
      }
      this.root.sort(this.byKey);
      const favNode = this.createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false);
      favNode.typeIcon = ["fa-solid", "fa-star"];
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

    onNodeSelect(node: any): void {
      this.selectedNode = node;
      this.$router.push({
        name: "Folder",
        params: { selectedIri: node.data }
      });
      this.$store.commit("updateSelectedConceptIri", node.data);
    },

    async onNodeExpand(node: any) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await this.$entityService.getEntityChildren(node.data);
        children.forEach((child: EntityReferenceNode) => {
          if (!this.nodeHasChild(node, child)) node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
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
      const path = await this.$entityService.getPathBetweenNodes(iri, IM.MODULE_IM);

      // Recursively expand
      let n = this.root.find(c => path.find(p => p["@id"] === c.data));
      let i = 0;
      if (n) {
        this.expandedKeys = {};
        while (n && n.data != path[0]["@id"] && i++ < 50) {
          await this.selectAndExpand(n);
          // Find relevant child
          n = n.children.find(c => path.find(p => p["@id"] === c.data));
        }
        if (n && n.data === path[0]["@id"]) {
          await this.selectAndExpand(n);
          for (const gc of n.children) {
            if (gc.data === iri) {
              this.selectKey(gc.key);
            }
          }
          this.selectedNode = n;
        } else {
          this.$toast.add({
            severity: "warn",
            summary: "Unable to locate",
            detail: "Unable to locate concept in the current hierarchy"
          });
        }
      }
      this.scrollToHighlighted();
      this.loading = false;
    },

    async selectAndExpand(node: any) {
      this.selectKey(node.key);
      if (!node.children || node.children.length === 0) {
        await this.onNodeExpand(node);
      }
      this.expandedKeys[node.key] = true;
    },

    scrollToHighlighted() {
      const container = document.getElementById("hierarchy-tree-bar-container") as HTMLElement;
      const highlighted = container.getElementsByClassName("p-highlight")[0];
      if (highlighted) highlighted.scrollIntoView();
    },

    async showOverlay(event: any, iri?: string): Promise<void> {
      if (iri) {
        const x = this.$refs.navTreeOP as any;
        this.overlayLocation = event;
        x.show(this.overlayLocation);
        this.hoveredResult = await this.$entityService.getEntitySummary(iri);
      }
    },

    hideOverlay(event: any): void {
      const x = this.$refs.navTreeOP as any;
      x.hide(event);
      this.overlayLocation = {} as any;
    },

    getConceptTypes(types: TTIriRef[]): string {
      return getNamesAsStringFromTypes(types);
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
