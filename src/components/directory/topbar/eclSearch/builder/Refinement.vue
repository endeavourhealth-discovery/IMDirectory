<template>
  <div class="refinement-content-container" @drop="onDrop($event, value, parent)" @dragover="onDragOver($event)">
    <Button
      icon="drag-icon fa-solid fa-grip-vertical"
      severity="secondary"
      text
      draggable="true"
      @dragstart="onDragStart($event, value, parent)"
      @dragend="onDragEnd(value, parent)"
    />
    <Select
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="value.property.constraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <div>{{ value.property.constraintOperator }}</div>
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
    <Select style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <Select
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="value.value.constraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <div>{{ value.value.constraintOperator }}</div>
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
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { ConceptService, EntityService, QueryService } from "@/services";
import { IM, SNOMED, QUERY, RDF } from "@/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@/enums";
import { isAliasIriRef, isBoolGroup } from "@/helpers/TypeGuards";
import { QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { cloneDeep, isEqual } from "lodash-es";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";

interface Props {
  value: {
    type: string;
    operator: string;
    property: { concept?: { iri: string; name?: string } | SearchResultSummary; constraintOperator: string };
    value: { concept?: { iri: string; name?: string } | SearchResultSummary; constraintOperator: string };
    validation?: { deferred: { promise: Promise<any>; reject: () => void; resolve: () => void }; valid: boolean };
    id?: string;
  };
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

const toast = useToast();
const filterStore = useFilterStore();
const filterStoreOptions = computed(() => filterStore.filterOptions);
const coreSchemes = computed(() => filterStore.coreSchemes);
const propertyRanges: Ref<Set<string>> = ref(new Set<string>());
const forceValidation = inject("forceValidation") as Ref<boolean>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const childLoadingState = inject("childLoadingState") as Ref<any>;
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
const constraintOperatorOptions = [
  { label: " ", value: "" },
  { label: "<<", value: "<<" },
  { label: "<", value: "<" },
  { label: "^", value: "^" }
];

const imQueryForValueSearch: Ref<QueryRequest | undefined> = ref(undefined);

const imQueryForPropertySearch: Ref<QueryRequest | undefined> = ref(undefined);

const hasValue = computed(() => {
  if (isObjectHasKeys(props.value.value, ["concept", "constraintOperator"]) && isObjectHasKeys(props.value.value.concept, ["iri"])) return true;
  else return false;
});

const hasFocus = computed(() => {
  if (isObjectHasKeys(props, ["focus"]) && ((isAliasIriRef(props.focus) && props.focus.iri) || isBoolGroup(props.focus))) return true;
  else return false;
});

const hasProperty = computed(() => {
  if (isObjectHasKeys(props.value.property, ["concept", "constraintOperator"]) && isObjectHasKeys(props.value.property.concept, ["iri"])) return true;
  else return false;
});

watch(
  () => cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      if (!oldValue) await processProps();
      else {
        if (newValue?.property?.concept?.iri !== oldValue?.property?.concept?.iri) await processProps();
        else if (!newValue.property.concept) selectedProperty.value = undefined;
        if (newValue?.value?.concept?.iri !== oldValue?.value?.concept?.iri) await processProps();
        else if (!newValue.value.concept) selectedValue.value = undefined;
      }
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
  if (props.value.validation) {
    if (isValidProperty.value && isValidPropertyValue.value) props.value.validation.valid = true;
    else props.value.validation.valid = false;
    props.value.validation.deferred.resolve();
  }
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

watch([() => cloneDeep(props.focus), () => cloneDeep(props.value.property.concept)], async () => {
  loadingProperty.value = true;
  updateQueryForPropertySearch();
  loadingProperty.value = false;
});

watch([selectedProperty, () => cloneDeep(props.value.value.concept)], async () => {
  loadingValue.value = true;
  await updateRanges();
  updateQueryForValueSearch();
  loadingValue.value = false;
});

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await processProps();
  updateQueryForValueSearch();
  updateQueryForPropertySearch();
  loadingProperty.value = false;
  loadingValue.value = false;
  if (props.value.id && Object.hasOwn(childLoadingState.value, props.value.id)) childLoadingState.value[props.value.id] = true;
});

function updateQueryForValueSearch() {
  imQueryForValueSearch.value = {
    query: { iri: QUERY.ALLOWABLE_RANGES },
    argument: [
      {
        parameter: "this",
        valueIri: { iri: props.value.property.concept?.iri }
      }
    ]
  } as QueryRequest;
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
        propertyRanges.value.add(range.iri);
      }
  }
}

async function updatePropertyTreeRoots(): Promise<void> {
  let roots = ["http://snomed.info/sct#410662002"];
  if (props.focus) {
    if (isAliasIriRef(props.focus) && props.focus.iri !== SNOMED.ANY) {
      const results = await ConceptService.getSuperiorPropertiesPaged(props.focus.iri);
      if (results?.result) roots = results.result.map(item => item.iri);
    } else if (isBoolGroup(props.focus)) {
      const results = await ConceptService.getSuperiorPropertiesBoolFocusPaged(props.focus);
      if (results?.result) roots = results.result.map(item => item.iri);
    }
  }
  propertyTreeRoots.value = roots;
}

async function updateValueTreeRoots(): Promise<void> {
  let roots = [IM.ONTOLOGY_PARENT_FOLDER];
  if (props.value?.property?.concept?.iri && props.value.property.concept.iri !== SNOMED.ANY) {
    const results = await ConceptService.getSuperiorPropertyValuesPaged(props.value.property.concept.iri);
    if (results?.result) roots = results.result.map(item => item.iri);
  }
  valueTreeRoots.value = roots;
}

async function updateIsValidProperty(): Promise<void> {
  if (props.focus && hasProperty.value && props.focus.iri === SNOMED.ANY) {
    const imQuery: QueryRequest = cloneDeep(imQueryForPropertySearch.value) ?? { query: {} };
    imQuery.textSearch = selectedProperty.value?.iri;
    const results = await QueryService.queryIMSearch(imQuery);
    isValidProperty.value = results.entities?.findIndex(r => r.iri === selectedProperty.value?.iri) != -1 ? true : false;
  } else if (props.focus && hasProperty.value && imQueryForPropertySearch.value) {
    const imQuery = cloneDeep(imQueryForPropertySearch.value);
    imQuery.askIri = props.value.property.concept?.iri;
    isValidProperty.value = await QueryService.askQuery(imQuery);
    if (!isValidProperty.value) {
      if (isAliasIriRef(props.focus))
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property",
          detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : props.value.property.concept?.iri}" is not valid for concept "${
            props.focus?.name ? props.focus.name : props.focus?.iri
          }"`,
          life: 3000
        });
      else if (isBoolGroup(props.focus))
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property",
          detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : props.value.property.concept?.iri}" is not valid for focus "${
            props.focus?.ecl
          }"`,
          life: 3000
        });
    }
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (selectedValue.value && selectedProperty.value) {
    const imQuery: QueryRequest = cloneDeep(imQueryForValueSearch.value) ?? { query: {} };
    imQuery.textSearch = selectedValue.value?.name;
    const result = await QueryService.queryIMSearch(imQuery);
    isValidPropertyValue.value = result.entities?.findIndex(r => r.iri === selectedValue.value?.iri) != -1 ? true : false;
    if (!isValidPropertyValue.value) {
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property value",
        detail: `Value "${props.value.value.concept?.name ? props.value.value.concept.name : props.value.value.concept?.iri}" is not valid for property "${
          props.value.property.concept?.name ? props.value.property.concept?.name : props.value.property.concept?.iri
        }"`,
        life: 3000
      });
    }
  } else isValidPropertyValue.value = false;
}

async function processProps() {
  if (hasProperty.value && hasFocus.value) {
    await processPropertyProp();
  }
  if (hasValue.value && hasProperty.value) {
    await processValueProp();
  }
}

async function processPropertyProp() {
  if (isObjectHasKeys(props.value.property.concept, ["entityType"])) selectedProperty.value = props.value.property.concept as SearchResultSummary;
  else if (props.value.property.concept?.iri) {
    const propertySummary = (selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri));
    if (isObjectHasKeys(propertySummary)) selectedProperty.value = propertySummary;
    else {
      selectedProperty.value = undefined;
      throw new Error("Property iri does not exist");
    }
  } else {
    selectedProperty.value = undefined;
  }
}

async function processValueProp() {
  if (isObjectHasKeys(props.value.value.concept, ["entityType"])) selectedValue.value = props.value.value.concept as SearchResultSummary;
  else if (props.value.value.concept) {
    const valueSummary = (selectedValue.value = await EntityService.getEntitySummary(props.value.value.concept.iri));
    if (isObjectHasKeys(valueSummary)) {
      selectedValue.value = valueSummary;
    } else {
      selectedValue.value = undefined;
      throw new Error("Value iri does not exist");
    }
  }
}

async function updateProperty(property: SearchResultSummary | undefined) {
  if (!property) props.value.property.concept = undefined;
  else props.value.property.concept = { iri: property.iri };
}

async function updateValue(value: SearchResultSummary | undefined) {
  if (!value) props.value.value.concept = undefined;
  else props.value.value.concept = { iri: value.iri };
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
</style>
