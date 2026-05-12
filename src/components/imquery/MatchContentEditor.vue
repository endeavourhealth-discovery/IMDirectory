<template>
  <div>
    <span class="description">Description</span>
    <InputText v-model="match.description" class="match-description" type="text" @update:model-value="updateDescription" />
  </div>
  <div>
    <Button
      v-tooltip="notExistsLabel"
      :class="match.notExists ? 'text-red-500' : 'text-green-500'"
      :icon="match.notExists ? 'pi pi-times' : 'pi pi-check'"
      class="p-button-text p-button-rounded"
      @click="toggleNotExists"
    />
    <span>{{ notExistsLabel }}</span>
  </div>
  <Tabs v-model:value="activeTab">
    <TabList>
      <Tab value="main">Main filter</Tab>
      <Tab v-if="match.orderBy" value="test">Post ordering tests</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="main">
        <div class="filter-editor">
          <WhereEditor
            v-model:match="match"
            :baseType="baseType"
            :clauseIndex="index"
            :depth="depth"
            :editingWhere="true"
            :parentOperator="parentOperator"
            :showEditor="showEditor"
            @addLinked="emit('addLinked')"
            @addTest="emit('addTest')"
            @cancel="emit('cancel')"
            @deleteMatch="emit('deleteMatch')"
            @deleteWhere="onDeleteWhere"
            @saveChanges="emit('saveChanges', $event)"
            @delete-then="onDeleteThen"
            @update-match="onUpdate"
            @edit-test="activeTab = 'test'"
          />
        </div>
      </TabPanel>
      <TabPanel value="test">
        <div class="filter-editor">
          <WhereEditor
            v-model:match="match"
            :baseType="baseType"
            :clauseIndex="index"
            :depth="depth"
            :editingThen="true"
            :parentOperator="parentOperator"
            :showEditor="showEditor"
            @addLinked="emit('addLinked')"
            @addTest="emit('addTest')"
            @cancel="emit('cancel')"
            @deleteMatch="emit('deleteMatch')"
            @deleteWhere="onDeleteThen"
            @saveChanges="emit('saveChanges', $event)"
            @update-match="onUpdate"
            @edit-main="activeTab = 'main'"
          />
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref, watch } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { Bool, DisplayMode, IM } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Match, Node, NodeShape, TTIriRef } from "@endeavour/vue-library/interfaces";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";
import WhereEditor from "@/components/imquery/WhereEditor.vue";
import { getBooleanOperator } from "@/helpers/buildQuery";
import { EntityService, QueryService } from "@/services";

interface Props {
  baseType: Node;
  depth: number;
  index: number;
  isStep?: boolean;
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const showEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addLinked"): void;
  (event: "addTest"): void;
  (event: "updateMatch"): void;
  (event: "editMain"): void;
}>();
const expandedKeys = ref<Record<string, boolean>>({});
const { onCopy, onCopyError } = useCopyToClipboard(ref(JSON.stringify(match.value)));
const showPropertySelector = ref(false);
const loading = ref(true);
const activeTab = ref("main");
const edited = ref(false);
const initialized = ref(false);
const showLinkedEditor = ref(false);
const keepAs = inject("keepAs") as Ref<Record<string, Match>>;
const whereOperator = computed(() => {
  return getBooleanOperator("Where", match.value.then ? match.value.then : match.value.where);
});

const toggleNotExists = () => {
  if (match.value.notExists === undefined) {
    match.value.notExists = true;
  } else {
    delete match.value.notExists;
  }
  edited.value = true;
  emit("updateMatch");
};

const notExistsLabel = computed(() => {
  if (match.value.notExists === undefined) {
    return "Click to exclude if true";
  }
  return match.value.notExists ? "Click to include if true" : "Click to exclude if true";
});

onMounted(async () => {
  await init();
});
watch(match.value, (newVal, oldVal) => {
  if (newVal === oldVal) return;
  edited.value = true;
  updateKeepAs(oldVal, newVal);
});
async function onUpdate() {
  edited.value = true;
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  emit("updateMatch");
}
function onDeleteWhere() {
  delete match.value.where;
  emit("deleteMatch");
}
function updateDescription() {
  edited.value = true;
  emit("updateMatch");
}
function updateScore() {
  edited.value = true;
  emit("updateMatch");
}
function updateKeepAs(oldVal: Match, newVal: Match) {
  if (oldVal.node) {
    delete keepAs.value[oldVal.node];
  }
  if (newVal.node) {
    keepAs.value[newVal.node] = newVal;
  }
}

async function init() {
  loading.value = true;
  match.value = cloneDeep(match.value);
  expandedKeys.value["0"] = true;
  loading.value = false;
  initialized.value = true;
}


async function getFunctionTemplates() {
  const iri = match.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    match.value!.orderBy = args.value;
  }
}
function onDeleteThen() {
  delete match.value.then;
}
</script>

<style scoped>
.match-container {
  box-sizing: border-box;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #fafafa;
  margin: 0.5rem;
  font-size: 1rem;

  /* Important for scrolling */
  height: 100%; /* fill parent height */
  overflow-y: auto; /* enable vertical scrolling */
  min-height: 0; /* allows flex parents to shrink properly */
}
.add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
}

.match-score {
  width: 20rem;
}
.description {
  padding-right: 1rem;
}
.name-display {
  width: 100%;
}
.description-container {
  display: flex;
  flex-flow: column;
}

.filter-editor {
  height: 60vh;
  display: flex;
  flex-flow: column;
  gap: 1rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
  min-height: 90vh;
  min-width: 90vh;
}

.test-dropdown {
  color: white;
}
.field {
  padding-right: 1rem;
}
</style>
