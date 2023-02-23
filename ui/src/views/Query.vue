<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <div class="query-container">
      <div style="margin-bottom: 1em">
        <Button class="query-tree-button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
        <Button class="query-tree-button p-button-secondary" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
      </div>
      <Tree :value="nodes" class="tree-container">
        <template #add="{ node }">
          <Button label="Add" icon="fa-sharp fa-solid fa-plus" @click="addDefault(node)" />
          <Button label="Add custom" icon="fa-sharp fa-solid fa-screwdriver-wrench" @click="addComplex(node)" />
        </template>
      </Tree>
    </div>
    <Dialog
      :header="focusedNode.key + '- default'"
      v-model:visible="addDefaultDialog"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
    >
      <PropertyValue :node="focusedNode" />
      <template #footer>
        <Button label="Cancel" icon="fa-solid fa-ban" @click="addDefaultDialog = false" class="p-button-text" />
        <Button label="Save" icon="fa-solid fa-check" @click="addDefaultDialog = false" autofocus />
      </template>
    </Dialog>
    <Dialog header="Header" v-model:visible="addComplexDialog" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" :style="{ width: '50vw' }">
      <p>{{ focusedNode.key }} - complex</p>
      <template #footer>
        <Button label="Cancel" icon="fa-solid fa-ban" @click="addComplexDialog = false" class="p-button-text" />
        <Button label="Save" icon="fa-solid fa-check" @click="addComplexDialog = false" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { TreeNode } from "primevue/tree";
import { Query } from "@im-library/models/AutoGen";
import PropertyValue from "@/components/query/PropertyValue.vue";
import { useStore } from "vuex";
const store = useStore();
const addNode = {
  key: "0",
  type: "add",
  label: "Add"
};
const addDefaultDialog: Ref<boolean> = ref(false);
const addComplexDialog: Ref<boolean> = ref(false);
const nodes: Ref<TreeNode[]> = ref([{ ...addNode }]);
const expandedKeys = ref<any>({});
const query: Ref<Query> = ref({} as Query);
const focusedNode: Ref<TreeNode> = ref({});

onMounted(async () => {
  expandAll();
});

function addDefault(node: TreeNode) {
  focusedNode.value = node;
  addDefaultDialog.value = true;
}

function addComplex(node: TreeNode) {
  console.log(node);
  focusedNode.value = node;
  addComplexDialog.value = true;
}

function expandAll() {
  for (const node of nodes.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
}

function expandNode(node: TreeNode) {
  expandedKeys.value[node.key!] = true;
  if (node.children && node.children.length) {
    for (let child of node.children) {
      expandNode(child);
    }
  }
}

function collapseAll() {
  expandedKeys.value = {};
}

onMounted(async () => {
  await store.dispatch("fetchFilterSettings");
});

//
</script>

<style scoped lang="scss">
#topbar-query-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.query-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
.tree-container {
  height: 100%;
  overflow-y: auto;
}

.query-tree-button {
  margin-right: 0.5rem;
}
</style>
