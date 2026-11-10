<template>
  <div v-if="boolGroup">
    <BooleanEditor
      v-model:clause="match"
      v-model:group="group"
      v-model:parent="parent"
      :clauseType="'Match'"
      :eclQuery="true"
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
          :canUngroup="boolGroup!.length > 1 && !rootBool"
          :index="subIndex"
          :parentIndex="index"
          :parentOperator="operator"
          :rootBool="false"
          @activateInput="activeInputId = $event"
          @rationalise="onRationalise"
          @ungroup="onUngroup"
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
    <div class="flex items-center">
      <Button
        draggable="true"
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        @dragend="onDragEnd()"
        @dragstart="onDragStart(match, parent, index, 'Match')"
      />
    </div>

    <div v-if="parentOperator" class="flex shrink-0 flex-row items-center gap-1">
      <div>
        <Select
          :class="'operator-selector'"
          :modelValue="parentOperator"
          :options="getBooleanOptions('match', index)"
          option-label="label"
          option-value="value"
          @update:modelValue="updateOperator"
        >
          <template #option="slotProps">
            <div v-tooltip="slotProps.option.tooltip" class="dropdown-labels flex items-center">
              <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
      </div>
      <div>
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
    </div>

    <div v-if="match.is">
      <div class="instance-of">
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            v-model="subgroupCheck"
            v-tooltip="`Select to add to a ${subOperator} subgroup`"
            :inputId="'group' + index"
            binary
            data-testid="group-checkbox"
            name="Group"
            @update:modelValue="onCheckGroupChange"
          />
          <Button
            v-if="canSubGroup"
            v-tooltip="`Click to create ${subOperator} subgroup from checked entries`"
            label="{}"
            text
            @click.stop="createSubgroup()"
          />
        </div>
        <div v-else-if="canUngroup">
          <Button v-tooltip="`Click to revert to  ${subOperator}`" label="}{" text @click.stop="ungroup()" />
        </div>

        <!--
        <div v-if="parentGroup.includes(index) && parentGroup.length > 1">
          <Button
            v-tooltip="'Click to create boolean subgroup'"
            :label="index === parentGroup[0] ? '(' : ')'"
            :severity="'secondary'"
            @click="onCreateSubgroup"
          />
        </div>
        -->
        <div class="concept-selector-container">
          <ConceptSelector ref="conceptSelector" v-model:node="match.is" :parent="parent" @update-match="updateMatch" />
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

<script lang="ts">
import { ref as moduleRef } from "vue";

const pendingFocusUuid = moduleRef<string | undefined>();
</script>

<script lang="ts" setup>
import { Ref, computed, nextTick, onMounted, ref, watch } from "vue";

import { Bool, Entail, QUERY } from "@endeavour/vue-library/enums";
import { type Node, Query, type QueryRequest, type TTIriRef, type Where } from "@endeavour/vue-library/models";

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
  getBooleanOptions,
  getExclusionOptions,
  getIsRoleGroup,
  manageRoleGroup,
  removeSubgroup,
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
  canUngroup?: boolean;
  parentIndex: number;
  autoFocus?: boolean;
}
type BooleanOperator = "and" | "or";
const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: () => ({}) });
const parent = defineModel<Query | undefined>("parent") as Ref<Query | undefined>;
const parentGroup = defineModel<number[]>("parentGroup", { default: () => [] });
const activeInputId = defineModel<string>("activeInputId", { default: "" });
const exclude = defineModel<boolean>("exclude", { default: false });
const group: Ref<number[]> = ref([]);
const emit = defineEmits<{
  (e: "updateBool"): void;
  (e: "rationalise"): void;
  (e: "activateInput", value: string): void;
  (e: "includeSubtypesChanged"): void;
  (e: "ungroup"): void;
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
const canSubGroup = computed(() => {
  return parentGroup.value.length > 1;
});
const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});
const conceptSelector = ref<{ focus: () => void } | null>(null);
const subOperator = computed(() => {
  if (props.parentOperator === Bool.or) return "AND";
  else return "OR";
});

onMounted(() => {
  init();
  if (props.autoFocus || (pendingFocusUuid.value && pendingFocusUuid.value === match.value.uuid)) claimFocus();
});

// Handles focus requests for instances that are already mounted (e.g. passed down from a parent bool group)
watch(pendingFocusUuid, uuid => {
  if (uuid && uuid === match.value.uuid) claimFocus();
});

function updateOperator(val: BooleanOperator) {
  const query = parent.value as Query;
  if (query.or) {
    query.and = query.or;
    delete query.or;
  } else {
    query.or = query.and;
    delete query.and;
  }
}

function claimFocus() {
  pendingFocusUuid.value = undefined;
  if (match.value.is) nextTick(() => conceptSelector.value?.focus());
  else if (boolGroup.value?.length) pendingFocusUuid.value = boolGroup.value[0].uuid;
}

watch(isRoleGroup, (newValue, oldValue) => {
  if (newValue != oldValue) {
    if (match.value.where) {
      manageRoleGroup(match.value.where, newValue);
    }
  }
});
function createSubgroup() {
  createNewBoolGroup(parent.value as Query, parentGroup.value);
  parentGroup.value = [];
}
function onUngroup() {
  removeSubgroup(match.value, parent.value as Where, props.index);
  group.value = [];
}

function ungroup() {
  emit("ungroup");
}

function init() {
  if (!match.value.uuid) match.value.uuid = v4();
  if (!match.value.or && !match.value.and && !match.value.is) {
    match.value.is = { entails: Entail.descendantsOrSelfOf } as Node;
  }
  maintainFocusConcepts();
}

function addConcept() {
  addConceptToGroup(match.value);
  if (match.value.is) {
    pendingFocusUuid.value = match.value.uuid;
    nextTick(() => conceptSelector.value?.focus());
  } else {
    const items = match.value.or ?? match.value.and;
    pendingFocusUuid.value = items?.[items.length - 1]?.uuid;
  }
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
    emit("rationalise");
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
  const where = { uuid: v4(), entails: Entail.descendantsOrSelfOf, is: [{ entails: Entail.descendantsOrSelfOf }] } as Where;
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
    } as QueryRequest;
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
