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
    <Dropdown
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="value.property.descendants"
      :options="descendantOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex align-items-center">
          <div>{{ value.property.descendants }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex align-items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Dropdown>
    <AutocompleteSearchBar
      :disabled="!hasFocus || loadingProperty"
      v-model:selected="selectedProperty"
      :-i-m-query="imQueryForPropertySearch"
      :root-entities="propertyTreeRoots"
    />
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <Dropdown
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="value.value.descendants"
      :options="descendantOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex align-items-center">
          <div>{{ value.value.descendants }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex align-items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Dropdown>
    <AutocompleteSearchBar
      :disabled="!hasProperty || loadingValue || loadingProperty"
      v-model:selected="selectedValue"
      :-o-s-query="osQueryForValueSearch"
      :root-entities="valueTreeRoots"
    />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { EntityService, FunctionService, QueryService } from "@/services";
import { IM, SNOMED, QUERY, IM_FUNCTION } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useToast } from "primevue/usetoast";
import { SortDirection, ToastSeverity } from "@im-library/enums";
import { cloneDeep } from "lodash";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { FunctionRequest, QueryRequest, SearchRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import _ from "lodash";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";

interface Props {
  value: {
    type: string;
    operator: string;
    property: { concept?: { iri: string; name?: string } | SearchResultSummary; descendants: string };
    value: { concept?: { iri: string; name?: string } | SearchResultSummary; descendants: string };
    ecl?: string;
    validation?: { deferred: { promise: Promise<any>; reject: Function; resolve: Function }; valid: boolean };
  };
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

const toast = useToast();
const filterStore = useFilterStore();
const filterStoreOptions = computed(() => filterStore.filterOptions);
const propertyRanges: Ref<Set<string>> = ref(new Set<string>());
const includeTerms = inject("includeTerms") as Ref<boolean>;
const forceValidation = inject("forceValidation") as Ref<boolean>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop, onDragOver, onDragLeave } = setupECLBuilderActions(wasDraggedAndDropped);
const selectedProperty: Ref<SearchResultSummary | undefined> = ref();
const selectedValue: Ref<SearchResultSummary | undefined> = ref();
const loadingProperty = ref(true);
const loadingValue = ref(true);
const isValidProperty = ref(false);
const isValidPropertyValue = ref(false);
const propertyTreeRoots: Ref<string[]> = ref([]);
const valueTreeRoots: Ref<string[]> = ref([]);
const operatorOptions = ["=", "!="];
const descendantOptions = [
  { label: " ", value: "" },
  { label: "<<", value: "<<" },
  { label: "<", value: "<" }
];

const osQueryForValueSearch: Ref<SearchRequest> = ref({
  isA: Array.from(propertyRanges.value),
  statusFilter: filterStoreOptions.value.status.map(s => s["@id"]),
  schemeFilter: filterStoreOptions.value.schemes.filter(filterOption => filterOption["@id"] === SNOMED.NAMESPACE).map(s => s["@id"]),
  typeFilter: filterStoreOptions.value.types.filter(filterOption => filterOption["@id"] === IM.CONCEPT).map(s => s["@id"]),
  sortDirection: filterStoreOptions.value.sortDirections[0]?.["@id"] === IM.DESCENDING ? SortDirection.DESC : SortDirection.ASC,
  sortField: filterStoreOptions.value.sortFields[0]?.["@id"] === IM.USAGE ? "weighting" : filterStoreOptions.value.sortFields[0]?.["@id"]
} as SearchRequest);

const imQueryForPropertySearch: Ref<QueryRequest> = ref({
  query: { "@id": QUERY.ALLOWABLE_PROPERTIES },
  argument: [
    {
      parameter: "this",
      valueIri: {
        "@id": props.focus?.iri ?? undefined
      }
    }
  ]
} as QueryRequest);

const hasValue = computed(() => {
  if (isObjectHasKeys(props.value.value, ["concept", "descendants"]) && isObjectHasKeys(props.value.value.concept, ["iri"])) return true;
  else return false;
});

const hasFocus = computed(() => {
  if (isObjectHasKeys(props, ["focus"]) && ((isAliasIriRef(props.focus) && props.focus.iri) || isBoolGroup(props.focus))) return true;
  else return false;
});

const hasProperty = computed(() => {
  if (isObjectHasKeys(props.value.property, ["concept", "descendants"]) && isObjectHasKeys(props.value.property.concept, ["iri"])) return true;
  else return false;
});

watch(
  () => cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      if (!oldValue) await processProps();
      else {
        if (newValue?.property?.concept?.iri !== oldValue?.property?.concept?.iri) await processProps();
        else if (!newValue.property.concept) selectedProperty.value = undefined;
        if (newValue?.value?.concept?.iri !== oldValue?.value?.concept?.iri) await processProps();
        else if (!newValue.value.concept) selectedValue.value = undefined;
        props.value.ecl = generateEcl();
      }
    }
  }
);

watch(
  () => cloneDeep(props.focus),
  async (newValue, oldValue) => {
    if (newValue && !_.isEqual(newValue, oldValue) && ((isAliasIriRef(newValue) && newValue.iri) || isBoolGroup(newValue))) {
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
  if (props.value.validation) {
    if (isValidProperty && isValidPropertyValue) props.value.validation.valid = true;
    else props.value.validation.valid = false;
    props.value.validation.deferred.resolve("resolved");
  }
});

watch(includeTerms, () => (props.value.ecl = generateEcl()));

watch(selectedProperty, async (newValue, oldValue) => {
  if (!_.isEqual(newValue, oldValue)) {
    loadingProperty.value = true;
    loadingValue.value = true;
    await updateProperty(newValue);
    loadingProperty.value = false;
    loadingValue.value = false;
  }
});

watch(selectedValue, async (newValue, oldValue) => {
  if (!_.isEqual(newValue, oldValue)) {
    loadingValue.value = true;
    await updateValue(newValue);
    loadingValue.value = false;
  }
});

watch([() => cloneDeep(props.focus), () => cloneDeep(props.value.property.concept)], async () => {
  loadingProperty.value = true;
  updateQueryForPropertySearch();
  propertyTreeRoots.value = await getPropertyTreeRoots();
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
  props.value.ecl = generateEcl();
  loadingProperty.value = false;
  loadingValue.value = false;
});

async function updateQueryForValueSearch() {
  osQueryForValueSearch.value.isA = Array.from(propertyRanges.value);
}

async function updateQueryForPropertySearch() {
  imQueryForPropertySearch.value.argument![0].valueIri = props.focus.iri;
}

async function updateRanges() {
  if (selectedProperty.value?.iri) {
    const rangesQueryRequest: QueryRequest = {
      query: { "@id": QUERY.ALLOWABLE_RANGES },
      argument: [{ parameter: "this", valueIri: { "@id": selectedProperty.value?.iri } }]
    } as QueryRequest;

    const response = await QueryService.queryIM(rangesQueryRequest);
    if (isArrayHasLength(response.entities))
      for (const range of response.entities) {
        propertyRanges.value.add(range["@id"]);
      }
  }
  valueTreeRoots.value = await getValueTreeRoots();
}

async function getPropertyTreeRoots(): Promise<string[]> {
  let roots = ["http://snomed.info/sct#410662002"];
  if (props.focus) {
    if (isAliasIriRef(props.focus) && props.focus.iri !== "any") {
      const results = await EntityService.getSuperiorPropertiesPaged(props.focus.iri);
      if (results) roots = results.result.map(item => item["@id"]);
    } else if (isBoolGroup(props.focus)) {
      const results = await EntityService.getSuperiorPropertiesBoolFocusPaged(props.focus);
      if (results) roots = results.result.map(item => item["@id"]);
    }
  }
  return roots;
}

async function getValueTreeRoots(): Promise<string[]> {
  let roots = ["http://snomed.info/sct#138875005"];
  if (props.value?.property?.concept?.iri && props.value.property.concept.iri !== "any") {
    const results = await EntityService.getSuperiorPropertyValuesPaged(props.value.property.concept.iri);
    if (results) roots = results.result.map(item => item["@id"]);
  }
  return roots;
}

async function updateIsValidProperty(): Promise<void> {
  if (props.focus?.iri === "any" || props.focus?.iri === "*") isValidProperty.value = true;
  else if (props.focus && hasProperty.value) {
    const request: FunctionRequest = {
      functionIri: IM_FUNCTION.ALLOWABLE_PROPERTIES,
      arguments: [
        { parameter: "focus", valueObject: props.focus },
        { parameter: "searchIri", valueData: props.value.property.concept?.iri }
      ]
    };
    isValidProperty.value = await FunctionService.runAskFunction(request);
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
          detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : props.value.property.concept?.iri}" is not valid for focus "${props
            .focus?.ecl}"`,
          life: 3000
        });
    }
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (hasValue.value && hasProperty.value) {
    const request: QueryRequest = {
      query: { "@id": QUERY.GET_VALUES_FROM_PROPERTY_RANGE },
      argument: [{ parameter: "this", valueObject: props.value.property.concept?.iri }],
      askIri: props.value.value.concept?.iri
    };
    isValidPropertyValue.value = await QueryService.askQuery(request);
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

function generateEcl(): string {
  let ecl = "";
  if (hasProperty.value) ecl += builderConceptToEcl(props.value.property, props.parent, includeTerms.value);
  else ecl += "[ UNKNOWN PROPERTY ]";
  if (props.value.operator) ecl += " " + props.value.operator + " ";
  if (hasValue.value) ecl += builderConceptToEcl(props.value.value, props.parent, includeTerms.value);
  else ecl += "[ UNKNOWN VALUE ]";
  return ecl;
}

async function updateProperty(property: SearchResultSummary | undefined) {
  props.value.property.concept = property;
  props.value.ecl = generateEcl();
}

async function updateValue(value: SearchResultSummary | undefined) {
  props.value.value.concept = value;
  props.value.ecl = generateEcl();
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

.search-text {
  flex: 1 1 auto;
  min-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--text-color);
  background: var(--surface-a);
  border: 1px solid var(--surface-border);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: 3px;
  height: 2.2rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.clickable {
  cursor: pointer;
}

.inactive {
  color: var(--text-color-secondary);
}

.selected-label {
  padding-left: 0.5rem;
}

.p-invalid {
  border: 1px solid var(--red-500);
}
</style>
