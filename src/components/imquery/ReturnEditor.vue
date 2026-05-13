<template>
  <div class="return-editor">
    <div class="return-column-editor">
      <div class="as-editor font-bold">Column name</div>
      <div class="property-display font-bold">Property / Logic</div>
    </div>
    <template v-if="match.return">
      <div v-for="(item, rIndex) in match.return" :key="rIndex" class="return-column-editor">
        <div class="as-editor">
          <InputText v-model="item.as" class="w-full" placeholder="Column name" />
        </div>
        <div class="property-display flex items-center gap-2">
          <template v-if="!item.case">
            <template v-if="item.nodeRef">
              <span v-if="item.nodeRef" class="font-medium">{{ getPathName(match, item.nodeRef) }}</span>
            </template>
            <template v-else-if="item.iri">
              <IMViewerLink :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              <template v-if="uiProperties[item.iri] && uiProperties[item.iri].unitOptions">
                <Select
                  v-model="units"
                  :options="uiProperties[item.iri].unitOptions"
                  option-label="name"
                  option-value="iri"
                  placeholder="re"
                  type="text"
                  @update:model-value="updateUnits(rIndex)"
                />
              </template>
            </template>
            <template v-else-if="item.function">
              <FunctionClauseDisplay :functionClause="item.function" />
            </template>
            <span v-else>
              <Button
                :label="item.iri || item.nodeRef ? '' : 'Select property'"
                class="add-button"
                icon="fa-solid fa-tree"
                size="small"
                text
                @click="openPropertySelector(item)"
              />
              <Button
                v-if="!item.case"
                class="add-button"
                icon="fa-solid fa-code-branch"
                label="or Add conditional values (case)"
                size="small"
                text
                @click="addCase(rIndex)"
              />
            </span>
          </template>
        </div>

        <div v-if="item.case" class="case-editor">
          <div v-for="(when, whenIndex) in item.case.when" :key="whenIndex" class="case-display">
            <span class="gap-2">if</span>
            <span v-if="when.exists" class="pl-2">exists</span>
            <template v-else-if="when.where">
              <WhereContentDisplay :depth="0" :index="0" :where="when.where" />
            </template>
            <span class="pl-2">then</span>
            <InputText v-model="when.then" class="ml-2" placeholder="Value" style="width: 10rem" />
            <Button class="delete-button" icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeWhen(rIndex, whenIndex)" />
            <span class="pl-4 pt-2 flex items-center gap-2">
              <Button icon="fa-solid fa-plus" label="Add when" size="small" text @click="addWhen(rIndex)" />
            </span>
          </div>
          <div class="pl-4 pt-2">
            <span class="pl-2">else</span>
            <InputText v-model="item.case.else" class="ml-2" placeholder="Else value" style="width: 10rem" />
          </div>
        </div>
        <template v-if="item.return">
          <span>{</span>
          <ReturnEditor v-model:returns="item.return" :baseType="baseType" :match="match" />
          <span>}</span>
        </template>
        <div class="flex gap-2 ml-auto">
          <Button class="delete-button" icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeReturn(rIndex)" />
        </div>
      </div>
    </template>
    <div>
      <Button class="add-button" icon="fa-solid fa-plus" label="Add column" size="small" @click="addColumn" />
    </div>
    <div>
      <Button class="add-button" icon="fa-solid fa-check" label="Add truth value" size="small" text @click="addTruthValue" />
    </div>
  </div>

  <PropertySelector
    v-if="showPropertySelector && selectedReturn"
    v-model:match="match"
    v-model:return="selectedReturn"
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
    @cancel="showWhenEditor = false"
    @saveCondition="onSaveWhenWhere"
  />
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import type { Match, Node, Return, TTIriRef, UIProperty, When, Where } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { TreeNode } from "primevue/treenode";

import PropertySelector from "@/components/imquery/PropertySelector.vue";
import WhenEditor from "@/components/imquery/WhenEditor.vue";
import WhereContentDisplay from "@/components/imquery/WhereContentDisplay.vue";
import FunctionClauseDisplay from "@/components/query/viewer/FunctionClauseDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getPathName } from "@/helpers/buildQuery";
import { DataModelService } from "@/services";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
  addProperty: [where: Where];
  updateMatch: [];
}>();

const uiProperties: Ref<Record<string, UIProperty>> = ref({});
const showPropertySelector = ref(false);
const showWhenEditor = ref(false);
const selectedReturn = ref<Return | undefined>();
const selectedWhen: Ref<When | undefined> = ref();
const units: Ref<string | undefined> = ref();
let returnIndex: number = 0;
let whenIndex: number = 0;

async function onSelectedProperty(node: TreeNode) {
  const uiProperty = await DataModelService.getUIProperty(node.data.typeOf, node.data.iri);
  if (uiProperty) {
    uiProperties.value[node.data.iri!] = uiProperty;
  }
  selectedReturn.value!.iri = node.data.iri;
  showPropertySelector.value = false;
  emit("updateMatch");
}

function updateUnits(rIndex: number) {
  if (!match.value.return) return;
  match.value.return[rIndex].units = { iri: units.value } as TTIriRef;
  emit("updateMatch");
}
function addColumn() {
  if (!match.value.return) match.value.return = [];
  const returnIndex = match.value.return.length - 1;
  match.value.return.push({ as: "new_column_" + returnIndex } as Return);
  emit("updateMatch");
}

function addTruthValue() {
  if (!match.value.return) match.value.return = [];
  match.value.return.push({
    as: "matched",
    case: {
      when: [{ exists: true, then: "1" }],
      else: "0"
    }
  } as Return);
  emit("updateMatch");
}

function removeReturn(index: number) {
  match.value.return!.splice(index, 1);
  selectedWhen.value = undefined;
  emit("updateMatch");
}

function openPropertySelector(item: Return) {
  selectedReturn.value = item;
  showPropertySelector.value = true;
}
async function onSaveWhenWhere(when: When) {
  const ret = match.value?.return?.[returnIndex];
  const whenArr = ret?.case?.when;
  if (!whenArr || !whenArr[whenIndex]) return;
  whenArr[whenIndex] = when;
  emit("updateMatch");
}

function addCase(rIndex: number) {
  if (match.value.return && match.value.return[rIndex]) match.value.return[returnIndex].case = { when: [], else: "" };
  addWhen(rIndex);
}

function addWhen(rIndex: number) {
  returnIndex = rIndex;
  let ret = match.value?.return?.[returnIndex];
  if (ret) {
    if (!ret.case) ret.case = { when: [], else: "" };
    if (!ret.case.when) ret.case.when = [];
    selectedWhen.value = { then: "" };
    ret.case.when.push(selectedWhen.value);
    whenIndex = ret.case.when.length - 1;
    showWhenEditor.value = true;
  }
  emit("updateMatch");
}

function removeWhen(rIndex: number, wIndex: number) {
  showWhenEditor.value = false;
  match.value.return![rIndex]!.case!.when!.splice(wIndex, 1);
  if (match.value.return![rIndex]!.case!.when!.length === 0) {
    delete match.value.return![rIndex]!.case;
  }
}
</script>

<style scoped>
.return-editor {
  max-height: 90%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.return-column-editor {
  display: flex;
  width: 100%;
  flex-direction: row;
}
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
