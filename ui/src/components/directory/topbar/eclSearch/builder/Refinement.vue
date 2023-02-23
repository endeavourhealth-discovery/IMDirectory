<template>
  <div class="refinement-content-container nested-div">
    <AutoComplete
      :forceSelection="true"
      style="flex: 1"
      input-style="flex:1"
      field="name"
      dataKey="iri"
      v-model="selectedProperty"
      :suggestions="propertyResults"
      @complete="searchProperty($event.query)"
      placeholder="search..."
      :disabled="loadingProperty || !focus?.iri"
      :optionDisabled="disableOption"
    />
    <Button :disabled="!focus" icon="fa-solid fa-sitemap" @click="openTree('property')" />
    <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
    <AutoComplete
      :forceSelection="true"
      style="flex: 1"
      input-style="flex:1"
      field="name"
      dataKey="iri"
      v-model="selectedValue"
      :suggestions="valueResults"
      @complete="searchValue($event.query)"
      placeholder="search..."
      :disabled="!selectedProperty || loadingValue"
    />
    <Button :disabled="!selectedProperty" icon="fa-solid fa-sitemap" @click="openTree('value')" />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch, provide, onBeforeUnmount, h, computed } from "vue";
import { EntityService, QueryService } from "@/services";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";
import { useDialog } from "primevue/usedialog";
import { RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import EclTree from "../EclTree.vue";
import Button from "primevue/button";

const props = defineProps({
  value: {
    type: Object as PropType<{ type: string; operator: string; property: { concept: any; descendants: string }; value: { concept: any; descendants: string } }>,
    required: true
  },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

let treeDialog = useDialog();

const selectedProperty: Ref<any | null> = ref(null);
const selectedValue: Ref<any | null> = ref(null);
const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const store = useStore();
const propertyController: Ref<AbortController | undefined> = ref(undefined);
const valueController: Ref<AbortController | undefined> = ref(undefined);
const loadingProperty = ref(false);
const loadingValue = ref(false);

const hasProperty = computed(() => {
  return props.value?.property?.concept?.iri;
});
const hasValue = computed(() => {
  return props.value?.value?.concept?.iri;
});
const hasFocus = computed(() => {
  return isObjectHasKeys(props, ["focus"]) && isObjectHasKeys(props.focus, ["iri"]);
});

watch(selectedProperty, async newValue => {
  props.value.property.concept = newValue;
  if (!loadingValue.value && newValue?.name && hasValue.value) {
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
  props.value.value.concept = newValue;
});

watch(
  () => props.focus,
  async newValue => {
    if (newValue && newValue.iri) {
      await processProps();
    } else clearAll();
  }
);

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
  if (hasProperty.value) {
    loadingProperty.value = true;
    loadingValue.value = true;
    let name = "";
    if (props.value.property.concept.name) name = props.value.property.concept.name;
    else name = await findIriName(props.value.property.concept.iri);
    if (name) {
      if (await EntityService.isValidProperty(props.focus?.iri, props.value.property.concept.iri)) {
        selectedProperty.value = await EntityService.getEntitySummary(props.value.property.concept.iri);
      } else selectedProperty.value = null;
    } else throw new Error("Property iri does not exist");
  }
  loadingProperty.value = false;
  if (hasValue.value && selectedProperty.value) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      if (await EntityService.isValidPropertyValue(selectedProperty.value.iri, props.value.value.concept.iri)) {
        selectedValue.value = await EntityService.getEntitySummary(props.value.value.concept.iri);
      } else selectedValue.value = null;
    } else throw new Error("Value iri does not exist");
  }
  loadingValue.value = false;
}

function clearAll() {
  selectedProperty.value = null;
  selectedValue.value = null;
}

async function searchProperty(term: string) {
  if (!hasFocus.value) return;
  if (term.length > 2) {
    if (term.toLowerCase() === "any") {
      propertyResults.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      if (propertyController.value) propertyController.value.abort();

      propertyController.value = new AbortController();

      const matches = await QueryService.getAllowablePropertySuggestions(props.focus?.iri, term, propertyController.value);

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
</style>
