<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <div class="query-container">
      <Tree :value="nodes" :expanded-keys="expandedKeys" class="tree-container">
        <template #default="{ node }">
          <div class="node" @mouseover="mouseover($event, node.key!)" @mouseout="mouseout($event)">
            {{ node.label }}
            <Button @click="edit(node)" :class="[hover !== node.key ? 'unhovered-button' : 'p-button-rounded p-button-text']" icon="fa-duotone fa-pen" />
            <Button
              @click="view(node)"
              :class="[hover !== node.key ? 'unhovered-button' : 'p-button-rounded p-button-text p-button-help']"
              icon="fa-duotone fa-eye"
            />
            <Button
              @click="delet(node)"
              :class="[hover !== node.key ? 'unhovered-button' : 'p-button-rounded p-button-text p-button-danger']"
              icon="fa-duotone fa-trash"
            />
          </div>
        </template>
        <template #add="{ node }">
          <Button label="Add" icon="fa-sharp fa-solid fa-plus" @click="addDefault(node)" />
          <Button label="Add custom" icon="fa-sharp fa-solid fa-screwdriver-wrench" @click="addComplex(node)" />
        </template>
      </Tree>
    </div>
    <Dialog
      :header="'Condition ' + (+focusedNode.key! + 1)"
      v-model:visible="addDefaultDialog"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '80vw' }"
    >
      <PropertyValue :query="query" :node="focusedNode" @on-close="onClose" />
    </Dialog>
    <Dialog
      :header="'Condition ' + (+focusedNode.key! + 1)"
      v-model:visible="addComplexDialog"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '80vw' }"
    >
      <template #footer>
        <Button label="Cancel" icon="fa-solid fa-ban" @click="addComplexDialog = false" class="p-button-text" />
        <Button label="Save" icon="fa-solid fa-check" @click="addComplexDialog = false" autofocus />
      </template>
    </Dialog>
    <Dialog :header="focusedNode.label" v-model:visible="jsonViewDialog" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" :style="{ width: '80vw' }">
      <VueJsonPretty class="json" :path="'res'" :data="focusedNode.data" :editable="true" :editable-trigger="'dblclick'" />
    </Dialog>
    <Dialog :header="focusedNode.label" v-model:visible="editDialog" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" :style="{ width: '80vw' }">
      <EditPropertyValue :node="focusedNode" :query="query" class="json" :path="'res'" :data="focusedNode.data" @on-close="onClose" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted, watch } from "vue";
import { TreeNode } from "primevue/tree";
import { Query, TTAlias } from "@im-library/models/AutoGen";
import PropertyValue from "@/components/query/PropertyValue.vue";
import { useStore } from "vuex";
import _ from "lodash";
import { buildDisplayQuery } from "@im-library/helpers/DisplayQueryBuilder";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import EditPropertyValue from "@/components/query/EditPropertyValue.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const store = useStore();
const addNode = {
  key: "0",
  type: "add",
  label: "Add"
};
const addDefaultDialog: Ref<boolean> = ref(false);
const addComplexDialog: Ref<boolean> = ref(false);
const jsonViewDialog: Ref<boolean> = ref(false);
const editDialog: Ref<boolean> = ref(false);

const nodes: Ref<TreeNode[]> = ref([{ ...addNode }]);
const expandedKeys = ref<any>({});
const query: Ref<Query> = ref({} as Query);
const focusedNode: Ref<TreeNode> = ref({});
const hover: Ref<string> = ref("");

onMounted(async () => {
  await store.dispatch("fetchFilterSettings");
  expandAll();
});

watch(
  () => _.cloneDeep(query.value),
  () => {
    build();
    expandAll();
  }
);

function edit(node: TreeNode) {
  focusedNode.value = node;
  editDialog.value = true;
}

function build() {
  nodes.value = buildDisplayQuery(query.value);
  nodes.value.push({ ...addNode });
}

function addDefault(node: TreeNode) {
  focusedNode.value = node;
  addDefaultDialog.value = true;
}

function addComplex(node: TreeNode) {
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

function onClose() {
  addDefaultDialog.value = false;
  editDialog.value = false;
}

function view(node: TreeNode) {
  focusedNode.value = node;
  jsonViewDialog.value = true;
}

function delet(node: TreeNode) {
  console.log(node);
  if ("whereIn" === node.type) {
    // TODO fix
    // const foundNodes = [] as TreeNode[];
    // const parentKey = node.key!.slice(0, -1);
    // findNodeByKey(nodes.value[0], parentKey, foundNodes);
    // console.log(foundNodes);
    // if (
    //   isArrayHasLength(foundNodes) &&
    //   isObjectHasKeys(foundNodes[0], ["data"]) &&
    //   isObjectHasKeys(foundNodes[0].data, ["in"]) &&
    //   isArrayHasLength(foundNodes[0].data.in)
    // ) {
    //   foundNodes[0].data.in = foundNodes[0].data.in.filter((inItem: TTAlias) => inItem.name !== node.data.name);
    // }
  } else {
    for (const property in node.data) {
      delete node.data[property];
    }
  }
}

function findNodeByKey(data: TreeNode, key: string, nodes: TreeNode[]): void {
  if (data.key === key) {
    nodes.push(data);
  } else if (isArrayHasLength(data.children)) {
    for (const child of data.children!) {
      findNodeByKey(child, key, nodes);
    }
  }
}

function mouseover(event: any, key: string) {
  event.stopPropagation();
  hover.value = key;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = "";
}
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

.node {
  display: flex;
  align-items: center;
  gap: 0.1rem;
}

.unhovered-button {
  opacity: 0;
}
</style>
