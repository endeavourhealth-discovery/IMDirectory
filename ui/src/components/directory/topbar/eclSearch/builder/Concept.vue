<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <div class="concept-content-container">
      <AutoComplete
        style="flex: 1"
        input-style="flex:1"
        field="name"
        dataKey="iri"
        v-model="selected"
        :suggestions="suggestions"
        @complete="search($event.query)"
        placeholder="Search..."
        :disabled="loading"
      />
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
      <Dropdown style="width: 12rem" v-model="value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    </div>
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div style="display: flex">
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index === 1" type="button" :label="value.operator" @click="toggleBool" />
          <Button v-else-if="index > 1" type="button" :label="value.operator" class="p-button-secondary" disabled />
        </span>
        <component v-if="!loading" :is="item.type" :value="item" :parent="value" :focus="value.concept" />
        <div v-else><ProgressSpinner class="loading-icon" stroke-width="8" /></div>
        <span class="remove-group">
          <Button @click="deleteItem(index)" :class="[hover ? 'p-button-danger' : 'p-button-placeholder']" icon="pi pi-trash" />
        </span>
      </div>
    </template>
    <div class="add-group">
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Refinement" @click="addRefinement" />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Group" @click="addGroup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, PropType, watch } from "vue";
import { SearchRequest } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";
import { EntityService } from "@/services";
import _ from "lodash";

const props = defineProps({
  value: { type: Object as PropType<{ type: string; descendants: string; operator: string; items: any[]; concept: { iri: string } }>, required: true },
  parent: { type: Object as PropType<any>, required: false }
});

const store = useStore();

const selected: Ref<any | null> = ref(null);
const controller: Ref<AbortController> = ref({} as AbortController);
const suggestions: Ref<any[]> = ref([]);
const menuBool = ref();
const loading = ref(false);

const boolOptions = [
  {
    label: "AND",
    command: () => (props.value.operator = "AND")
  },
  {
    label: "OR",
    command: () => (props.value.operator = "OR")
  },
  {
    label: "NOT",
    command: () => (props.value.operator = "MINUS")
  }
];

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

onMounted(async () => {
  if (props.value && props.value.concept && props.value.concept.iri) {
    loading.value = true;
    await search(props.value.concept.iri);
    selected.value = suggestions.value[0];
    loading.value = false;
  }
});

watch(selected, newValue => {
  props.value.concept = newValue;
});

const hover = ref();
function mouseover(event: Event) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function toggleBool(event: Event) {
  menuBool.value.toggle(event);
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

  if (controller.value && controller.value.abort) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.advancedSearch(searchRequest, controller.value);
}

function addRefinement() {
  add({ type: "RefinementX", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", operator: "AND" });
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
  props.value.items.splice(index, 1);
}
</script>

<style scoped lang="scss">
@use "primevue/resources/themes/saga-blue/theme.css";

.p-button-placeholder {
  @extend .p-button-secondary;
  @extend .p-button-outlined;
  color: #00000030 !important;
  border-style: dashed !important;
}

.concept-content-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

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

.nested-div-hover {
  @extend .nested-div;
  border: #ff8c00 1px solid;
}

Button {
  margin-right: 4px;
  height: 1.5rem;
  align-self: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.add-group {
  width: 100%;
}

.remove-group {
  width: 2rem;
  display: flex;
}
</style>
