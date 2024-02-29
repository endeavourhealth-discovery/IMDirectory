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
    <AutocompleteSearchBar
      :disabled="!hasFocus || loadingProperty"
      v-model:selected="selectedProperty"
      :search-by-function="propertyFunctionRequest"
      :filterOptions="propertyFilterOptions"
      :filterDefaults="propertyFilterDefaults"
      :get-root-entities="getPropertyTreeRoots"
    />
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <AutocompleteSearchBar
      :disabled="!hasProperty || loadingValue || loadingProperty"
      v-model:selected="selectedValue"
      :search-by-function="valueFunctionRequest"
      :filterOptions="valueFilterOptions"
      :filterDefaults="valueFilterDefaults"
      :get-root-entities="getValueTreeRoots"
    />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { EntityService, FunctionService, QueryService } from "@/services";
import { IM, RDF, SNOMED, QUERY, IM_FUNCTION } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@im-library/enums";
import { cloneDeep } from "lodash";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { FilterOptions } from "@im-library/interfaces";
import { FunctionRequest, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
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
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop, onDragOver, onDragLeave } = setupECLBuilderActions(wasDraggedAndDropped);

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

const toast = useToast();
const filterStore = useFilterStore();
const filterStoreDefaults = computed(() => filterStore.filterDefaults);
const filterStoreOptions = computed(() => filterStore.filterOptions);

const includeTerms = inject("includeTerms") as Ref<boolean>;
const forceValidation = inject("forceValidation") as Ref<boolean>;
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

const selectedProperty: Ref<SearchResultSummary | undefined> = ref();
const selectedValue: Ref<SearchResultSummary | undefined> = ref();
const loadingProperty = ref(true);
const loadingValue = ref(true);
const isValidProperty = ref(false);
const isValidPropertyValue = ref(false);
const propertyFunctionRequest: Ref<FunctionRequest> = ref({ functionIri: IM_FUNCTION.ALLOWABLE_PROPERTIES, arguments: [] });
const valueFunctionRequest: Ref<FunctionRequest> = ref({ functionIri: IM_FUNCTION.ALLOWABLE_PROPERTY_VALUES, arguments: [] });
const propertyTreeRoots: Ref<string[]> = ref([]);
const valueTreeRoots: Ref<string[]> = ref([]);

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
  updateArguments();
  loadingProperty.value = false;
});

watch([selectedProperty, () => cloneDeep(props.value.value.concept)], async () => {
  loadingValue.value = true;
  updateArguments();
  loadingValue.value = false;
});

const descendantOptions = [
  {
    label: "only",
    value: ""
  },
  {
    label: "plus descendants",
    value: "<<"
  },
  {
    label: "descendants only",
    value: "<"
  }
];

const operatorOptions = ["=", "!="];

const propertyFilterOptions: FilterOptions = {
  status: [...filterStoreOptions.value.status],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === RDF.PROPERTY)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

const propertyFilterDefaults: FilterOptions = {
  status: [...filterStoreOptions.value.status.filter(s => s["@id"] === IM.ACTIVE)],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === RDF.PROPERTY)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

const valueFilterOptions: FilterOptions = {
  status: [...filterStoreOptions.value.status],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === IM.CONCEPT)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

const valueFilterDefaults: FilterOptions = {
  status: [...filterStoreOptions.value.status.filter(s => s["@id"] === IM.ACTIVE)],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === IM.CONCEPT)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await processProps();
  updateArguments();
  props.value.ecl = generateEcl();
  loadingProperty.value = false;
  loadingValue.value = false;
});

function updateArguments() {
  const focusArg = propertyFunctionRequest.value.arguments?.find(arg => arg.parameter === "focus");
  const propertyArg = valueFunctionRequest.value.arguments?.find(arg => arg.parameter === "propertyIri");
  if (props.focus && !focusArg) propertyFunctionRequest.value.arguments?.push({ parameter: "focus", valueObject: props.focus });
  else if (props.focus && focusArg && focusArg.valueObject !== props.focus) focusArg.valueObject = props.focus;
  if (selectedProperty.value && !propertyArg)
    valueFunctionRequest.value.arguments?.push({ parameter: "propertyIri", valueIri: { "@id": selectedProperty.value.iri } });
  else if (selectedProperty.value && propertyArg && propertyArg?.valueIri?.["@id"] !== selectedProperty.value.iri)
    propertyArg.valueIri = { "@id": selectedProperty.value.iri };
}

async function getPropertyTreeRoots(): Promise<string[]> {
  if (props.focus) {
    if (isAliasIriRef(props.focus)) {
      if (props.focus.iri === "any") {
        return ["http://snomed.info/sct#410662002"];
      }
      const results = await EntityService.getSuperiorPropertiesPaged(props.focus.iri);
      if (results) return results.result.map(item => item["@id"]);
    } else if (isBoolGroup(props.focus)) {
      const results = await EntityService.getSuperiorPropertiesBoolFocusPaged(props.focus);
      if (results) return results.result.map(item => item["@id"]);
    }
  }
  return ["http://snomed.info/sct#138875005"];
}

async function getValueTreeRoots(): Promise<string[]> {
  if (props.value?.property?.concept?.iri) {
    if (props.value.property.concept.iri === "any") {
      return [];
    }
    const results = await EntityService.getSuperiorPropertyValuesPaged(props.value.property.concept.iri);
    if (results) return results.result.map(item => item["@id"]);
  }
  return ["http://snomed.info/sct#138875005"];
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
