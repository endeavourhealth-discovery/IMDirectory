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
      :disabled="loadingProperty || !focus?.iri"
    />
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
      :disabled="!selectedProperty || loadingValue"
    />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch } from "vue";
import { EntityService, QueryService } from "@/services";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";
import { RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const props = defineProps({
  value: {
    type: Object as PropType<{ type: string; operator: string; property: { concept: any; descendants: string }; value: { concept: any; descendants: string } }>,
    required: true
  },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

const selectedProperty: Ref<any | null> = ref(null);
const selectedValue: Ref<any | null> = ref(null);
const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const store = useStore();
const propertyController: Ref<AbortController> = ref({} as AbortController);
const valueController: Ref<AbortController> = ref({} as AbortController);
const loadingProperty = ref(false);
const loadingValue = ref(false);

watch(selectedProperty, async newValue => {
  props.value.property.concept = newValue;
  if (!loadingValue.value && newValue?.name && props.value?.value?.concept?.iri) {
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
  props.value.value.concept = newValue;
});

watch(
  () => props.focus,
  async newValue => {
    if (newValue && newValue.iri) {
      await processProps();
    }
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

async function processProps() {
  if (props.value && props.value.property && props.value.property.concept && props.value.property.concept.iri) {
    loadingProperty.value = true;
    loadingValue.value = true;
    let name = "";
    if (props.value.property.concept.name) name = props.value.property.concept.name;
    else name = await findIriName(props.value.property.concept.iri);
    if (name) {
      await searchProperty(name);
      if (isArrayHasLength(propertyResults.value))
        selectedProperty.value = propertyResults.value.find(result => result.iri === props.value.property.concept.iri);
    } else throw new Error("Property iri does not exist");
  }
  loadingProperty.value = false;
  if (props.value && selectedProperty.value && props.value.value.concept && props.value.value.concept.iri) {
    let name = "";
    if (props.value.value.concept.name) name = props.value.value.concept.name;
    else name = await findIriName(props.value.value.concept.iri);
    if (name) {
      await searchValue(name);
      if (isArrayHasLength(valueResults.value)) selectedValue.value = valueResults.value.find(result => result.iri === props.value.value.concept.iri);
    } else throw new Error("Value iri does not exist");
  }
  loadingValue.value = false;
}

async function searchProperty(term: string) {
  if (!props.focus?.iri) return;

  if (propertyController.value && propertyController.value.abort) {
    propertyController.value.abort();
  }
  propertyController.value = new AbortController();

  const matches = await QueryService.getAllowablePropertySuggestions(props.focus.iri, term, propertyController.value);

  if (!matches) propertyResults.value = [{ iri: null, name: "No matches", code: "UNKNOWN" }];
  else propertyResults.value = matches;
}

async function searchValue(term: string) {
  if (!selectedProperty.value.iri) return;

  if (valueController.value && valueController.value.abort) {
    valueController.value.abort();
  }
  valueController.value = new AbortController();
  const matches = await QueryService.getAllowableRangeSuggestions(selectedProperty.value.iri, term, valueController.value);
  if (!matches) valueResults.value = [{ iri: null, name: "No matches", code: "UNKNOWN" }];
  else valueResults.value = matches;
}

async function findIriName(iri: string) {
  const result = await EntityService.getPartialEntity(iri, [RDFS.LABEL]);
  if (result && isObjectHasKeys(result, [RDFS.LABEL])) {
    return result[RDFS.LABEL];
  } else return "";
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
