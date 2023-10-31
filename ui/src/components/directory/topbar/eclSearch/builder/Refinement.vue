<template>
  <div class="refinement-content-container">
    <div
      class="search-text"
      :class="[!isValidProperty && 'p-invalid', !loadingProperty && hasFocus && 'clickable']"
      @click="hasFocus ? (showPropertyDialog = true) : (showPropertyDialog = false)"
      v-tooltip="{ value: selectedProperty.name ?? '', class: 'entity-tooltip' }"
    >
      <span class="selected-label">{{ selectedProperty.name ?? "Search..." }}</span>
    </div>
    <DirectorySearchDialog
      v-if="showPropertyDialog"
      v-model:show-dialog="showPropertyDialog"
      v-model:selected="selectedProperty"
      :search-by-function="propertyFunctionRequest"
    />
    <DirectorySearchDialog
      v-if="showValueDialog"
      v-model:show-dialog="showValueDialog"
      v-model:selected="selectedValue"
      :search-by-function="valueFunctionRequest"
    />
    <!-- <AutoComplete
      style="flex: 1"
      :input-style="{ flex: 1 }"
      field="name"
      dataKey="iri"
      v-model="selectedProperty"
      :suggestions="propertyResults"
      @complete="searchProperty($event.query)"
      placeholder="search..."
      :disabled="loadingProperty || !hasFocus()"
      :optionDisabled="disableOption"
      :class="!isValidProperty ? 'p-invalid' : ''"
      :forceSelection="true"
    /> -->
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <div
      class="search-text"
      :class="[!isValidPropertyValue && 'p-invalid', !loadingProperty && selectedProperty && 'clickable']"
      @click="hasProperty ? (showValueDialog = true) : (showValueDialog = false)"
      v-tooltip="{ value: selectedValue.name ?? '', class: 'entity-tooltip' }"
    >
      <span class="selected-label">{{ selectedValue.name ?? "Search..." }}</span>
    </div>
    <!-- <AutoComplete
      style="flex: 1"
      :input-style="{ flex: 1 }"
      field="name"
      dataKey="iri"
      v-model="selectedValue"
      :suggestions="valueResults"
      @complete="searchValue($event.query)"
      placeholder="search..."
      :disabled="!selectedProperty || typeof selectedProperty == 'string' || loadingValue"
      :class="!isValidPropertyValue ? 'p-invalid' : ''"
      :forceSelection="true"
    /> -->
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch, onBeforeUnmount, h, inject, computed } from "vue";
import { EntityService, QueryService } from "@/services";
import { useDialog } from "primevue/usedialog";
import { IM, RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@im-library/enums";
import _ from "lodash";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { FunctionRequest } from "@im-library/interfaces/AutoGen";

interface Props {
  value: {
    type: string;
    operator: string;
    property: { concept: { iri: string; name?: string } | ConceptSummary; descendants: string };
    value: { concept: { iri: string; name?: string | ConceptSummary }; descendants: string };
    ecl?: string;
  };
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

watch(
  () => _.cloneDeep(props.value),
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
  () => _.cloneDeep(props.focus),
  async (newValue, oldValue) => {
    if (newValue && ((isAliasIriRef(newValue) && newValue.iri) || isBoolGroup(newValue))) {
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
  if (isObjectHasKeys(props, ["focus"]) && (isAliasIriRef(props.focus) || isBoolGroup(props.focus))) return true;
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

watch(selectedProperty, async newValue => {
  if (newValue) updateProperty(newValue);
});

watch(selectedValue, newValue => {
  if (newValue) updateValue(newValue);
});

watch([() => _.cloneDeep(props.focus), () => _.cloneDeep(props.value.property.concept)], async () => {
  await updateIsValidProperty();
});

watch([selectedProperty, () => _.cloneDeep(props.value.value.concept)], async () => {
  await updateIsValidPropertyValue();
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

const propertyFunctionRequest = { functionIri: IM.function.ALLOWABLE_PROPERTIES } as FunctionRequest;
const valueFunctionRequest = { functionIri: IM.function.ALLOWABLE_RANGES } as FunctionRequest;

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await updateIsValidProperty();
  await updateIsValidPropertyValue();
  await processProps();
  loadingProperty.value = false;
  loadingValue.value = false;
});

async function updateIsValidProperty(): Promise<void> {
  if (props.focus?.iri === "any" || props.focus.iri === "*") isValidProperty.value = true;
  else if (isAliasIriRef(props.focus) && hasProperty.value) {
    isValidProperty.value = await EntityService.isValidProperty(props.focus?.iri, props.value.property.concept.iri);
  } else if (isBoolGroup(props.focus) && hasProperty.value && props.focus.ecl) {
    isValidProperty.value = await EntityService.isValidPropertyBoolFocus(props.focus, props.value.property.concept.iri);
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (hasValue.value && hasProperty.value)
    isValidPropertyValue.value = await EntityService.isValidPropertyValue(props.value.property.concept.iri, props.value.value.concept.iri);
  else isValidPropertyValue.value = false;
}

async function processProps() {
  if (hasProperty.value && hasFocus.value) {
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
  if (hasValue.value && hasProperty.value) {
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
}

// async function searchProperty(term: string) {
//   if (!hasFocus()) return;
//   if (term && term.length > 2) {
//     if (term.toLowerCase() === "any") {
//       propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
//     } else {
//       if (propertyController.value) propertyController.value.abort();

//       propertyController.value = new AbortController();

//       let matches: any[] = [];
//       if (isAliasIriRef(props.focus)) matches = await QueryService.getAllowablePropertySuggestions(props.focus?.iri, term, propertyController.value);
//       else if (isBoolGroup(props.focus)) matches = await QueryService.getAllowablePropertySuggestionsBoolFocus(props.focus, term, propertyController.value);
//       propertyResults.value = matches;
//     }
//   } else if (term === "*") {
//     propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
//   } else propertyResults.value = [{ iri: null, name: "3 character minimum", code: "UNKNOWN" }];
// }

// async function searchValue(term: string) {
//   if (!selectedProperty.value.iri) return;
//   if (term && term.length > 2) {
//     if (term.toLowerCase() === "any") {
//       valueResults.value = [{ iri: "any", name: "ANY", code: "any" }];
//     } else {
//       if (valueController.value) valueController.value.abort();

//       valueController.value = new AbortController();
//       valueResults.value = await QueryService.getAllowableRangeSuggestions(selectedProperty.value.iri, term, valueController.value);
//     }
//   } else if (term === "*") {
//     valueResults.value = [{ iri: "any", name: "ANY", code: "any" }];
//   } else valueResults.value = [{ iri: null, name: "3 character minimum", code: "UNKNOWN" }];
// }

function generateEcl(): string {
  let ecl = "";
  if (hasProperty.value) ecl += builderConceptToEcl(props.value.property, includeTerms.value);
  else ecl += "[ UNKNOWN PROPERTY ]";
  if (props.value.operator) ecl += " " + props.value.operator + " ";
  if (hasValue.value) ecl += builderConceptToEcl(props.value.value, includeTerms.value);
  else ecl += "[ UNKNOWN VALUE ]";
  return ecl;
}

function updateProperty(property: ConceptSummary) {
  props.value.property.concept = property;
  props.value.ecl = generateEcl();
}

function updateValue(value: ConceptSummary) {
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
</style>
