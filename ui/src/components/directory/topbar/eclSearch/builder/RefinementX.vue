<template>
  <div class="nested-div">
    <div style="display: flex">
      <AutoComplete style="flex: 1" input-style="flex:1" field="name" dataKey="iri" v-model="value.property.concept" :suggestions="propertyResults" @complete="searchProperty(value.property.concept)"></AutoComplete>
      <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
      <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions"></Dropdown>
      <AutoComplete style="flex: 1" input-style="flex:1" field="name" dataKey="iri" v-model="value.value.concept" :suggestions="valueResults" @complete="searchValue(value.value.concept)"></AutoComplete>
      <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref, Ref} from 'vue';
import { QueryService} from '@/services';
import { QueryRequest } from "@im-library/interfaces";
import {AbortController} from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import {useStore} from 'vuex';

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false },
});

const propertyResults: Ref<any[]> = ref([]);
const valueResults: Ref<any[]> = ref([]);
const store = useStore();
const propertyController: Ref<AbortController> = ref({} as AbortController);
const valueController: Ref<AbortController> = ref({} as AbortController);

const descendantOptions = [
  {
    label: 'only',
    value: ''
  },
  {
    label: 'plus descendants',
    value: '<<'
  },
  {
    label: 'descendants only',
    value: '<'
  }
]

const operatorOptions = ["=", "!="]

async function searchProperty(term: string) {
  if (!props.focus?.iri)
    return;

  const req: QueryRequest = {
    iri: 'http://endhealth.info/im#Query_AllowableProperties',
    textSearch: term,
    argument: [{ parameter: 'this', valueIri: props.focus.iri }]
  } as QueryRequest;

  if ((propertyController.value && propertyController.value.abort)) {
    propertyController.value.abort();
  }
  propertyController.value = new AbortController();
  const matches = await QueryService.queryIM(req);

  if (!matches || !matches.entities)
    propertyResults.value = [
      {iri: null, name: "No matches", code: "UNKNOWN"}
    ]
  else
    propertyResults.value = matches.entities.map(e => {
      return {
        iri: e['@id'],
        name: e['http://www.w3.org/2000/01/rdf-schema#label'],
        code: e['http://endhealth.info/im#code']
      };
    })
}

async function searchValue(term: string) {
  if (!props.value.property.concept.iri)
    return;

  const req: QueryRequest = {
    iri: 'http://endhealth.info/im#Query_AllowableRanges',
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
    })
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
