<template>
  <div class="nested-div">
    <div style="display:flex">
      <AutoComplete style="flex: 1" input-style="flex:1" field="name" dataKey="iri" v-model="value.concept" :suggestions="suggestions" @complete="search(value.concept)"></AutoComplete>
      <Dropdown style="width: 12rem" v-model="value.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
    </div>
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div style="display: flex">
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index === 1" type="button" :label="value.operator" @click="toggleBool" />
          <Button v-else-if="index > 1" type="button" :label="value.operator" class="p-button-secondary" disabled />
        </span>
        <component
            :is="item.type"
            :value="item"
            :parent="value"
            :focus="value.concept"
        >
        </component>
        <span class="move-group hover-show">
          <Button @click="deleteItem(index)" class="p-button-sm p-button-danger" icon="pi pi-times"/>
        </span>
      </div>
    </template>
    <div class="add-group hover-show">
      <Button type="button" class="p-button-success" label="Add" @click="toggle" />
      <Menu ref="menu" :model="addOptions" :popup="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {Ref, ref} from 'vue';
import { SearchRequest } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import {AbortController} from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import {useStore} from 'vuex';
import {EntityService} from '@/services';

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
});

const store = useStore();

const controller: Ref<AbortController> = ref({} as AbortController);
const suggestions: Ref<any[]> = ref([]);
const menuBool = ref();
const menu = ref();

const boolOptions = [
  {
    label: 'AND',
    command: () => props.value.operator = 'AND'
  },
  {
    label: 'OR',
    command: () => props.value.operator = 'OR'
  },
  {
    label: 'NOT',
    command: () => props.value.operator = 'MINUS'
  }
];

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

const addOptions = [
  {
    label: 'Add Refinement',
    command: () => addRefinement()
  },
  {
    label: 'Add Group',
    command: () => addGroup()
  }
];

function toggleBool(event :any) {
  menuBool.value.toggle(event);
}

function toggle(event: any) {
  menu.value.toggle(event);
}

function add(item: any) {
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

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

function addRefinement() {
  add({ "type": "RefinementX", "property": {"descendants": "<<"}, "operator": "=", "value": {"descendants": "<<"}});
}

function addGroup() {
  add({ "type": "BoolGroup", "operator": "AND"});
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
  props.value.items.splice(index, 1);
}

</script>

<style scoped>
.left-container {
  display: flex;
  align-items: center;
}

.left-container > * {
  width: 4rem;
  margin: 0;
}

.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
}

Button {
  margin-right: 4px;
  height: 1.5rem;
  align-self: center;
}

.add-group {
  width: 100%;
}

.move-group {
  width: 2rem;
}

.hover-show {
  display: flex;
  content-visibility: hidden;
  min-height: 1.5rem;
}

.hover-show:hover {
  content-visibility: visible;
}

</style>
