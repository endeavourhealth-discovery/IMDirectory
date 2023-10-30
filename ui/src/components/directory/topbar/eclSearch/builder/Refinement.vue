<template>
  <div class="refinement-content-container">
    <AutoComplete
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
    />
    <Button :disabled="!focus" icon="fa-solid fa-sitemap" @click="openTree('property')" class="tree-button" />
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <AutoComplete
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
    />
    <Button :disabled="!selectedProperty" icon="fa-solid fa-sitemap" @click="openTree('value')" class="tree-button" />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch, onBeforeUnmount, h, inject } from "vue";
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
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";

interface Props {
  value: {
    type: string;
    operator: string;
    property: { concept: any; descendants: string };
    value: { concept: any; descendants: string };
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

const selectedProperty: Ref<any | null> = ref(null);
const selectedValue: Ref<any | null> = ref(null);
const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const propertyController: Ref<AbortController | undefined> = ref(undefined);
const valueController: Ref<AbortController | undefined> = ref(undefined);
const loadingProperty = ref(false);
const loadingValue = ref(false);
const isValidProperty = ref(false);
const isValidPropertyValue = ref(false);

watch(selectedProperty, async newValue => {
  if (typeof newValue === "string" || newValue === null) return;
  if (newValue) updateProperty(newValue);
  if (!loadingValue.value && newValue?.name && hasValue()) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      await searchValue(name);
      if (isArrayHasLength(valueResults.value)) selectedValue.value = valueResults.value.find(result => result.iri === props.value.value.concept.iri);
    } else throw new Error("Value iri does not exist");
  }
});

watch(selectedValue, newValue => {
  if (typeof newValue === "string" || newValue === null) return;
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

onMounted(async () => {
  loadingProperty.value = true;
  loadingValue.value = true;
  await updateIsValidProperty();
  await updateIsValidPropertyValue();
  await processProps();
  loadingProperty.value = false;
  loadingValue.value = false;
});

onBeforeUnmount(() => {
  if (propertyController.value) propertyController.value.abort();
  if (valueController.value) valueController.value.abort();
});

async function updateIsValidProperty(): Promise<void> {
  if (props.focus?.iri === "any" || props.focus.iri === "*") isValidProperty.value = true;
  else if (isAliasIriRef(props.focus) && hasProperty()) {
    isValidProperty.value = await EntityService.isValidProperty(props.focus?.iri, props.value.property.concept.iri);
  } else if (isBoolGroup(props.focus) && hasProperty() && props.focus.ecl) {
    isValidProperty.value = await EntityService.isValidPropertyBoolFocus(props.focus, props.value.property.concept.iri);
  } else isValidProperty.value = false;
}

async function updateIsValidPropertyValue(): Promise<void> {
  if (hasValue() && hasProperty())
    isValidPropertyValue.value = await EntityService.isValidPropertyValue(props.value.property.concept.iri, props.value.value.concept.iri);
  else isValidPropertyValue.value = false;
}

async function processProps() {
  if (hasProperty() && hasFocus()) {
    let name = "";
    if (props.value.property.concept.name) name = props.value.property.concept.name;
    else name = await findIriName(props.value.property.concept.iri);
    if (name) {
      if (hasProperty() && hasFocus()) {
        selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri);
        await updateIsValidProperty();
        if (!isValidProperty.value) {
          if (isAliasIriRef(props.focus))
            toast.add({
              severity: ToastSeverity.ERROR,
              summary: "Invalid property",
              detail: `Property "${name ? name : props.value.property.concept.iri}" is not valid for concept "${
                props.focus?.name ? props.focus.name : props.focus?.iri
              }"`,
              life: 3000
            });
          else if (isBoolGroup(props.focus))
            toast.add({
              severity: ToastSeverity.ERROR,
              summary: "Invalid property",
              detail: `Property "${name ? name : props.value.property.concept.iri}" is not valid for focus "${props.focus?.ecl}"`,
              life: 3000
            });
        }
      }
    } else throw new Error("Property iri does not exist");
  }
  if (hasValue() && hasProperty()) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      selectedValue.value = await EntityService.getEntitySummary(props.value.value.concept.iri);
      await updateIsValidPropertyValue();
      if (!isValidPropertyValue.value) {
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid property value",
          detail: `Value "${name ? name : props.value.value.concept.iri}" is not valid for property "${
            props.value.property.concept.name ? props.value.property.concept.name : props.value.property.concept.iri
          }"`,
          life: 3000
        });
      }
    } else throw new Error("Value iri does not exist");
  }
}

async function searchProperty(term: string) {
  if (!hasFocus()) return;
  if (term && term.length > 2) {
    if (term.toLowerCase() === "any") {
      propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      if (propertyController.value) propertyController.value.abort();

      propertyController.value = new AbortController();

      let matches: any[] = [];
      if (isAliasIriRef(props.focus)) matches = await QueryService.getAllowablePropertySuggestions(props.focus?.iri, term, propertyController.value);
      else if (isBoolGroup(props.focus)) matches = await QueryService.getAllowablePropertySuggestionsBoolFocus(props.focus, term, propertyController.value);
      propertyResults.value = matches;
    }
  } else if (term === "*") {
    propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
  } else propertyResults.value = [{ iri: null, name: "3 character minimum", code: "UNKNOWN" }];
}

async function searchValue(term: string) {
  if (!selectedProperty.value.iri) return;
  if (term && term.length > 2) {
    if (term.toLowerCase() === "any") {
      valueResults.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      if (valueController.value) valueController.value.abort();

      valueController.value = new AbortController();
      valueResults.value = await QueryService.getAllowableRangeSuggestions(selectedProperty.value.iri, term, valueController.value);
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
    if (isAliasIriRef(props.focus)) {
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
          } else if (options?.data?.type === "value") selectedValue.value = options.data.entity;
        }
      });
    }
    if (isBoolGroup(props.focus)) {
      const dialogRef = treeDialog.open(EclTree, {
        props: dialogProps,
        templates: {
          footer: () => {
            return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
          }
        },
        data: { focus: props.focus, type: "property", currentValue: props.value.property.concept },
        onClose(options) {
          if (options?.data?.type === "property") {
            selectedProperty.value = options.data.entity;
          } else if (options?.data?.type === "value") selectedValue.value = options.data.entity;
        }
      });
    }
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

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}
</style>
