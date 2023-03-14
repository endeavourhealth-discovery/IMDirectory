<template>
  <div class="refinement-content-container nested-div">
    <AutoComplete
      style="flex: 1"
      input-style="flex:1"
      field="name"
      dataKey="iri"
      v-model="selectedProperty"
      :suggestions="propertyResults"
      @complete="searchProperty($event.query)"
      placeholder="search..."
      :disabled="loadingProperty || !hasFocus(focus)"
      :optionDisabled="disableOption"
    />
    <Button :disabled="!focus" icon="fa-solid fa-sitemap" @click="openTree('property')" class="tree-button" />
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <AutoComplete
      style="flex: 1"
      input-style="flex:1"
      field="name"
      dataKey="iri"
      v-model="selectedValue"
      :suggestions="valueResults"
      @complete="searchValue($event.query)"
      placeholder="search..."
      :disabled="!selectedProperty || typeof selectedProperty == 'string' || loadingValue"
    />
    <Button :disabled="!selectedProperty" icon="fa-solid fa-sitemap" @click="openTree('value')" class="tree-button" />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch, provide, onBeforeUnmount, h, computed, ComputedRef, inject } from "vue";
import { EntityService, QueryService } from "@/services";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useDialog } from "primevue/usedialog";
import { RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import EclTree from "../EclTree.vue";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@im-library/enums";
import _ from "lodash";

const props = defineProps({
  value: {
    type: Object as PropType<{
      type: string;
      operator: string;
      property: { concept: any; descendants: string };
      value: { concept: any; descendants: string };
      ecl?: string;
    }>,
    required: true
  },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

watch(
  () => _.cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (newValue) {
      if (!oldValue) await processProps();
      else {
        if (newValue?.property?.concept?.iri !== oldValue?.property?.concept?.iri) await processProps();
        if (newValue?.value?.concept?.iri !== oldValue?.value?.concept?.iri) await processProps();
      }
    } else {
      clearAll();
    }
  }
);

watch(
  () => _.cloneDeep(props.focus),
  async (newValue, oldValue) => {
    if (newValue && ((isAliasIriRef(newValue) && newValue.iri) || isBoolGroup(newValue))) {
      await processProps();
    } else clearAll();
  }
);

const toast = useToast();

let treeDialog = useDialog();

const includeTerms = inject("includeTerms") as Ref<boolean>;

watch(includeTerms, () => (props.value.ecl = generateEcl()));

const selectedProperty: Ref<any | null> = ref(null);
const selectedValue: Ref<any | null> = ref(null);
const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const propertyController: Ref<AbortController | undefined> = ref(undefined);
const valueController: Ref<AbortController | undefined> = ref(undefined);
const loadingProperty = ref(false);
const loadingValue = ref(false);

watch(selectedProperty, async newValue => {
  updateProperty(newValue);
  if (!loadingValue.value && newValue?.name && hasValue()) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      await searchValue(name);
      if (isArrayHasLength(valueResults.value)) selectedValue.value = valueResults.value.find(result => result.iri === props.value.value.concept.iri);
      else selectedValue.value = null;
    } else throw new Error("Value iri does not exist");
  }
});

watch(selectedValue, newValue => {
  updateValue(newValue);
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
  await processProps();
});

onBeforeUnmount(() => {
  if (propertyController.value) propertyController.value.abort();
  if (valueController.value) valueController.value.abort();
});

async function processProps() {
  if (hasProperty() && hasFocus()) {
    loadingProperty.value = true;
    loadingValue.value = true;
    let name = "";
    if (props.value.property.concept.name) name = props.value.property.concept.name;
    else name = await findIriName(props.value.property.concept.iri);
    if (name) {
      if (
        hasProperty() &&
        hasFocus() &&
        isAliasIriRef(props.focus) &&
        (props.focus?.iri === "any" || (await EntityService.isValidProperty(props.focus?.iri, props.value.property.concept.iri)))
      ) {
        selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri);
      } else if (
        hasProperty() &&
        hasFocus() &&
        isBoolGroup(props.focus) &&
        (await EntityService.isValidPropertyBoolFocus(props.focus, props.value.property.concept.iri))
      ) {
        selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri);
      } else {
        selectedProperty.value = null;
        updateProperty(null);
        updateValue(null);
        if (isAliasIriRef(props.focus))
          toast.add({
            severity: ToastSeverity.ERROR,
            summary: "Invalid property",
            detail: `Property "${name ? name : props.value.property.concept.iri}" is not valid for concept "${
              props.focus?.name ? props.focus.name : props.focus?.iri
            }"`
          });
        else
          toast.add({
            severity: ToastSeverity.ERROR,
            summary: "Invalid property",
            detail: `Property "${name ? name : props.value.property.concept.iri}" is not valid for focus "${props.focus}"`
          });
      }
    } else throw new Error("Property iri does not exist");
  }
  loadingProperty.value = false;
  if (hasValue() && selectedProperty.value?.iri) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      if (hasValue() && selectedProperty.value?.iri && (await EntityService.isValidPropertyValue(selectedProperty.value.iri, props.value.value.concept.iri))) {
        selectedValue.value = await EntityService.getEntitySummary(props.value.value.concept.iri);
      } else {
        selectedValue.value = null;
        updateValue(null);
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property value",
          detail: `Value "${name ? name : props.value.value.concept.iri}" is not valid for property "${
            props.value.property.concept.name ? props.value.property.concept.name : props.value.property.concept.iri
          }"`
        });
      }
    } else throw new Error("Value iri does not exist");
  }
  loadingValue.value = false;
}

function clearAll() {
  selectedProperty.value = null;
  selectedValue.value = null;
}

async function searchProperty(term: string) {
  selectedValue.value = null;
  if (!hasFocus()) return;
  if (term.length > 2) {
    if (term.toLowerCase() === "any") {
      propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      if (propertyController.value) propertyController.value.abort();

      propertyController.value = new AbortController();

      let matches = [];
      if (isAliasIriRef(props.focus)) matches = await QueryService.getAllowablePropertySuggestions(props.focus?.iri, term, propertyController.value);
      else if (isBoolGroup(props.focus)) matches = await QueryService.getAllowablePropertySuggestionsBoolFocus(props.focus, term, propertyController.value);

      if (!matches) propertyResults.value = [{ iri: null, name: "No matches", code: "UNKNOWN" }];
      else propertyResults.value = matches;
    }
  } else if (term === "*") {
    propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
  } else propertyResults.value = [{ iri: null, name: "3 character minimum", code: "UNKNOWN" }];
}

async function searchValue(term: string) {
  if (!selectedProperty.value.iri) return;
  if (term.length > 2) {
    if (term.toLowerCase() === "any") {
      valueResults.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      if (valueController.value) valueController.value.abort();

      valueController.value = new AbortController();
      const matches = await QueryService.getAllowableRangeSuggestions(selectedProperty.value.iri, term, valueController.value);
      if (!matches) valueResults.value = [{ iri: null, name: "No matches", code: "UNKNOWN" }];
      else valueResults.value = matches;
    }
  } else if (term === "*") {
    valueResults.value = [{ iri: "any", name: "ANY", code: "any" }];
  } else valueResults.value = [{ iri: null, name: "3 character minimum", code: "UNKNOWN" }];
}

async function findIriName(iri: string) {
  const result = await EntityService.getPartialEntity(iri, [RDFS.LABEL]);
  if (result && isObjectHasKeys(result, [RDFS.LABEL])) {
    return result[RDFS.LABEL];
  } else return "";
}

function generateEcl(): string {
  let ecl = "";
  if (hasProperty()) ecl += builderConceptToEcl(props.value.property, includeTerms.value);
  else ecl += "[ UNKNOWN PROPERTY ]";
  if (props.value.operator) ecl += " " + props.value.operator + " ";
  if (hasValue()) ecl += builderConceptToEcl(props.value.value, includeTerms.value);
  else ecl += "[ UNKNOWN VALUE ]";
  return ecl;
}

function updateProperty(property: any) {
  props.value.property.concept = property;
  props.value.ecl = generateEcl();
}

function updateValue(value: any) {
  props.value.value.concept = value;
  props.value.ecl = generateEcl();
}

function disableOption(data: any) {
  return data.code === "UNKNOWN";
}

function openTree(type: string) {
  const dialogProps = {
    style: { width: "80vw", height: "80vh" },
    closable: false,
    maximizable: true,
    modal: true,
    contentStyle: { flex: "1 1 auto", display: "flex" },
    dismissableMask: true,
    autoZIndex: false
  };
  if (type === "property") {
    const dialogRef = treeDialog.open(EclTree, {
      props: dialogProps,
      templates: {
        footer: () => {
          return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
        }
      },
      data: { focus: { iri: props.focus?.iri, name: props.focus?.name }, type: "property", currentValue: props.value.property.concept },
      onClose(options) {
        if (options?.data?.type === "property") {
          selectedProperty.value = options.data.entity;
          selectedValue.value = null;
        } else if (options?.data?.type === "value") selectedValue.value = options.data.entity;
      }
    });
  } else if (type === "value") {
    const dialogRef = treeDialog.open(EclTree, {
      props: dialogProps,
      templates: {
        footer: () => {
          return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
        }
      },
      data: { focus: { iri: selectedProperty.value.iri, name: selectedProperty.value.name }, type: "value", currentValue: props.value.value.concept },
      onClose(options) {
        if (options?.data?.type === "property") {
          selectedProperty.value = options.data.entity;
          selectedValue.value = null;
        } else if (options?.data?.type === "value") selectedValue.value = options.data.entity;
      }
    });
  } else throw new Error("Unknown type encountered trying to open eclTree");
}

function hasProperty(): boolean {
  if (isObjectHasKeys(props.value.property, ["concept", "descendants"]) && isObjectHasKeys(props.value.property.concept, ["iri"])) return true;
  else return false;
}

function hasValue(): boolean {
  if (isObjectHasKeys(props.value.value, ["concept", "descendants"]) && isObjectHasKeys(props.value.value.concept, ["iri"])) return true;
  else return false;
}

function hasFocus(): boolean {
  if (isObjectHasKeys(props, ["focus"]) && (isAliasIriRef(props.focus) || isBoolGroup(props.focus))) return true;
  else return false;
}

function isAliasIriRef(data: any): data is { iri: string; name?: string } {
  if (data && isObjectHasKeys(data as { iri: string; name?: string }, ["iri"])) return true;
  else return false;
}

function isBoolGroup(data: any): data is { conjunction: string; items: any[]; type: string; ecl?: string } {
  if (data && (data as { conjunction: string; items: any[]; type: string; ecl?: string }).type === "BoolGroup") return true;
  else return false;
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

.nested-div {
  border: none;
  background-color: unset;
  border-radius: 5px;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}
</style>
