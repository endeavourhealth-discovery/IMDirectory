<template>
  <div class="as-editor">
    <InputText v-model="column.as" class="w-full" placeholder="Column name" @input="onInput" />
  </div>
  <div class="property-display flex items-center gap-2">
    <template v-if="!column.case">
      <template v-if="column.nodeRef">
        <span class="font-medium">{{ getPathNameFromMatch(match, column.nodeRef) }}</span>
        <span v-if="column.propertyRef">{{ getPathNameFromPropertyRef(match, column.nodeRef, column.propertyRef) }}</span>
      </template>
      <template v-if="column.iri">
        <IMViewerLink :iri="column.iri" :label="column.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        <template v-if="uiProperties[column.iri] && uiProperties[column.iri].unitOptions">
          <Select
            v-model="units"
            :options="uiProperties[column.iri].unitOptions"
            :placeholder="column.units ? column.units.name : 'Select unit'"
            option-label="name"
            option-value="iri"
            type="text"
            @update:model-value="updateUnits"
          />
        </template>
        <template v-else-if="column.units">( {{ column.units.name }} )</template>
      </template>
      <template v-else-if="column.function">
        <FunctionClauseDisplay :functionClause="column.function" />
      </template>
      <template v-else-if="!column.iri && !column.propertyRef && !column.case">
        <Button
          :label="column.iri || column.nodeRef ? '' : 'Select property'"
          class="add-button"
          icon="fa-solid fa-tree"
          size="small"
          text
          @click="openPropertySelector"
        />
        <Button class="add-button" icon="fa-solid fa-check" label="Add truth value" size="small" text @click="addTruthValue" />

        <Button
          v-if="!column.case"
          class="add-button"
          icon="fa-solid fa-code-branch"
          label="or Add conditional values (case)"
          size="small"
          text
          @click="addCase()"
        />
      </template>
      <template v-if="column.iri && semanticMaps">
        <span class="semantic-map-prompt">{{ semanticMapPrompt }}</span>
        <Select
          v-model="semanticMap"
          :options="semanticMaps"
          class="map-selector"
          option-label="name"
          option-value="iri"
          placeholder="Add output map "
          type="text"
          @update:model-value="updateSemanticMap"
        >
          <template #option="slotProps">
            <div>{{ slotProps.option.name }}</div>
          </template>
        </Select>
      </template>
    </template>
  </div>
  <div v-if="column.case" class="case-editor">
    <div v-for="(when, whenIndex) in column.case.when" :key="whenIndex" class="case-display">
      <span class="gap-2">if</span>
      <span v-if="when.exists" class="pl-2">exists</span>
      <template v-else-if="!when.value">
        <WhereContentDisplay :depth="0" :index="0" :where="when" />
      </template>
      <template v-if="when.then">
        <span class="pl-2">then</span>
        <InputText v-model="when.then.value" class="case-value" />
      </template>
      <Button class="delete-button" icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeWhen(whenIndex)" />
      <span class="pl-4 pt-2 flex items-center gap-2">
        <Button icon="fa-solid fa-plus" label="Add when" size="small" text @click="addWhen()" />
      </span>
    </div>
    <div class="pl-4 pt-2">
      <span class="pl-2">else</span>
      <InputText v-model="column.case!.else!.value" class="case-value" />
    </div>
  </div>
  <template v-if="column.return">
    <span>{</span>
    <ReturnEditor v-model:returns="column.return" :baseType="baseType" :match="match" />
    <span>}</span>
  </template>

  <PropertySelector
    v-if="showPropertySelector"
    v-model:match="match"
    v-model:return="column"
    v-model:showPropertySelector="showPropertySelector"
    :baseType="baseType"
    @cancel="showPropertySelector = false"
    @selectedProperty="onSelectedProperty"
  />

  <WhenEditor
    v-if="showWhenEditor"
    v-model:match="match"
    v-model:showCaseConditionEditor="showWhenEditor"
    v-model:when="selectedWhen"
    :baseType="baseType"
    @cancel="onCancelWhen"
    @saveCondition="onSaveWhenWhere"
  />
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref } from "vue";

import { type Node, Query, type Return, type TTIriRef, type UIProperty, type When, WhenSchema, type Where } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { TreeNode } from "primevue/treenode";

import PropertySelector from "@/components/imquery/PropertySelector.vue";
import ReturnEditor from "@/components/imquery/ReturnEditor.vue";
import WhenEditor from "@/components/imquery/WhenEditor.vue";
import WhereContentDisplay from "@/components/imquery/WhereContentDisplay.vue";
import FunctionClauseDisplay from "@/components/query/viewer/FunctionClauseDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getPathNameFromMatch, getPathNameFromPropertyRef, getSemanticMapOptions, setPathGetNodeRef } from "@/helpers/buildQuery";
import { DataModelService } from "@/services";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: {} });
const column = defineModel<Return>("column", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
  addProperty: [where: Where];
  updateMatch: [];
}>();

const uiProperties: Ref<Record<string, UIProperty>> = ref({});
const showPropertySelector = ref(false);
const showWhenEditor = ref(false);
const selectedWhen: Ref<When | undefined> = ref();
const units: Ref<string | undefined> = ref();
const semanticMap: Ref<string | undefined> = ref();
const semanticMaps: Ref<any[] | undefined> = ref();
const semanticMapPrompt = computed(() => {
  return !column.value.semanticMap ? "Output Map : (none) - select to add" : "Output map = ";
});
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let whenIndex: number = 0;

onMounted(async () => {
  if (column.value.semanticMap) semanticMap.value = column.value.semanticMap.iri;
  await findSemanticMaps();
});
function updateSemanticMap(val: any) {
  if (val && semanticMaps.value) {
    const map = semanticMaps.value.find(o => o.iri === val);
    column.value.semanticMap = { iri: val, name: map.name } as TTIriRef;
    //emit("updateMatch");
  }
}
async function findSemanticMaps() {
  const semanticMatch = cloneDeep(match.value);
  if (!column.value.iri) return;
  if (!semanticMatch.typeOf) semanticMatch.typeOf = props.baseType;
  semanticMaps.value = await getSemanticMapOptions(semanticMatch, props.baseType, column.value);
}
function onInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    emit("updateMatch");
  }, 500);
}

async function onSelectedProperty(node: TreeNode) {
  const uiProperty = await DataModelService.getUIProperty(node.data.typeOf, node.data.iri);
  if (uiProperty) {
    uiProperties.value[node.data.iri!] = uiProperty;
  }
  column.value!.iri = node.data.iri;
  if (node.data.path) column.value!.nodeRef = setPathGetNodeRef(match.value, node.data.path, true);
  await findSemanticMaps();
  showPropertySelector.value = false;
  emit("updateMatch");
}

function updateUnits(val: any) {
  units.value = val;
  column.value.units = { iri: units.value } as TTIriRef;
  emit("updateMatch");
}

function addTruthValue() {
  column.value.case = {
    when: [{ exists: true, then: { value: "1" } }],
    else: { value: "0" }
  };
  emit("updateMatch");
}

function openPropertySelector() {
  showPropertySelector.value = true;
}
async function onSaveWhenWhere(when: When) {
  const whenArr = column.value.case?.when;
  if (!whenArr || !whenArr[whenIndex]) return;
  whenArr[whenIndex] = when;
  emit("updateMatch");
}

function addCase() {
  column.value.case = { when: [], else: {} };
  addWhen();
}

function addWhen() {
  if (!column.value.case) column.value.case = { when: [], else: {} };
  if (!column.value.case.when) column.value.case.when = [];
  selectedWhen.value = WhenSchema.parse({ then: {} });
  column.value.case!.when!.push(selectedWhen.value);
  whenIndex = column.value.case!.when!.length - 1;
  showWhenEditor.value = true;
  emit("updateMatch");
}

function onCancelWhen() {
  const when = column.value.case!.when;
  if (when && when[whenIndex]) {
    when.splice(whenIndex, 1);
    if (when.length === 0) {
      delete column.value!.case;
    }
  }
  showWhenEditor.value = false;
  selectedWhen.value = undefined;
  emit("updateMatch");
}

function removeWhen(wIndex: number) {
  showWhenEditor.value = false;
  column.value.case!.when!.splice(wIndex, 1);
  if (column.value.case!.when!.length === 0) {
    delete column.value.case;
  }
}
</script>

<style scoped>
.case-editor {
  display: flex;
  flex-direction: column;
}
.case-display {
  display: flex;
  flex-direction: row;
}
.property-display {
  display: flex;
  flex-direction: row;
}
.as-editor {
  width: 15rem;
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
.map-selector {
  padding-left: 2rem;
  width: 30rem;
}
.semantic-map-prompt {
  padding-left: 20rem;
}
.case-value {
  width: 10rem;
}
</style>
