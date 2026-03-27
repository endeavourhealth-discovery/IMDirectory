<template>
  <div v-if="boolGroup">
    <BooleanEditor
      v-model:clause="match"
      v-model:parent="parent"
      :parentType="'Match'"
      :index="index"
      v-model:group="group"
      :parentOperator="parentOperator as Bool"
      :operator="operator"
      :rootBool="rootBool"
      :clauseType="'Match'"
    />

    <div class="nested-match-container">
      <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
        <ECLExpressionConstraint
          v-model:match="boolGroup![subIndex]"
          v-model:parent="match"
          v-model:parentGroup="group"
          :index="subIndex"
          :parentIndex="index"
          :parentOperator="operator"
          @rationalise="onRationalise"
          :rootBool="false"
          :activeInputId="activeInputId"
          :canCheck="boolGroup!.length > 2"
          @activateInput="activeInputId = $event"
        />
      </div>
      <div>
        <Button type="button" icon="fa-solid fa-plus" label="Add concept" data-testid="add-bool-concept-button" class="add-button" @click.stop="addConcept()" />
      </div>
    </div>
    <div v-if="boolGroup" class="add-group">
      <Button
        type="button"
        icon="fa-solid fa-plus"
        label="Add attribute to concept group"
        data-testid="add-refinement-button"
        class="add-button"
        @click="addRefinement()"
      />
    </div>
    <div v-if="match.where && rootProperties">
      <span>With these attributes:</span>
      <ECLRefinement
        v-model:where="match.where"
        v-model:parent="match"
        :index="0"
        :parentIndex="0"
        :rootBool="true"
        :isInAttributeGroup="isRoleGroup"
        :rootProperties="rootProperties"
        :propertySearch="propertyFilter"
        :isValidPropertySearch="isValidPropertySearch"
        :parentType="'Match'"
        @rationalise="onRationalise"
      />
    </div>
  </div>
  <div v-else class="expression-constraint" @drop="onDrop($event, match, parent, index, 'Match')" @dragover="onDragOver($event, 'Match')">
    <div>
      <Button
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        draggable="true"
        @dragstart="onDragStart(match, parent, index, 'Match')"
        @dragend="onDragEnd()"
      />
    </div>

    <div v-if="parentOperator">
      <Select
        :disabled="parentGroup.length > 0 && (!parentGroup.includes(index) || parentGroup.length === 1)"
        :class="'exclusion-selector'"
        :modelValue="notExists"
        :options="getExclusionOptions()"
        option-label="label"
        option-value="value"
        data-testid="operator-selector"
        @update:modelValue="val => updateExclusion(val)"
      >
        <template #option="slotProps">
          <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
            <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
    </div>

    <div v-if="match.is">
      <div class="instance-of">
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            :inputId="'group' + index"
            name="Group"
            binary
            v-model="subgroupCheck"
            data-testid="group-checkbox"
            @update:modelValue="onCheckGroupChange"
            v-tooltip="'Select to build boolean subgroup'"
          />
        </div>
        <div v-if="parentGroup.includes(index) && parentGroup.length > 1">
          <Button
            :label="index === parentGroup[0] ? '(' : ')'"
            :severity="'secondary'"
            v-tooltip="'Click to create boolean subgroup'"
            @click="onCreateSubgroup"
          />
        </div>
        <div class="concept-selector-container">
          <ConceptSelector
            v-model:node="match.is[0]"
            :parent="parent"
            :activeInputId="activeInputId"
            @activateInput="emit('activateInput', $event)"
            @update-match="updateMatch"
          />
        </div>
        <div v-if="match.is[0].invalid">
          <Button icon="fa-solid fa-exclamation" severity="danger" v-tooltip="'Value is invalid for property'" />
        </div>
        <div class="add-group">
          <Button type="button" icon="fa-solid fa-plus" label="Add attribute" data-testid="add-refinement-button" class="add-button" @click="addRefinement()" />
        </div>
        <div class="add-group">
          <Button @click.stop="deleteMatch" class="delete-button" icon="fa-solid fa-trash" />
        </div>
      </div>
      <div v-if="match.where && rootProperties">
        <span>With these attributes:</span>
        <ECLRefinement
          v-model:where="match.where"
          v-model:parent="match"
          :index="0"
          :parentIndex="0"
          :rootBool="true"
          :isInAttributeGroup="isRoleGroup"
          :rootProperties="rootProperties"
          :propertySearch="propertyFilter"
          :isValidPropertySearch="isValidPropertySearch"
          :parentType="'Match'"
          @rationalise="onRationalise"
        />
      </div>
    </div>
  </div>
  <div v-if="rootBool && !boolGroup">
    <Button type="button" icon="fa-solid fa-plus" label="Add concept" data-testid="add-bool-concept-button" class="add-button" @click.stop="addConcept()" />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, computed, watch } from "vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import { Match, Where, Node, QueryRequest, TTIriRef } from "vue-library/interfaces";
import { Bool } from "vue-library/enums";
import ECLRefinement from "@/components/imquery/ECLRefinement.vue";
import { onDragStart, onDragEnd, onDragOver, onDrop } from "@/composables/useDragContext";
import {
  addConceptToGroup,
  addRefinementToGroup,
  checkGroupChange,
  createNewBoolGroup,
  getBooleanOperator,
  getBoolGroup,
  getExclusionOptions,
  getIsRoleGroup,
  manageRoleGroup,
  updateFocusConcepts
} from "@/helpers/buildQuery";
import { v4 } from "uuid";
import { QUERY } from "vue-library/enums";
import { QueryService } from "@/services";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool: boolean;
  includeSubtypes?: boolean;
  canCheck?: boolean;
  parentIndex: number;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match | undefined>("parent") as Ref<Match | undefined>;
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const activeInputId = defineModel<string>("activeInputId", { default: "" });
const group: Ref<number[]> = ref([]);
const emit = defineEmits(["updateBool", "rationalise", "activateInput", "includeSubtypesChanged"]);
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
const notExists = computed(() => {
  if (!match.value.notExists) return false;
  return match.value.notExists;
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
  createNewBoolGroup(parent.value as Match, parentGroup.value);
  parentGroup.value = [];
}

function init() {
  if (!match.value.uuid) match.value.uuid = v4();
  if (!match.value.or && !match.value.and && !match.value.is) {
    match.value.is = [{ descendantsOrSelfOf: true } as Node];
  }
  if (!match.value.notExists) match.value.notExists = false;
  maintainFocusConcepts();
}

function addConcept() {
  addConceptToGroup(match.value);
  maintainFocusConcepts();
}
function updateExclusion(val: boolean) {
  match.value.notExists = val;
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
    const operator = props.parentOperator as keyof Match;
    if (parent.value[operator]) {
      (parent.value[operator] as Match[]).splice(props.index, 1);
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
    propertyFilter.value = {
      query: { iri: QUERY.ENTITY_FILTER },
      argument: [
        {
          parameter: "entities",
          valueIriList: allowableProperties.entities
        }
      ]
    };
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
  flex: 1 1 0%;
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
  flex: 1 1 0%;
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
  flex: 1 1 0%;
  min-width: 70vw;
}

.add-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
  padding: 4px 0 0 4px;
}

.builder-button {
  width: 2rem;
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
.subtypes-checkbox {
  padding-right: 0.5rem;
}
.dropdown-labels {
  min-height: 1rem;
  font-size: 1rem;
}
</style>
