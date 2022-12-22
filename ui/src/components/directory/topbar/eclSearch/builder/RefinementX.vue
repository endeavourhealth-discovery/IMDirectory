<template>
  <div class="nested-div">
    <div style="display: flex">
      <AutoComplete style="flex: 1" input-style="flex:1" field="name" dataKey="iri" v-model="value.property.concept" :suggestions="suggestions" @complete="search(value.property.concept)"></AutoComplete>
      <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
      <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions"></Dropdown>
      <AutoComplete style="flex: 1" input-style="flex:1" field="name" dataKey="iri" v-model="value.value.concept" :suggestions="suggestions" @complete="search(value.value.concept)"></AutoComplete>
      <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref, Ref} from 'vue';
import {EntityService} from '@/services';
import { SearchRequest } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import {AbortController} from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import {useStore} from 'vuex';

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
});

const suggestions: Ref<any[]> = ref([]);
const store = useStore();
const controller: Ref<AbortController> = ref({} as AbortController);

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

async function search(term: string) {
  console.log("SEARCH");
  console.log(term);
  const searchRequest = {} as SearchRequest;
  searchRequest.termFilter = term;
  searchRequest.sortBy = SortBy.Usage;
  searchRequest.page = 1;
  searchRequest.size = 100;
  searchRequest.schemeFilter = ["http://snomed.info/sct#"];

  if ((controller.value && controller.value.abort)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.advancedSearch(searchRequest, controller.value);
}

</script>

<style scoped>
.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
}
</style>
