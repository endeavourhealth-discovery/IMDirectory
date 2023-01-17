<template>
  <div class="nested-div">
    <div style="display: flex">
      <AutoComplete
        style="flex: 1"
        input-style="flex:1"
        field="name"
        dataKey="iri"
        v-model="value.property.concept"
        :suggestions="propertyResults"
        @complete="searchProperty($event.query)"
      />
      <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value" />
      <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions" />
      <AutoComplete
        style="flex: 1"
        input-style="flex:1"
        field="name"
        dataKey="iri"
        v-model="value.value.concept"
        :suggestions="valueResults"
        @complete="searchValue($event.query)"
      />
      <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, onMounted } from "vue";
import { EntityService, QueryService } from "@/services";
import { QueryRequest, SearchRequest } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";

const props = defineProps({
  value: {
    type: Object as PropType<{ type: string; operator: string; property: { concept: any; descendants: string }; value: { concept: any; descendants: string } }>,
    required: true
  },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const store = useStore();
const propertyController: Ref<AbortController> = ref({} as AbortController);
const valueController: Ref<AbortController> = ref({} as AbortController);
const loadingProperty = ref(false);
const loadingValue = ref(false);

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
  if (props.value && props.value.property.concept && props.value.property.concept.iri) {
    await searchProperty(props.value.property.concept.iri);
    if (propertyResults.value.length) props.value.property.concept = propertyResults.value[0];
  }
  if (props.value && props.value.value.concept && props.value.value.concept.iri) {
    await searchValue(props.value.value.concept.iri);
    if (valueResults.value.length) props.value.value.concept = valueResults.value[0];
  }
});

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
}
</script>

<style scoped>
.nested-div {
  padding: 0;
  border: none;
  border-radius: 5px;
  background-color: unset;
  margin: 0.5rem;
  flex: 1;
}
</style>
