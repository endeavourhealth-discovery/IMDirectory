<template>
  <div v-if="boolGroup">
    <BooleanEditor
      v-model:clause="match"
      v-model:group="group"
      v-model:parent="parent"
      :clauseType="'Match'"
      :index="index"
      :operator="operator"
      :parentOperator="parentOperator as Bool"
      :parentType="'Match'"
      :rootBool="rootBool"
    />

    <div class="nested-match-container">
      <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
        <ECLExpressionConstraint
          v-model:match="boolGroup![subIndex] as Query"
          v-model:parent="match"
          v-model:parentGroup="group"
          :activeInputId="activeInputId"
          :canCheck="boolGroup!.length > 2"
          :index="subIndex"
          :parentIndex="index"
          :parentOperator="operator"
          :rootBool="false"
          @activateInput="activeInputId = $event"
          @rationalise="onRationalise"
        />
      </div>
      <div>
        <Button class="add-button" data-testid="add-bool-concept-button" icon="fa-solid fa-plus" label="Add concept" type="button" @click.stop="addConcept()" />
      </div>
    </div>
    <div v-if="boolGroup" class="add-group">
      <Button
        class="add-button"
        data-testid="add-refinement-button"
        icon="fa-solid fa-plus"
        label="Add attribute to concept group"
        type="button"
        @click="addRefinement()"
      />
    </div>
    <div v-if="match.where && rootProperties">
      <span>With these attributes:</span>
      <ECLRefinement
        v-model:parent="match"
        v-model:where="match.where"
        :index="0"
        :isInAttributeGroup="isRoleGroup"
        :isValidPropertySearch="isValidPropertySearch"
        :parentIndex="0"
        :parentType="'Match'"
        :propertySearch="propertyFilter"
        :rootBool="true"
        :rootProperties="rootProperties"
        @rationalise="onRationalise"
      />
    </div>
  </div>
  <div v-else class="expression-constraint" @dragover="onDragOver($event, 'Match')" @drop="onDrop($event, match, parent, index, 'Match')">
    <div>
      <Button
        draggable="true"
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        @dragend="onDragEnd()"
        @dragstart="onDragStart(match, parent, index, 'Match')"
      />
    </div>

    <div v-if="parentOperator">
      <Select
        :class="'exclusion-selector'"
        :disabled="parentGroup.length > 0 && (!parentGroup.includes(index) || parentGroup.length === 1)"
        :modelValue="exclude"
        :options="getExclusionOptions()"
        data-testid="operator-selector"
        option-label="label"
        option-value="value"
        @update:modelValue="updateExclusion"
      >
        <template #option="slotProps">
          <div v-tooltip="slotProps.option.tooltip" class="dropdown-labels flex items-center" style="min-height: 1rem">
            <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
    </div>

    <div v-if="match.is">
      <div class="instance-of">
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            v-model="subgroupCheck"
            v-tooltip="'Select to build boolean subgroup'"
            :inputId="'group' + index"
            binary
            data-testid="group-checkbox"
            name="Group"
            @update:modelValue="onCheckGroupChange"
          />
        </div>
        <div v-if="parentGroup.includes(index) && parentGroup.length > 1">
          <Button
            v-tooltip="'Click to create boolean subgroup'"
            :label="index === parentGroup[0] ? '(' : ')'"
            :severity="'secondary'"
            @click="onCreateSubgroup"
          />
        </div>
        <div class="concept-selector-container">
          <ConceptSelector v-model:node="match.is" :activeInputId="activeInputId" :parent="parent" @update-match="updateMatch" />
        </div>
        <div v-if="match.is.invalid">
          <Button v-tooltip="'Value is invalid for property'" icon="fa-solid fa-exclamation" severity="danger" />
        </div>
        <div class="add-group">
          <Button class="add-button" data-testid="add-refinement-button" icon="fa-solid fa-plus" label="Add attribute" type="button" @click="addRefinement()" />
        </div>
        <div class="add-group">
          <Button class="delete-button" icon="fa-solid fa-trash" @click.stop="deleteMatch" />
        </div>
      </div>
      <div v-if="match.where && rootProperties">
        <span>With these attributes:</span>
        <ECLRefinement
          v-model:parent="match"
          v-model:where="match.where"
          :index="0"
          :isInAttributeGroup="isRoleGroup"
          :isValidPropertySearch="isValidPropertySearch"
          :parentIndex="0"
          :parentType="'Match'"
          :propertySearch="propertyFilter"
          :rootBool="true"
          :rootProperties="rootProperties"
          @rationalise="onRationalise"
        />
      </div>
    </div>
  </div>
  <div v-if="rootBool && !boolGroup">
    <Button class="add-button" data-testid="add-bool-concept-button" icon="fa-solid fa-plus" label="Add concept" type="button" @click.stop="addConcept()" />
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";

import { Bool, QUERY } from "@endeavour/vue-library/enums";
import { type Node, Query, type QueryRequest, QueryRequestSchema, type TTIriRef, type Where } from "@endeavour/vue-library/models";

import Button from "primevue/button";
import { v4 } from "uuid";

import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import ECLRefinement from "@/components/imquery/ECLRefinement.vue";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import {
  addConceptToGroup,
  checkGroupChange,
  createNewBoolGroup,
  getBoolGroup,
  getBooleanOperator,
  getExclusionOptions,
  getIsRoleGroup,
  manageRoleGroup,
  updateFocusConcepts
} from "@/helpers/buildQuery";
import { QueryService } from "@/services";

import ConceptSelector from "./ConceptSelector.vue";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool: boolean;
  includeSubtypes?: boolean;
  canCheck?: boolean;
  parentIndex: number;
}
const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: {} });
const parent = defineModel<Query | undefined>("parent") as Ref<Query | undefined>;
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const activeInputId = defineModel<string>("activeInputId", { default: "" });
const exclude = defineModel<boolean>("exclude", { default: false });
const group: Ref<number[]> = ref([]);
const emit = defineEmits<{
  (e: "updateBool"): void;
  (e: "rationalise"): void;
  (e: "includeSubtypesChanged"): void;
  (e: "updateExclusion", value: boolean): void;
}>();
const isRoleGroup = computed(() => getIsRoleGroup(match.value.where));
const propertySearch: Ref<QueryRequest | undefined> = ref(undefined);
const isValidPropertySearch: Ref<QueryRequest | undefined> = ref(undefined);
const propertyFilter: Ref<QueryRequest | undefined> = ref(undefined);
const rootProperties: Ref<string[]> = ref([]);
const subgroupCheck: Ref<boolean> = computed(() => parentGroup.value.includes(props.index));
const focusConcepts: Ref<TTIriRef[]> = ref([]);
const focusIris: Ref<string[]> = ref([]);
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});

onMounted(() => {
  init();
});

watch(isRoleGroup, (newValue, oldValue) => {
  if (newValue != oldValue) {
    if (match.value.where) {
      manageRoleGroup(match.value.where, newValue);
    }
  }
});
function onCreateSubgroup() {
  createNewBoolGroup(parent.value as Query, parentGroup.value);
  parentGroup.value = [];
}

function init() {
  if (!match.value.uuid) match.value.uuid = v4();
  if (!match.value.or && !match.value.and && !match.value.is) {
    match.value.is = { descendantsOrSelfOf: true } as Node;
  }
  maintainFocusConcepts();
}

function addConcept() {
  addConceptToGroup(match.value);
  maintainFocusConcepts();
}
function updateExclusion() {
  exclude.value = !exclude.value;
}

function updateMatch() {
  maintainFocusConcepts();
}

function onRationalise() {
  if (match.value.where) {
    if (match.value.where.or) {
      if (match.value.where.or.length === 1) match.value.where = match.value.where.or[0];
    } else if (match.value.where.and) {
      if (match.value.where.and.length === 1) match.value.where = match.value.where.and[0];
    } else if (!match.value.where.is) delete match.value.where;
  }
  emit("rationalise");
}

function deleteMatch() {
  if (!props.parentOperator) {
    delete match.value.is;
    maintainFocusConcepts();
    return;
  }
  if (parent.value) {
    const operator = props.parentOperator as keyof Query;
    if (parent.value[operator]) {
      (parent.value[operator] as Query[]).splice(props.index, 1);
    }
  }
}

function maintainFocusConcepts() {
  focusIris.value = updateFocusConcepts(match.value);
  focusConcepts.value = focusIris.value.map(iri => ({ iri }));
  if (match.value.where) {
    updateQueryForPropertySearch();
    updateIsValidPropertySearch();
  }
}

function addRefinement() {
  if (!propertySearch.value) {
    updateQueryForPropertySearch();
    updateIsValidPropertySearch();
  }
  const where = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  if (match.value.where) {
    if (match.value.where.and) match.value.where.and.push(where);
    else if (match.value.where.or) match.value.where.or.push(where);
    else {
      const boolWhere = { uuid: v4() } as Where;
      boolWhere.and = [match.value.where];
      boolWhere.and.push(where);
      match.value.where = boolWhere;
    }
  } else match.value.where = where;
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
}

function updateIsValidPropertySearch() {
  if (focusConcepts.value.length > 0) {
    isValidPropertySearch.value = {
      query: { iri: QUERY.IS_VALID_PROPERTY },
      argument: [
        {
          parameter: "concept",
          valueIriList: focusConcepts.value
        }
      ]
    } as QueryRequest;
  } else {
    isValidPropertySearch.value = {
      query: { iri: QUERY.IS_VALID_DESCENDANT },
      argument: [
        {
          parameter: "parent",
          valueIriList: [{ iri: "http://snomed.info/sct#410662002" }]
        }
      ]
    } as QueryRequest;
  }
}
async function updateQueryForPropertySearch() {
  if (!propertySearch.value) {
    if (focusConcepts.value.length > 0) {
      propertySearch.value = {
        query: { iri: QUERY.ALLOWABLE_PROPERTIES },
        argument: [
          {
            parameter: "this",
            valueIriList: focusConcepts.value
          }
        ]
      } as QueryRequest;
    } else {
      propertySearch.value = {
        query: { iri: QUERY.GET_DESCENDANTS },
        argument: [
          {
            parameter: "this",
            valueIriList: [{ iri: "http://snomed.info/sct#410662002" }]
          }
        ]
      } as QueryRequest;
    }
    const allowableProperties = await QueryService.queryIM(propertySearch.value);
    if (allowableProperties.entities) {
      rootProperties.value = allowableProperties.entities.map(e => e.iri);
    }
    propertyFilter.value = QueryRequestSchema.parse({
      query: { iri: QUERY.ENTITY_FILTER },
      argument: [
        {
          parameter: "entities",
          valueIriList: allowableProperties.entities
        }
      ]
    });
  }
}
</script>

<style scoped>
.add-button,
.delete-button {
  color: #444444;
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

.nested-match-container {
  display: flex;
  width: 99%;
  box-sizing: border-box;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}
.exclusion-selector {
  max-height: 10vh;
  width: 7.5rem;
}

.expression-constraint {
  width: 98%;
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  flex: 1 1 0;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}

.instance-of {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}

.concept-selector-container {
  flex: 1 1 0;
  min-width: 70vw;
}

.add-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
  padding: 4px 0 0 4px;
}

::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0;
  margin-right: 0;
}

::v-deep(.operator-selector .p-select-dropdown) {
  padding-left: 0;
  margin-left: 0;
}

::v-deep(.operator-selector-not .p-select-label) {
  color: var(--p-red-500) !important;
  font-size: 0.85rem;
}
</style>
