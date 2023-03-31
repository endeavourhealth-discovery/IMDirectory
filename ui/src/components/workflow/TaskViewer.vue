<template>
  <div class="viewer-main-container">
    <h5 class="title">Task Viewer</h5>
    <div class="task-viewer-container">
      <div class="tree-bar-container col-3">
        <Tree
          :value="root"
          selectionMode="single"
          v-model:selectionKeys="selectedNode"
          @node-select="onNodeSelect"
          :loading="loading"
          class="task-tree-container"
        >
          <template #default="{ node }: any">
            <span :style="'color: ' + node.colour" class="p-mx-1 type-icon">
              <i :class="node.treeIcon" aria-hidden="true" />
            </span>
            <span>{{ node.label }}</span>
          </template>
        </Tree>
        <Button label="Create task" @click="createTask" />
      </div>
      <div class="col">
        <div class="tabView">
          <div class="header-container"><ParentHeader :concept-iri="selected.key" @show-details="showDetails" /></div>
          <ExpansionTable :contents="selected.contents" :loading="loading" :show-actions="true" @show-details="showDetails" class="tab-container" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, Ref, watch } from "vue";
import ExpansionTable from "./ExpansionTable.vue";
import ParentHeader from "./ParentHeader.vue";
import { ConceptTypeMethods, DataTypeCheckers } from "@im-library/helpers";
import { IM, RDF } from "@im-library/vocabulary";
import { EntityService } from "@/services";
import { useRoute, useRouter } from "vue-router";

const { getColourFromType, getFAIconFromType } = ConceptTypeMethods;
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;

const props = defineProps({
  data: { type: Object, required: true }
});
const emit = defineEmits({
  showDetails: (_payload: string) => true,
  updateSelected: (_payload: string) => true
});

const router = useRouter();
const route = useRoute();

const isTaskSelected = computed(() => isObjectHasKeys(selected.value) && selected.value.type === "task");

watch(
  () => route.params.taskIri,
  () => init()
);

const root: Ref<any[]> = ref([]);
const selectedNode: Ref<any> = ref({});
const selected: Ref<any> = ref({});
const loading = ref(true);
const tasks: Ref<any[]> = ref([]);

onUnmounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});
function showDetails(selectedIri: string) {
  emit("showDetails", selectedIri);
}

async function init() {
  await getTasks();
}

async function getTasks() {
  root.value = [];
  const results = (await EntityService.getEntityChildren(IM.MODULE_TASKS)) as any[];
  for (const node of results) {
    node.children = [];
    node.key = node["@id"];
    node.treeIcon = getFAIconFromType(node.type);
    node.colour = getColourFromType(node.type);
    node.type = "task";
    node.label = node.name;
    const children = (await EntityService.getEntityChildren(node["@id"])) as any[];
    node.children = children.map(child => {
      return {
        key: child["@id"],
        label: child.name,
        data: child["@id"],
        children: [],
        type: child.type,
        treeIcon: getFAIconFromType(child.type),
        colour: getColourFromType(child.type),
        parentKey: node.key
      };
    });
    node.contents = getTableDataFromNodes(node.children);
  }
  root.value = results;
}

function getTableDataFromNodes(nodes: any) {
  if (!isArrayHasLength(nodes)) return [];
  return nodes.map((node: any) => {
    return {
      iri: node.data,
      name: node.label,
      type: node.type || node[RDF.TYPE],
      children: getTableDataFromNodes(node.children)
    };
  });
}

function createTask() {
  router.push({ name: "TaskDefinition", params: { iri: "" } });
}

function editTask(iri: string) {
  router.push({ name: "TaskDefinition", params: { iri: iri } });
}

function onNodeSelect(node: any) {
  selected.value = node;
  emit("updateSelected", node.key);
}
</script>

<style scoped>
.tree-bar-container {
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--surface-a);
}

.task-viewer-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  overflow: auto;
  position: relative;
  background-color: var(--surface-a);
}

.tab-container {
  height: calc(100vh - 23rem);
  overflow: auto;
}

.task-tree-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

.type-icon {
  padding-right: 0.5rem;
}

.header-container {
  display: flex;
  flex-flow: column nowrap;
}

.viewer-main-container {
  background-color: var(--surface-a);
}

.title {
  padding: 1rem 1rem 0 1rem;
}
</style>
