<template>
  <div class="refinement-content-container">
    <div
      class="search-text"
      :class="[!isValidProperty && 'p-invalid', !loadingProperty && hasFocus && 'clickable', loadingProperty && 'inactive']"
      @click="hasFocus ? (showPropertyDialog = true) : (showPropertyDialog = false)"
      v-tooltip="{ value: selectedProperty.name ?? '', class: 'entity-tooltip' }"
    >
      <span class="selected-label">{{ selectedProperty.name ?? "Search..." }}</span>
    </div>
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <div
      class="search-text"
      :class="[!isValidPropertyValue && 'p-invalid', !loadingValue && hasProperty && 'clickable', loadingValue && 'inactive']"
      @click="hasProperty ? (showValueDialog = true) : (showValueDialog = false)"
      v-tooltip="{ value: selectedValue.name ?? '', class: 'entity-tooltip' }"
    >
      <span class="selected-label">{{ selectedValue.name ?? "Search..." }}</span>
    </div>
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
  <DirectorySearchDialog
    v-if="showPropertyDialog"
    v-model:show-dialog="showPropertyDialog"
    v-model:selected="selectedProperty"
    :search-by-function="propertyFunctionRequest"
    :root-entities="propertyTreeRoots.length ? propertyTreeRoots : ['http://snomed.info/sct#138875005']"
  />
  <DirectorySearchDialog
    v-if="showValueDialog"
    v-model:show-dialog="showValueDialog"
    v-model:selected="selectedValue"
    :search-by-function="valueFunctionRequest"
    :root-entities="valueTreeRoots.length ? valueTreeRoots : ['http://snomed.info/sct#138875005']"
  />
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import { EntityService, FunctionService } from "@/services";
import { useDialog } from "primevue/usedialog";
import { IM } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@im-library/enums";
import { cloneDeep } from "lodash";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { FunctionRequest } from "@im-library/interfaces/AutoGen";

interface Props {
  value: {
    type: string;
    operator: string;
    property: { concept: { iri: string; name?: string } | ConceptSummary; descendants: string };
    value: { concept: { iri: string; name?: string } | ConceptSummary; descendants: string };
    ecl?: string;
  };
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

watch(
  () => cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (newValue) {
      if (!oldValue) await processProps();
      else {
        if (newValue?.property?.concept?.iri !== oldValue?.property?.concept?.iri) await processProps();
        if (newValue?.value?.concept?.iri !== oldValue?.value?.concept?.iri) await processProps();
      }
    }
  }
);

watch(
  () => cloneDeep(props.focus),
  async (newValue, oldValue) => {
    if (newValue && ((isAliasIriRef(newValue) && newValue.iri) || isBoolGroup(newValue))) {
      console.log("here");
      loadingProperty.value = true;
      loadingValue.value = true;
      await processProps();
      loadingProperty.value = false;
      loadingValue.value = false;
    }
  }
);

const toast = useToast();

let treeDialog = useDialog();

const includeTerms = inject("includeTerms") as Ref<boolean>;

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

const selectedProperty: Ref<ConceptSummary> = ref({} as ConceptSummary);
const selectedValue: Ref<ConceptSummary> = ref({} as ConceptSummary);
const loadingProperty = ref(false);
const loadingValue = ref(false);
const isValidProperty = ref(false);
const isValidPropertyValue = ref(false);
const showPropertyDialog = ref(false);
const showValueDialog = ref(false);
const propertyFunctionRequest: Ref<FunctionRequest> = ref({ functionIri: IM.function.ALLOWABLE_PROPERTIES, arguments: [] });
const valueFunctionRequest: Ref<FunctionRequest> = ref({ functionIri: IM.function.ALLOWABLE_RANGES, arguments: [] });
const propertyTreeRoots: Ref<string[]> = ref([]);
const valueTreeRoots: Ref<string[]> = ref([]);

watch(selectedProperty, async newValue => {
  if (newValue) {
    loadingProperty.value = true;
    loadingValue.value = true;
    await updateProperty(newValue);
    loadingProperty.value = false;
    loadingValue.value = false;
  }
});

watch(selectedValue, async newValue => {
  if (newValue) {
    loadingValue.value = true;
    await updateValue(newValue);
    loadingValue.value = false;
  }
});

watch([() => cloneDeep(props.focus), () => cloneDeep(props.value.property.concept)], async () => {
  loadingProperty.value = true;
  await getPropertyTreeRoots();
  updateFunctionArguments();
  await updateIsValidProperty();
  loadingProperty.value = false;
});

watch([selectedProperty, () => cloneDeep(props.value.value.concept)], async () => {
  loadingValue.value = true;
  await getValueTreeRoots();
  updateFunctionArguments();
  await updateIsValidPropertyValue();
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

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await updateIsValidProperty();
  await updateIsValidPropertyValue();
  await processProps();
  updateFunctionArguments();
  await getPropertyTreeRoots();
  await getValueTreeRoots();
  loadingProperty.value = false;
  loadingValue.value = false;
});

function updateFunctionArguments() {
  const focusArg = propertyFunctionRequest.value.arguments?.find(arg => arg.parameter === "focus");
  const propertyArg = valueFunctionRequest.value.arguments?.find(arg => arg.parameter === "property");
  if (props.focus && !focusArg) propertyFunctionRequest.value.arguments?.push({ parameter: "focus", valueObject: props.focus });
  else if (props.focus && focusArg && focusArg.valueObject !== props.focus) focusArg.valueObject = props.focus;
  if (props.value.property.concept && !propertyArg)
    valueFunctionRequest.value.arguments?.push({ parameter: "property", valueObject: props.value.property.concept });
  else if (props.value.property.concept && propertyArg && propertyArg?.valueObject !== props.value.property.concept)
    propertyArg.valueObject = props.value.property.concept;
}

async function getPropertyTreeRoots() {
  if (props.focus) {
    if (isAliasIriRef(props.focus)) {
      if (props.focus.iri === "any") {
        propertyTreeRoots.value = ["http://snomed.info/sct#410662002"];
        return;
      }
      const results = await EntityService.getSuperiorPropertiesPaged(props.focus.iri);
      if (results) propertyTreeRoots.value = results.result.map(item => item["@id"]);
    } else if (isBoolGroup(props.focus)) {
      const results = await EntityService.getSuperiorPropertiesBoolFocusPaged(props.focus);
      if (results) propertyTreeRoots.value = results.result.map(item => item["@id"]);
    }
  }
}

async function getValueTreeRoots() {
  if (props.value?.property?.concept?.iri) {
    if (props.value.property.concept.iri === "any") {
      valueTreeRoots.value = [];
      return;
    }
    const results = await EntityService.getSuperiorPropertyValuesPaged(props.value.property.concept.iri);
    if (results) valueTreeRoots.value = results.result.map(item => item["@id"]);
  }
}

async function updateIsValidProperty(): Promise<void> {
  if (props.focus?.iri === "any" || props.focus?.iri === "*") isValidProperty.value = true;
  else if (props.focus && hasProperty.value) {
    const request = {
      functionIri: IM.function.ALLOWABLE_PROPERTIES,
      arguments: [
        { parameter: "focus", valueObject: props.focus },
        { parameter: "searchIri", valueData: props.value.property.concept.iri }
      ]
    } as FunctionRequest;
    isValidProperty.value = await FunctionService.runAskFunction(request);
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (hasValue.value && hasProperty.value) {
    const request = {
      functionIri: IM.function.ALLOWABLE_RANGES,
      arguments: [
        { parameter: "property", valueObject: props.value.property.concept },
        { parameter: "searchIri", valueData: props.value.value.concept.iri }
      ]
    } as FunctionRequest;
    isValidPropertyValue.value = await FunctionService.runAskFunction(request);
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
  if (isObjectHasKeys(props.value.property.concept, ["entityType"])) selectedProperty.value = props.value.property.concept as ConceptSummary;
  else {
    const propertySummary = (selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri));
    if (isObjectHasKeys(propertySummary)) selectedProperty.value = propertySummary;
    else {
      selectedProperty.value = {} as ConceptSummary;
      throw new Error("Property iri does not exist");
    }
  }
  await updateIsValidProperty();
  if (!isValidProperty.value) {
    if (isAliasIriRef(props.focus))
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property",
        detail: `Property "${selectedProperty.value.name ? selectedProperty.value.name : props.value.property.concept.iri}" is not valid for concept "${
          props.focus?.name ? props.focus.name : props.focus?.iri
        }"`,
        life: 3000
      });
    else if (isBoolGroup(props.focus))
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property",
        detail: `Property "${selectedProperty.value.name ? selectedProperty.value.name : props.value.property.concept.iri}" is not valid for focus "${props
          .focus?.ecl}"`,
        life: 3000
      });
  }
}

async function processValueProp() {
  if (isObjectHasKeys(props.value.value.concept, ["entityType"])) selectedValue.value = props.value.value.concept as ConceptSummary;
  else {
    const valueSummary = (selectedValue.value = await EntityService.getEntitySummary(props.value.value.concept.iri));
    if (isObjectHasKeys(valueSummary)) {
      selectedValue.value = valueSummary;
    } else {
      selectedValue.value = {} as ConceptSummary;
      throw new Error("Value iri does not exist");
    }
  }
  await updateIsValidPropertyValue();
  if (!isValidPropertyValue.value) {
    toast.add({
      severity: ToastSeverity.ERROR,
      summary: "Invalid property value",
      detail: `Value "${props.value.value.concept.name ? props.value.value.concept.name : props.value.value.concept.iri}" is not valid for property "${
        props.value.property.concept.name ? props.value.property.concept.name : props.value.property.concept.iri
      }"`,
      life: 3000
    });
  }
}

function generateEcl(): string {
  let ecl = "";
  if (hasProperty.value) ecl += builderConceptToEcl(props.value.property, includeTerms.value);
  else ecl += "[ UNKNOWN PROPERTY ]";
  if (props.value.operator) ecl += " " + props.value.operator + " ";
  if (hasValue.value) ecl += builderConceptToEcl(props.value.value, includeTerms.value);
  else ecl += "[ UNKNOWN VALUE ]";
  return ecl;
}

async function updateProperty(property: ConceptSummary) {
  props.value.property.concept = property;
  props.value.ecl = generateEcl();
  await getPropertyTreeRoots();
}

async function updateValue(value: ConceptSummary) {
  props.value.value.concept = value;
  props.value.ecl = generateEcl();
  await getValueTreeRoots();
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
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.search-text {
  flex: 1 1 auto;
  min-width: 25rem;
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
  height: 2.7rem;
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
