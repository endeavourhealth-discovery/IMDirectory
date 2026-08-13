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
      :label="`${match.notExists ? 'Exclude' : 'Include'} if true (click to change)`"
      class="p-button-text p-button-rounded"
      @click="toggleNotExists"
    />
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
            :mustKeep="mustKeep"
            :parentOperator="parentOperator"
            :showEditor="showEditor"
            @addLinked="emit('addLinked')"
            @addTest="activeTab = 'test'"
            @cancel="emit('cancel')"
            @deleteMatch="emit('deleteMatch')"
            @deleteWhere="onDeleteWhere"
            @saveChanges="emit('saveChanges', $event)"
            @delete-then="onDeleteThen"
            @update-match="onUpdate"
            @edit-test="activeTab = 'test'"
            @update:match="onUpdate"
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
import { isArrayHasLength, isArrayOf } from "@endeavour/vue-library/helpers";
import { type Node, Query, QuerySchema, type TTIriRef, isTTIriRef } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";

import WhereEditor from "@/components/imquery/WhereEditor.vue";
import { EntityService, QueryService } from "@/services";

interface Props {
  baseType: Node;
  depth: number;
  index: number;
  isStep?: boolean;
  parentOperator?: Bool;
  mustKeep?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: {} });
const showEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges", match: Query): void;
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
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Query>>>;

const toggleNotExists = () => {
  if (match.value.notExists === undefined) {
    match.value.notExists = true;
  } else {
    match.value.notExists = false;
  }
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
  updateKeepAs(oldVal);
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
function updateKeepAs(oldVal: Query) {
  if (oldVal.as) {
    delete keepAs.value[oldVal.as];
  }
  if (match.value.as) {
    keepAs.value[match.value.as] = match;
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
    if (isArrayOf(entity[IM.FUNCTION_TEMPLATE], isTTIriRef)) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map(functionTemplate => functionTemplate.iri);
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
.description {
  padding-right: 1rem;
}
.match-description {
  width: 50rem;
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
