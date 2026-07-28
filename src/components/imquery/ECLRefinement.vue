<template>
  <div v-if="boolGroup" class="refinement-container">
    <div>
      <BooleanEditor
        v-model:clause="where"
        v-model:group="group"
        v-model:parent="parent"
        :clauseType="'Where'"
        :index="index"
        :isInAttributeGroup="isInAttributeGroup"
        :operator="operator"
        :parentOperator="parentOperator"
        :parentType="'Where'"
        :rootBool="rootBool"
      />
    </div>

    <div class="nested-refinement-container">
      <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
        <ECLRefinement
          v-model:parent="where"
          v-model:parentGroup="group"
          v-model:where="boolGroup![subIndex] as Where"
          :canCheck="boolGroup!.length > 2"
          :index="subIndex"
          :isInAttributeGroup="isRoleGroup"
          :isValidPropertySearch="isValidPropertySearch"
          :parentIndex="index"
          :parentOperator="operator as Bool"
          :parentType="'Where'"
          :propertySearch="propertySearch"
          :rootBool="false"
          :rootProperties="rootProperties"
          @rationalise="onRationalise"
        />
      </div>
      <div class="add-group">
        <Button
          class="add-button"
          data-testid="add-refinement-button"
          icon="fa-solid fa-plus"
          label="Add attribute"
          type="button"
          @click="addRefinementToGroup()"
        />
      </div>
    </div>
  </div>
  <div v-else class="single-refinement" @dragover="onDragOver($event, 'Where')" @drop="onDrop($event, where, parent, index, 'Where')">
    <div class="property-column">
      <div class="property-container">
        <Button
          draggable="true"
          icon="drag-icon fa-solid fa-grip-vertical"
          severity="secondary"
          text
          @dragend="onDragEnd()"
          @dragstart="onDragStart(where, parent, index, 'Where')"
        />
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            v-model="checked"
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
            :label="index === parentGroup[0] ? '(' : index === parentGroup[parentGroup.length - 1] ? ')' : ''"
            :severity="'secondary'"
            @click="onCreateSubgroup"
          />
        </div>
        <Select
          v-model="propertyConstraintOperator"
          :options="ConstraintOperatorOptions"
          option-label="label"
          option-value="value"
          style="width: 4.5rem; min-height: 2.3rem"
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
          v-model:selected="selectedProperty"
          :disabled="loadingProperty"
          :imQuery="propertySearch"
          :rootEntities="rootProperties"
          :validEntityQuery="isValidPropertySearch"
          @update:selected="updateProperty"
        />

        <Button v-if="where.invalid" v-tooltip="'Value is invalid for property'" icon="fa-solid fa-exclamation" severity="danger" />
        <Button class="delete-button" icon="fa-solid fa-trash" @click.stop="deleteProperty" />

        <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
        <Select v-model="inNotIn" :options="operatorOptions" style="width: 5rem" />
      </div>
    </div>
    <div class="value-column">
      <div v-for="(item, index) in where.is" :key="item.iri">
        <ECLRefinementValue
          v-model:node="where.is![index]"
          v-model:where="where"
          :imQueryForValueSearch="imQueryForValueSearch!"
          :index="index"
          :valueTreeRoots="valueTreeRoots"
          @deleteProperty="deleteProperty"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref } from "vue";

import { Bool, IM } from "@endeavour/vue-library/enums";
import {  Query, type QueryRequest, type SearchResultSummary, SearchResultSummarySchema, type Where } from "@endeavour/vue-library/models";

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
  getConstraintOperator,
  getIsRoleGroup,
  removeSubgroup,
  setConstraintOperator
} from "@/helpers/buildQuery";
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
const parent = defineModel<Where | Query>("parent", { required: true });
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
const selectedProperty: Ref<SearchResultSummary | undefined> = ref(
  where.value.iri ? SearchResultSummarySchema.parse({ iri: where.value.iri, name: where.value.name, description: where.value.description }) : undefined
);
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
    delete (parent.value! as Query).where;
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
    where.value.and = [];
  } else if (val === "and" && where.value.or) {
    where.value.and = where.value.or;
    where.value.or = [];
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
  flex: 1 1 0;
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
