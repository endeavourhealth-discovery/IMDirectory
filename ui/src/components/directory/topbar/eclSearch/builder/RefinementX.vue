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
      :disabled="loadingProperty"
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
      :disabled="loadingValue || !selectedProperty"
    />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted, watch } from "vue";
import { EntityService, QueryService } from "@/services";
import { QueryRequest, SearchRequest } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";
import { RDFS } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

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
  if (newValue && newValue.name && props.value && props.value.value && props.value.value.concept && props.value.value.concept.iri) {
    await searchValue(props.value.value.concept.iri);
    if (valueResults.value.length) selectedValue.value = valueResults.value[0];
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
    else {
      const result = await EntityService.getPartialEntity(props.value.property.concept.iri, [RDFS.LABEL]);
      if (result && isObjectHasKeys(result, [RDFS.LABEL])) {
        name = result[RDFS.LABEL];
      }
    }
    if (name) {
      await searchProperty(name);
      if (propertyResults.value.length) selectedProperty.value = propertyResults.value[0];
    } else throw new Error("Property iri does not exist");
  }
  if (
    props.value &&
    props.value.property &&
    props.value.property.concept &&
    props.value.property.concept.name &&
    props.value.value.concept &&
    props.value.value.concept.iri
  ) {
    await searchValue(props.value.value.concept.iri);
    if (valueResults.value.length) selectedValue.value = valueResults.value[0];
  }
  loadingProperty.value = false;
  loadingValue.value = false;
}

async function searchProperty(term: string) {
  loadingProperty.value = true;
  if (!props.focus?.iri) return;

  const req: QueryRequest = {
    query: {
      "@id": "http://endhealth.info/im#Query_AllowableProperties"
    },
    textSearch: term,
    argument: [{ parameter: "this", valueIri: props.focus.iri }]
  } as QueryRequest;

  if (propertyController.value && propertyController.value.abort) {
    propertyController.value.abort();
  }
  propertyController.value = new AbortController();
  const matches = await QueryService.queryIM(req);

  if (!matches || !matches.entities) propertyResults.value = [{ iri: null, name: "No matches", code: "UNKNOWN" }];
  else
    propertyResults.value = matches.entities.map(e => {
      return {
        iri: e["@id"],
        name: e["http://www.w3.org/2000/01/rdf-schema#label"],
        code: e["http://endhealth.info/im#code"]
      };
    });
  loadingProperty.value = false;
}

async function searchValue(term: string) {
  /*  if (!props.value.property.concept.iri)
    return;

  const req: QueryRequest = {
    query: {
      '@id': 'http://endhealth.info/im#Query_AllowableRanges'
    },
    textSearch: term,
    argument: [
      {parameter: 'this', valueIri: props.value.property.concept.iri}
    ]
  } as QueryRequest;

  if ((valueController.value && valueController.value.abort)) {
    valueController.value.abort();
  }
  valueController.value = new AbortController();
  const matches = await QueryService.queryIM(req);
  if (!matches || !matches.entities)
    valueResults.value = [{iri: null, name: "No matches", code: "UNKNOWN"}]
  else
    valueResults.value = matches.entities.map(e => {
      return {
        iri: e['@id'],
        name: e['http://www.w3.org/2000/01/rdf-schema#label'],
        code: e['http://endhealth.info/im#code']
      };
    })*/
  loadingValue.value = true;
  const searchRequest = {} as SearchRequest;
  searchRequest.termFilter = term;
  searchRequest.sortBy = SortBy.Usage;
  searchRequest.page = 1;
  searchRequest.size = 100;
  searchRequest.schemeFilter = ["http://snomed.info/sct#"];

  if (valueController.value && valueController.value.abort) {
    valueController.value.abort();
  }
  valueController.value = new AbortController();
  valueResults.value = await EntityService.advancedSearch(searchRequest, valueController.value);
  loadingValue.value = false;
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
