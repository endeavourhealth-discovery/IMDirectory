<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"

      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div class="tree-row" @mouseover="showOverlay($event, slotProps.node)" @mouseleave="hideOverlay($event)" @dblclick="onNodeDblClick($event, slotProps.node)" @contextmenu="onNodeContext($event, slotProps.node)">
          <ContextMenu ref="menu" :model="items" />
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

    <OverlayPanel v-if="hoveredResult.iri === 'load'" ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </OverlayPanel>
    <OverlayPanel v-else ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <div class="left-side" style="width: 50%">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
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
    <Dialog header="New folder" v-model:visible="showNewFolder" :modal="true">
      <InputText type="text" v-model="newFolderName" autofocus/>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showNewFolder = null" class="p-button-text"/>
        <Button label="Create" icon="pi pi-check" @click="createFolder" />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { TreeNode, TTIriRef, EntityReferenceNode, ConceptSummary } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers } from "im-library";
import ContextMenu from 'primevue/contextmenu';
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength, isObject },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes }
} = Helpers;

export default defineComponent({
  name: "NavTree",
  computed: mapState(["conceptIri", "favourites", "currentUser"]),
  data() {
    return {
      selectedKeys: {} as any,
      selectedNode: {} as TreeNode,
      root: [] as TreeNode[],
      loading: true,
      expandedKeys: {} as any,
      hoveredResult: {} as ConceptSummary,
      overlayLocation: {} as any,
      pageSize: 20,
      items: [] as any[],
      showNewFolder: null as TreeNode | null,
      newFolderName: "New folder"
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
        if (!hasNode) this.root.push(this.createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, null, IMchild.orderNumber));
      }
      this.root.sort(this.byKey);
      const favNode = this.createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false, null);
      favNode.typeIcon = ["fa-solid", "fa-star"];
      favNode.color = "#e39a36";
      this.root.push(favNode);
    },

    byKey(a: any, b: any): number {
      // order by order number
      if (a.order && b.order) return a.order - b.order;
      else if (a.order && !b.order) return -1;
      else if (!a.order && b.order) return 1;
      // order alphabetically
      else if (a.key > b.key) return 1;
      else if (b.key > a.key) return -1;

      return 0;
    },

    createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean, parent: TreeNode | null, order?: number): TreeNode {
      return {
        key: conceptIri,
        label: conceptName,
        typeIcon: getFAIconFromType(conceptTypes),
        color: getColourFromType(conceptTypes),
        data: conceptIri,
        leaf: !hasChildren,
        loading: false,
        children: [] as TreeNode[],
        order: order,
        parentNode: parent
      };
    },

    createLoadMoreNode(parentNode: TreeNode, nextPage: number, totalCount: number): any {
      return {
        key: "loadMore" + parentNode.data,
        label: "Load more...",
        typeIcon: null,
        color: null,
        data: "loadMore",
        leaf: true,
        loading: false,
        children: [] as TreeNode[],
        parentNode: parentNode,
        nextPage: nextPage,
        totalCount: totalCount,
        style: "font-weight: bold;"
      };
    },

    onNodeSelect(node: any): void {
      if (node.data === "loadMore") {
        this.loadMore(node);
      } else {
        this.selectedNode = node;
        this.$router.push({
          name: "Folder",
          params: { selectedIri: node.data }
        });
        this.$store.commit("updateSelectedConceptIri", node.data);
      }
    },

    onNodeDblClick($event: any, node: any) {
      if (node.typeIcon && node.typeIcon.includes('fa-folder'))
        this.selectAndExpand(node);
      else if (node.data !== "loadMore")
        this.$directService.directTo(this.$env.VIEWER_URL, node.key, "concept");
    },

    async loadMore(node: any) {
      if (node.nextPage * this.pageSize < node.totalCount) {
        const children = await this.$entityService.getPagedChildren(node.parentNode.data, node.nextPage, this.pageSize);
        node.parentNode.children.pop();
        children.result.forEach((child: any) => {
          if (!this.nodeHasChild(node.parentNode, child))
            node.parentNode.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
        });
        node.nextPage = node.nextPage + 1;
        node.parentNode.children.push(this.createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
      } else if (node.nextPage * this.pageSize > node.totalCount) {
        const children = await this.$entityService.getPagedChildren(node.parentNode.data, node.nextPage, this.pageSize);
        node.parentNode.children.pop();
        children.result.forEach((child: any) => {
          if (!this.nodeHasChild(node.parentNode, child))
            node.parentNode.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node.parentNode));
        });
      } else {
        node.parentNode.children.pop();
      }
    },

    async onNodeExpand(node: any) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await this.$entityService.getPagedChildren(node.data, 1, this.pageSize);
        children.result.forEach((child: any) => {
          if (!this.nodeHasChild(node, child)) node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
        });
        if (children.totalCount >= this.pageSize) {
          node.children.push(this.createLoadMoreNode(node, 2, children.totalCount));
        }
        node.loading = false;
      }
    },

    onNodeCollapse(node: any) {
      node.children = [];
      node.leaf = false;
    },

    onNodeContext(event: any, node: any) {
      this.items = [];

      if (!this.currentUser.roles.includes("IMAdmin"))
        return;

      if (node.typeIcon.includes("fa-folder")) {
        this.items.push({
          label: 'New folder',
          icon: 'fas fa-fw fa-folder-plus',
          command: () => {
            this.newFolderName = "";
            this.showNewFolder = node;
          }
        });
      }

      if (this.selectedNode && node.typeIcon.includes("fa-folder")) {
        this.items.push({
          label: 'Move selection here',
          icon: 'fas fa-fw fa-file-import',
          command: () => {
            this.confirmMove(node)
          }
        });
        this.items.push({
          label: 'Add selection here',
          icon: 'fas fa-fw fa-copy',
          command: () => {
            this.confirmAdd(node)
          }
        });
      }

      if (this.items.length > 0)
        (this.$refs.menu as ContextMenu).show(event);
    },

    confirmMove(node: TreeNode) {
      if (this.selectedNode) {
        this.$confirm.require({
          header: 'Confirm move',
          message: 'Are you sure you want to move "' + this.selectedNode.label + '" to "' + node.label + '" ?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.moveConcept(node);

          },
          reject: () => {
            this.$toast.add({ severity: 'warn', summary: 'Cancelled', detail: 'Move cancelled', life: 3000 });
          }
        });
      }
    },

    async moveConcept(target: TreeNode) {
      if (this.selectedNode && this.selectedNode.parentNode) {
        try {
          await this.$filerService.moveFolder(this.selectedNode.key, this.selectedNode.parentNode.key, target.key);
          this.$toast.add({ severity: 'success', summary: 'Move', detail: 'Moved "' + this.selectedNode.label + '" into "' + target.label + '"', life: 3000 });
          this.selectedNode.parentNode.children = this.selectedNode.parentNode.children.filter((v, _i, _r) => v != this.selectedNode);
          this.selectedNode.parentNode = target;
          target.children.push(this.selectedNode);
        } catch (e: any) {
          this.$toast.add({ severity: 'error', summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
        }
      }
    },

    confirmAdd(node: TreeNode) {
      if (this.selectedNode) {
        this.$confirm.require({
          header: 'Confirm add',
          message: 'Are you sure you want to add "' + this.selectedNode.label + '" to "' + node.label + '" ?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.addConcept(node);
          },
          reject: () => {
            this.$toast.add({ severity: 'warn', summary: 'Cancelled', detail: 'Add cancelled', life: 3000 });
          }
        });
      }
    },

    async addConcept(target: TreeNode) {
      if (this.selectedNode && this.selectedNode.parentNode) {
        try {
          await this.$filerService.addToFolder(this.selectedNode.key, target.key);
          this.$toast.add({ severity: 'success', summary: 'Add', detail: 'Added "' + this.selectedNode.label + '" into "' + target.label + '"', life: 3000 });
          target.children.push(this.selectedNode);  // Does this need to be a (deep) clone?
        } catch (e: any) {
          this.$toast.add({ severity: 'error', summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
        }
      }
    },

    async createFolder() {
      if (!this.showNewFolder)
        return;

      console.log("Create new folder " + this.newFolderName + " in " + this.showNewFolder.key);
      const iri = await this.$filerService.createFolder(this.showNewFolder.key, this.newFolderName);
      if (iri) {
        console.log("Created folder")
        console.log(iri);
        this.$toast.add({ severity: 'success', summary: 'New folder', detail: 'New folder "' + this.newFolderName + '" created', life: 3000 });
        if (this.showNewFolder?.children) {
          this.showNewFolder?.children.push(this.createTreeNode(
              this.newFolderName,
              iri,
              [{ "@id": IM.FOLDER, name: "Folder" }],
              false,
              this.showNewFolder
          ));
        }
      } else {
        this.$toast.add({ severity: 'error', summary: 'New folder', detail: '"' + this.newFolderName + '" already exists', life: 3000 });
      }
      this.showNewFolder = null;
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    },

    selectKey(selectedKey: string) {
      Object.keys(this.selectedKeys).forEach(key => {
        this.selectedKeys[key] = false;
      });
      this.selectedKeys[selectedKey] = true;
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

          while (!n.children.some(child => child.data === iri)) {
            await this.loadMoreChildren(n);
          }
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
      this.expandedKeys = { ...this.expandedKeys };
    },

    scrollToHighlighted() {
      const container = document.getElementById("hierarchy-tree-bar-container") as HTMLElement;
      const highlighted = container.getElementsByClassName("p-highlight")[0];
      if (highlighted) highlighted.scrollIntoView();
    },

    async loadMoreChildren(node: any) {
      if (node.children[node.children.length - 1].data === "loadMore") {
        await this.loadMore(node.children[node.children.length - 1]);
      }
    },

    async showOverlay(event: any, node?: any): Promise<void> {
      if (node.data === "loadMore") {
        const x = this.$refs.navTreeOP as any;
        this.overlayLocation = event;
        x.show(this.overlayLocation);
        this.hoveredResult.iri = "load";
        this.hoveredResult.name = node.parentNode.label;
      } else if (node.data) {
        const x = this.$refs.navTreeOP as any;
        this.overlayLocation = event;
        x.show(this.overlayLocation);
        this.hoveredResult = await this.$entityService.getEntitySummary(node.data);
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

#hierarchy-tree-bar-container::v-deep(.p-tree-toggler) {
  height: 1.25rem !important;
  margin: 0 0 0 0 !important;
}
</style>
