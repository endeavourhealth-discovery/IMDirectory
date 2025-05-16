<template>
  <div class="nested-ecl-where">
    <span v-if="where.or || where.and">
      <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
        <span v-for="operator in operators" :key="operator">
          <span v-if="where[operator]">
            <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
              <div
                class="conjunction"
                @drop="onDrop($event, where, parent, index)"
                @dragover="
                  onDragOver($event);
                  mouseover($event);
                "
                @dragleave="mouseout"
              />
              <div class="top-operator">
                <Select
                  class="operator-selector"
                  :modelValue="parentOperator"
                  :options="getBooleanOptions(parent!, parentOperator as Bool)"
                  option-label="label"
                  option-value="value"
                  @update:modelValue="val => toggleBool(parent!, where, parentOperator as Bool, val as Bool, index)"
                />
              </div>
              <div v-for="(item, index) in where[operator]" :key="index">
                <ECLRefinement
                  v-model:where="where[operator]![index]!"
                  v-model:parent="where"
                  :focus="props.focus"
                  :index="index"
                  v-model:parentOperator="operator as Bool"
                />
              </div>
            </div>
          </span>
        </span>
      </div>
    </span>
    <div v-else class="refinement-content-container" @drop="onDrop($event, where, parent)" @dragover="onDragOver($event)">
      <Button
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        draggable="true"
        @dragstart="onDragStart($event, where, parent)"
        @dragend="onDragEnd(where, parent)"
      />
      <div class="group-checkbox">
        <Select
          class="operator-selector"
          :modelValue="parentOperator"
          :options="getBooleanOptions(parent!, parentOperator as Bool)"
          option-label="label"
          option-value="value"
          @update:modelValue="val => toggleBool(parent!, where, parentOperator as Bool, val as Bool, index)"
        />
      </div>
      <div class="group-checkbox">
        <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" data-testid="group-checkbox" />
        <label :for="'group' + index">Select</label>
      </div>
      <Select
        style="width: 4.5rem; min-height: 2.3rem"
        v-model="propertyConstraintOperator"
        :options="constraintOperatorOptions"
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
      <div class="property-container">
        <AutocompleteSearchBar
          :disabled="!hasFocus || loadingProperty"
          v-model:selected="selectedProperty"
          :imQuery="imQueryForPropertySearch"
          :root-entities="propertyTreeRoots"
          @open-dialog="updatePropertyTreeRoots"
          :class="!isValidProperty && showValidation && 'invalid'"
        />
        <small v-if="!isValidProperty && showValidation" class="validate-error">Property is invalid for selected expression constraint.</small>
      </div>
      <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
      <Select style="width: 5rem" v-model="inNotIn" :options="operatorOptions" />
      <Select
        style="width: 4.5rem; min-height: 2.3rem"
        v-model="valueConstraintOperator"
        :options="constraintOperatorOptions"
        option-label="label"
        option-value="value"
        @change="updateValueConstraint"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center">
            <div>{{ valueConstraintOperator }}</div>
          </div>
        </template>
        <template #option="slotProps">
          <div class="flex items-center" style="min-height: 1rem">
            <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
      <div class="value-container">
        <AutocompleteSearchBar
          :disabled="!hasProperty || loadingValue || loadingProperty"
          v-model:selected="selectedValue"
          :imQuery="imQueryForValueSearch"
          :root-entities="valueTreeRoots"
          @open-dialog="updateValueTreeRoots"
          :class="!isValidPropertyValue && showValidation && 'invalid'"
        />
        <small v-if="!isValidPropertyValue && showValidation" class="validate-error">Item is invalid for selected property.</small>
      </div>
      <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { ConceptService, QueryService } from "@/services";
import { IM, SNOMED, QUERY, RDF } from "@/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@/enums";
import { isAliasIriRef, isBoolGroup } from "@/helpers/TypeGuards";
import { Bool, Where, Match, QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { cloneDeep, isEqual } from "lodash-es";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { getBooleanOptions, toggleBool } from "@/helpers/IMQueryBuilder";

import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters, setConstraintOperator, constraintOperatorOptions, getConstraintOperator } from "@/helpers/IMQueryBuilder";

import Button from "primevue/button";

interface Props {
  focus?: any;
  index: number;
  parentOperator?: string;
}
const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const parent = defineModel<Where | Match>("parent");
const toast = useToast();
const filterStore = useFilterStore();
const group: Ref<number[]> = ref([]);
const filterStoreOptions = computed(() => filterStore.filterOptions);
const coreSchemes = computed(() => filterStore.coreSchemes);
const forceValidation = inject("forceValidation") as Ref<boolean>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const selectedProperty: Ref<SearchResultSummary | undefined> = ref();
const selectedValue: Ref<SearchResultSummary | undefined> = ref();
const loadingProperty = ref(true);
const loadingValue = ref(true);
const isValidProperty = ref(false);
const isValidPropertyValue = ref(false);
const propertyTreeRoots: Ref<string[]> = ref(["http://snomed.info/sct#410662002"]);
const valueTreeRoots: Ref<string[]> = ref([IM.ONTOLOGY_PARENT_FOLDER]);
const showValidation = ref(false);
const operatorOptions = ["=", "!="];
const hover = ref();
const propertyConstraintOperator: Ref<string | undefined> = ref<"<<">();
const valueConstraintOperator: Ref<string | undefined> = ref<"<<">();
const inNotIn = computed(() => {
  if (where.value.not) return "!=";
  else return "=";
});
const imQueryForValueSearch: Ref<QueryRequest | undefined> = ref(undefined);
const imQueryForPropertySearch: Ref<QueryRequest | undefined> = ref(undefined);
const hasFocus = computed(() => {
  if (isObjectHasKeys(props, ["focus"]) && ((isAliasIriRef(props.focus) && props.focus.iri) || isBoolGroup(props.focus))) return true;
  else return false;
});
const hasProperty = computed(() => {
  return where.value.iri;
});
defineEmits<{
  (e: "update:parentOperator", value: string): void;
}>();

watch(
  () => cloneDeep(where.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      if (!oldValue) await processProps();
    }
  }
);

watch(
  () => cloneDeep(props.focus),
  async (newValue, oldValue) => {
    if (newValue && !isEqual(newValue, oldValue) && ((isAliasIriRef(newValue) && newValue.iri) || isBoolGroup(newValue))) {
      loadingProperty.value = true;
      loadingValue.value = true;
      await processProps();
      loadingProperty.value = false;
      loadingValue.value = false;
    }
  }
);

watch(forceValidation, async () => {
  await updateIsValidProperty();
  await updateIsValidPropertyValue();
  showValidation.value = true;
});

watch(selectedProperty, async (newValue, oldValue) => {
  if (!isEqual(newValue, oldValue)) {
    loadingProperty.value = true;
    loadingValue.value = true;
    await updateProperty(newValue);
    loadingProperty.value = false;
    loadingValue.value = false;
  }
});

watch(selectedValue, async (newValue, oldValue) => {
  if (!isEqual(newValue, oldValue)) {
    loadingValue.value = true;
    await updateValue(newValue);
    loadingValue.value = false;
  }
});

watch([() => cloneDeep(props.focus), () => cloneDeep(where.value)], async () => {
  loadingProperty.value = true;
  updateQueryForPropertySearch();
  loadingProperty.value = false;
});

watch([selectedProperty, () => cloneDeep(where.value)], async () => {
  loadingValue.value = true;
  updateQueryForValueSearch();
  loadingValue.value = false;
});

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await processProps();
  loadingProperty.value = false;
  loadingValue.value = false;
});
function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}

function updatePropertyConstraint(e: { value: string }) {
  setConstraintOperator(where.value, e.value);
}

function updateValueConstraint(e: { value: string }) {
  if (!where.value.is) where.value.is = [{}];
  setConstraintOperator(where.value.is[0], e.value);
}

function updateQueryForValueSearch() {
  if (where.value.is) {
    imQueryForValueSearch.value = {
      query: { iri: QUERY.ALLOWABLE_RANGES },
      argument: [
        {
          parameter: "this",
          valueIri: { iri: where.value.is[0].iri }
        }
      ]
    } as QueryRequest;
  }
}

function addIfConcept(focus: any[], iris: TTIriRef[]) {
  for (const item of focus) {
    if (item.type === "ExpressionConstraint") {
      if (item.conceptSingle) {
        iris.push({ iri: item.conceptSingle.iri });
      } else if (item.conceptBool) {
        addIfConcept(item.conceptBoolItem.items, iris);
      }
    }
    if (item.type === "BoolGroup") {
      addIfConcept(item.items, iris);
    }
  }
}

function updateQueryForPropertySearch() {
  if (props.focus)
    if (props.focus.type === "BoolGroup" && isArrayHasLength(props.focus.items)) {
      const iris: TTIriRef[] = [];
      addIfConcept(props.focus.items, iris);
      imQueryForPropertySearch.value = {
        query: { iri: QUERY.ALLOWABLE_PROPERTIES },
        argument: [
          {
            parameter: "this",
            valueIriList: iris
          }
        ]
      } as QueryRequest;
    } else if (props.focus.iri === SNOMED.ANY) {
      const filterOptions = {
        isAs: ["http://snomed.info/sct#410662002"],
        status: filterStoreOptions.value.status,
        schemes: filterStoreOptions.value.schemes.filter(filterOption => coreSchemes.value.includes(filterOption.iri)),
        types: [{ iri: RDF.PROPERTY }]
      } as SearchOptions;
      imQueryForPropertySearch.value = buildIMQueryFromFilters(filterOptions);
    } else {
      imQueryForPropertySearch.value = {
        query: { iri: QUERY.ALLOWABLE_PROPERTIES },
        argument: [
          {
            parameter: "this",
            valueIri: { iri: props.focus.iri }
          }
        ]
      } as QueryRequest;
    }
}

async function updateRanges() {
  if (selectedProperty.value?.iri) {
    const rangesQueryRequest: QueryRequest = {
      query: { iri: QUERY.ALLOWABLE_RANGES },
      argument: [{ parameter: "this", valueIri: { iri: selectedProperty.value?.iri } }]
    } as QueryRequest;

    const response = await QueryService.queryIM(rangesQueryRequest);
    if (isArrayHasLength(response.entities))
      for (const range of response.entities) {
        propertyRanges.value.add(range["@id"]);
      }
  }
}

async function updatePropertyTreeRoots(): Promise<void> {
  let roots = ["http://snomed.info/sct#410662002"];
  if (props.focus) {
    if (isAliasIriRef(props.focus) && props.focus.iri !== SNOMED.ANY) {
      const results = await ConceptService.getSuperiorPropertiesPaged(props.focus.iri);
      if (results.result) roots = results.result.map(item => item.iri);
    } else if (isBoolGroup(props.focus)) {
      const results = await ConceptService.getSuperiorPropertiesBoolFocusPaged(props.focus);
      if (results.result) roots = results.result.map(item => item.iri);
    }
  }
  propertyTreeRoots.value = roots;
}

async function updateValueTreeRoots(): Promise<void> {
  let roots = [IM.ONTOLOGY_PARENT_FOLDER];
  if (where.value.iri && where.value.iri !== SNOMED.ANY) {
    const results = await ConceptService.getSuperiorPropertyValuesPaged(where.value.iri);
    if (results.result) roots = results.result.map(item => item.iri);
  }
  valueTreeRoots.value = roots;
}

async function updateIsValidProperty(): Promise<void> {
  if (where.value.iri && where.value.iri === SNOMED.ANY) {
    const imQuery: QueryRequest = cloneDeep(imQueryForPropertySearch.value) ?? { query: {} };
    imQuery.textSearch = selectedProperty.value?.iri;
    const results = await QueryService.queryIMSearch(imQuery);
    isValidProperty.value = results.entities?.findIndex(r => r.iri === selectedProperty.value?.iri) != -1 ? true : false;
  } else if (props.focus && hasProperty.value && imQueryForPropertySearch.value) {
    const imQuery = cloneDeep(imQueryForPropertySearch.value);
    imQuery.askIri = where.value.iri;
    isValidProperty.value = await QueryService.askQuery(imQuery);
    if (!isValidProperty.value) {
      if (isAliasIriRef(props.focus))
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property",
          detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : where.value.iri}" is not valid for concept "${
            props.focus?.name ? props.focus.name : props.focus?.iri
          }"`,
          life: 3000
        });
      else if (isBoolGroup(props.focus))
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property",
          detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : where.value.iri}" is not valid for focus "${props.focus?.ecl}"`,
          life: 3000
        });
    }
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (where.value.is) {
    const imQuery: QueryRequest = cloneDeep(imQueryForValueSearch.value) ?? { query: {} };
    imQuery.textSearch = selectedValue.value?.name;
    const result = await QueryService.queryIMSearch(imQuery);
    isValidPropertyValue.value = result.entities?.findIndex(r => r.iri === selectedValue.value?.iri) != -1 ? true : false;
    if (!isValidPropertyValue.value) {
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property value",
        detail: `Value "${where.value.is[0].name}" is not valid for property for this concept";
        }"`,
        life: 3000
      });
    }
  } else isValidPropertyValue.value = false;
}

async function processProps() {
  await processPropertyProp();
  await processValueProp();
}

async function processPropertyProp() {
  if (where.value.iri) {
    selectedProperty.value = { iri: where.value.iri, name: where.value.name } as SearchResultSummary;
    propertyConstraintOperator.value = getConstraintOperator(where.value);
  } else {
    selectedProperty.value = undefined;
    propertyConstraintOperator.value = "<<";
  }
}

async function processValueProp() {
  if (where.value.is && where.value.is[0].iri) {
    selectedValue.value = { iri: where.value.is[0].iri, name: where.value.is[0].name } as SearchResultSummary;
    valueConstraintOperator.value = getConstraintOperator(where.value.is[0]);
  } else {
    selectedValue.value = undefined;
    valueConstraintOperator.value = "<<";
  }
}

async function updateProperty(property: SearchResultSummary | undefined) {
  if (!property) {
    delete where.value.iri;
    delete where.value.name;
  } else {
    where.value.iri = property.iri;
    where.value.name = property.name;
  }
}

async function updateValue(value: SearchResultSummary | undefined) {
  if (!value) {
    delete where.value.is;
  } else {
    where.value.is = [
      {
        iri: value.iri,
        name: value.name
      }
    ];
  }
}
</script>

<style scoped>
.refinement-content-container {
  padding: 0;
  margin: 0.5rem;
  flex: 1;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.property-container,
.value-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.search-text {
  flex: 1 1 auto;
  min-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--p-text-color);
  background: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: var(--p-textarea-border-radius);
  height: 2.2rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.clickable {
  cursor: pointer;
}

.inactive {
  color: var(--p-text-color-secondary);
}

.selected-label {
  padding-left: 0.5rem;
}

.p-invalid {
  border: 1px solid var(--p-red-500);
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
  overflow: auto;
  width: 100%;
}

.invalid {
  border: 1px solid var(--p-red-500);
  border-radius: var(--p-textarea-border-radius);
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

.operator-selector {
  font-size: 0.85rem;
}

.nested-ecl-where {
  width: 100%;
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

.top-operator {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}
</style>
