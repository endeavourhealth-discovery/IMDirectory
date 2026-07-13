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
          v-if="!column.semanticMap && !column.iri"
          class="add-button"
          icon="fa-solid fa-check"
          label="Select Map to output value "
          size="small"
          text
          @click="addSemanticMaps"
        />
        <template v-if="showSemanticMaps">
          <Select
            v-model="semanticMap"
            :options="semanticMapOptions"
            option-label="name"
            option-value="value"
            placeholder="Select map"
            type="text"
            @update:model-value="updateSemanticMap"
          />
        </template>
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
    </template>
  </div>
  <div v-if="column.case" class="case-editor">
    <div v-for="(when, whenIndex) in column.case.when" :key="whenIndex" class="case-display">
      <span class="gap-2">if</span>
      <span v-if="when.exists" class="pl-2">exists</span>
      <template v-else-if="!when.value">
        <WhereContentDisplay :depth="0" :index="0" :where="when" />
      </template>
      <template v-if="when.then && when.then.value">
        <span class="pl-2">then</span>
        <InputText v-model="when.then.value!" class="ml-2" placeholder="Value" style="width: 10rem" />
      </template>
      <Button class="delete-button" icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeWhen(whenIndex)" />
      <span class="pl-4 pt-2 flex items-center gap-2">
        <Button icon="fa-solid fa-plus" label="Add when" size="small" text @click="addWhen()" />
      </span>
    </div>
    <div class="pl-4 pt-2">
      <span class="pl-2">else</span>
      <InputText v-model="column.case!.else!.value" class="ml-2" placeholder="Else value" style="width: 10rem" />
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
import { Ref, ref } from "vue";

import type { Match, Node, Return, TTIriRef, UIProperty, When, Where } from "@endeavour/vue-library/models";

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
import { getMatchFromNodeRef, getPathNameFromMatch, getPathNameFromPropertyRef, getSemanticMapOptions, setPathGetNodeRef } from "@/helpers/buildQuery";
import { DataModelService } from "@/services";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
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
const semanticMap = ref();
const showSemanticMaps = ref(false);
const semanticMapOptions: Ref<any[]> = ref([]);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let whenIndex: number = 0;

function updateSemanticMap(val: any) {
  semanticMap.value = val;
  column.value.semanticMap = { iri: semanticMap.value } as TTIriRef;
  emit("updateMatch");
  if (semanticMap.value) {
    showSemanticMaps.value = false;
  }
}
async function addSemanticMaps() {
  const semanticMatch = cloneDeep(match.value);
  if (!semanticMatch.typeOf) semanticMatch.typeOf = props.baseType;
  semanticMapOptions.value = await getSemanticMapOptions(semanticMatch);
  showSemanticMaps.value = true;
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
  if (node.data.nodeRef) column.value!.nodeRef = node.data.nodeRef;
  let returnMatch;
  if (node.data.nodeRef) {
    returnMatch = getMatchFromNodeRef(match.value, node.data.nodeRef);
  } else returnMatch = match.value;
  if (!returnMatch) return;
  const fullPath = node.data.path;
  if (fullPath) {
    const nodeRef = setPathGetNodeRef(returnMatch, fullPath, true);
    if (nodeRef && node.data.nodeRef) {
      const propertyRef = nodeRef + "_" + node.data.iri.substring(node.data.iri.lastIndexOf("#") + 1);
      if (!returnMatch.return) returnMatch.return = [];
      returnMatch.return.push({
        nodeRef: nodeRef,
        iri: node.data.iri,
        as: propertyRef
      } as Return);
      delete column.value!.iri;
      column.value!.propertyRef = propertyRef;
    }
  }
  showPropertySelector.value = false;
  emit("updateMatch");
}

function updateUnits(val: any) {
  units.value = val;
  column.value.units = { iri: units.value } as TTIriRef;
  emit("updateMatch");
}

function addTruthValue() {
  if (!match.value.return) match.value.return = [];
  match.value.return.push({
    as: "matched",
    case: {
      when: [{ exists: true, then: { value: "1" } }],
      else: { value: "0" }
    }
  } as Return);
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
  selectedWhen.value = { then: {} };
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
</style>
