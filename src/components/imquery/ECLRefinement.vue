<template>
  <div v-if="boolGroup" class="refinement-container">
    <div>
      <BooleanEditor
        v-model:clause="where"
        v-model:parent="parent"
        :parentType="'Where'"
        :index="index"
        v-model:group="group"
        :parentOperator="parentOperator"
        :operator="operator"
        :isInAttributeGroup="isInAttributeGroup"
        :rootBool="rootBool"
        :clauseType="'Where'"
      />
    </div>

    <div class="nested-refinement-container">
      <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
        <ECLRefinement
          v-model:where="boolGroup![subIndex]"
          v-model:parent="where"
          v-model:parentGroup="group"
          :index="subIndex"
          :parentIndex="index"
          :isInAttributeGroup="isRoleGroup"
          :rootBool="false"
          :parentType="'Where'"
          :parentOperator="operator as Bool"
          :rootProperties="rootProperties"
          :propertySearch="propertySearch"
          :isValidPropertySearch="isValidPropertySearch"
          :canCheck="boolGroup!.length > 2"
          @rationalise="onRationalise"
        />
      </div>
      <div class="add-group">
        <Button
          type="button"
          icon="fa-solid fa-plus"
          label="Add attribute"
          data-testid="add-refinement-button"
          class="add-button"
          @click="addRefinementToGroup()"
        />
      </div>
    </div>
  </div>
  <div v-else class="single-refinement" @drop="onDrop($event, where, parent, index, 'Where')" @dragover="onDragOver($event, 'Where')">
    <div class="property-column">
      <div class="property-container">
        <Button
          icon="drag-icon fa-solid fa-grip-vertical"
          severity="secondary"
          text
          draggable="true"
          @dragstart="onDragStart(where, parent, index, 'Where')"
          @dragend="onDragEnd()"
        />
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            :inputId="'group' + index"
            name="Group"
            binary
            v-model="checked"
            data-testid="group-checkbox"
            @update:modelValue="onCheckGroupChange"
            v-tooltip="'Select to build boolean subgroup'"
          />
        </div>
        <div v-if="parentGroup.includes(index) && parentGroup.length > 1">
          <Button
            :label="index === parentGroup[0] ? '(' : index === parentGroup[parentGroup.length - 1] ? ')' : ''"
            :severity="'secondary'"
            v-tooltip="'Click to create boolean subgroup'"
            @click="onCreateSubgroup"
          />
        </div>
        <Select
          style="width: 4.5rem; min-height: 2.3rem"
          v-model="propertyConstraintOperator"
          :options="ConstraintOperatorOptions"
          option-label="label"
          option-value="value"
          @change="updatePropertyConstraint"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center">
              <div>{{ propertyConstraintOperator }}</div>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center" style="min-height: 1rem">
              <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
        <AutocompleteSearchBar
          :disabled="loadingProperty"
          v-model:selected="selectedProperty"
          :imQuery="propertySearch"
          :validEntityQuery="isValidPropertySearch"
          :rootEntities="rootProperties"
          @update:selected="updateProperty"
        />

        <Button v-if="where.invalid" icon="fa-solid fa-exclamation" severity="danger" v-tooltip="'Value is invalid for property'" />
        <Button @click.stop="deleteProperty" class="delete-button" icon="fa-solid fa-trash" />

        <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
        <Select style="width: 5rem" v-model="inNotIn" :options="operatorOptions" />
      </div>
    </div>
    <div class="value-column">
      <div v-for="(item, index) in where.is" :key="item.iri">
        <ECLRefinementValue
          :index="index"
          v-model:where="where"
          v-model:node="where.is![index]"
          :imQueryForValueSearch="imQueryForValueSearch!"
          :valueTreeRoots="valueTreeRoots"
          @deleteProperty="deleteProperty"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref, watch } from "vue";

import { IM, QUERY } from "vue-library/enums";
import { Bool } from "vue-library/enums";
import type { Match, QueryRequest, SearchResultSummary, Where } from "vue-library/interfaces";

import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { v4 } from "uuid";

import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import ECLRefinementValue from "@/components/imquery/ECLRefinementValue.vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import { ConstraintOperatorOptions } from "@/constants";
import {
  checkGroupChange,
  createNewBoolGroup,
  getBoolGroup,
  getBooleanOperator,
  getBooleanOptions,
  getIsRoleGroup,
  removeSubgroup
} from "@/helpers/buildQuery";
import { getConstraintOperator, manageRoleGroup, setConstraintOperator } from "@/helpers/buildQuery";
import { EclService, QueryService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  index: number;
  rootBool: boolean;
  parentOperator?: Bool;
  parentType: string;
  isInAttributeGroup: boolean;
  canCheck?: boolean;
  propertySearch?: QueryRequest;
  isValidPropertySearch?: QueryRequest;
  rootProperties?: string[];
  parentIndex: number;
}

const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const parent = defineModel<Where | Match>("parent", { required: true });
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const emit = defineEmits(["updateBool", "rationalise", "createSubgroup"]);
const group: Ref<number[]> = ref([]);
const checked: Ref<boolean> = computed(() => parentGroup.value.includes(props.index));
const checkUngroup: Ref<boolean> = ref(false);
const toast = useToast();
const filterStore = useFilterStore();
const forceValidation = inject("forceValidation") as Ref<boolean>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or"] as const;
const selectedProperty: Ref<SearchResultSummary | undefined> = ref(where.value as SearchResultSummary | undefined);
const loadingProperty = ref(true);
const valueTreeRoots: Ref<string[]> = ref([IM.ONTOLOGY_PARENT_FOLDER]);
const isRoleGroup = computed(() => getIsRoleGroup(where.value));
const operatorOptions = ["=", "!="];
const hover = ref();
const propertyConstraintOperator: Ref<string | undefined> = ref<"<<">();
const operator = computed(() => {
  return getBooleanOperator("Where", where.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Where", where.value);
});
const inNotIn = computed(() => {
  if (where.value.not) return "!=";
  else return "=";
});
const hasSubgroups = computed(() => {
  return !!(where.value.and || where.value.or);
});
const imQueryForValueSearch: Ref<QueryRequest | undefined> = ref(undefined);

onMounted(async () => {
  loadingProperty.value = true;
  processProps();
  loadingProperty.value = false;
});

function getWhereBooleans(): Where[] {
  if (where.value.or) return where.value.or;
  if (where.value.and) return where.value.and;
  return [];
}

function onRemoveSubgroup() {
  removeSubgroup(where.value, parent.value as Where, props.index);
  parentGroup.value = [];
}
function onRationalise() {
  emit("rationalise");
}

function addRefinementToGroup() {
  const newWhere = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  if (where.value.and) {
    if (where.value.and) where.value.and.push(newWhere);
  } else if (where.value.or) where.value.or.push(newWhere);
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
}

function deleteProperty() {
  if (props.parentType === "Match") {
    delete (parent.value! as Match).where;
  } else {
    if (parent.value) {
      const operator = props.parentOperator as keyof Where;
      if ((parent.value as Where)[operator]) {
        ((parent.value as Where)[operator] as Where[]).splice(props.index, 1);
        if (((parent.value as Where)[operator] as Where[]).length === 0) {
          delete (parent.value as Where)[operator];
          emit("rationalise");
        }
      }
    }
  }
  emit("rationalise");
}

function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}

function updateOperator(val: string) {
  if (val === "or" && where.value.and) {
    where.value.or = where.value.and;
    delete where.value.and;
  } else if (val === "and" && where.value.or) {
    where.value.and = where.value.or;
    delete where.value.or;
  }
}

function updatePropertyConstraint(e: { value: string }) {
  setConstraintOperator(where.value, e.value);
}

function processProps() {
  processPropertyProp();
}

function processPropertyProp() {
  if (where.value.iri) {
    selectedProperty.value = { iri: where.value.iri, name: where.value.name } as SearchResultSummary;
    propertyConstraintOperator.value = getConstraintOperator(where.value);
  } else {
    selectedProperty.value = undefined;
    propertyConstraintOperator.value = "<<";
  }
}
function onCreateSubgroup() {
  createNewBoolGroup(parent.value as Where, parentGroup.value);
}

async function updateProperty(property: SearchResultSummary | undefined) {
  if (!property) {
    delete where.value.iri;
    delete where.value.name;
    where.value.invalid = false;
  } else {
    where.value.iri = property.iri;
    where.value.name = property.name;
    where.value.invalid = false;
  }
}
</script>

<style scoped>
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

.refinement-container {
  padding: 0;
  margin: 0.5rem;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  width: 100%;
}
.single-refinement {
  padding: 0;
  margin: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  width: 98%;
}
.nested-refinement-container {
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
.property-column {
  flex: 1;
}
.value-column {
  flex: 1;
}
.check-help {
  margin-left: 5rem;
  margin-top: 0.5rem;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.property-container {
  flex: 1 0 auto;
  flex-flow: row nowrap;
  display: flex;
  overflow: auto;
  align-items: first baseline;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-right: 0.5rem;
  align-items: center;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}

.check-ungroup {
  margin-left: 1rem;
  margin-right: 1rem;
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

.builder-button {
  width: 2rem;
}
</style>
