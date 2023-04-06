<template>
  <AutoComplete :multiple="true" option-label="name" v-model="selected" :suggestions="suggestions" @complete="debounceForSearch" @change="change" />
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { Element } from "@im-library/interfaces/AutoGen";
import { onMounted, PropType, Ref, ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  entityValue: { type: Object as PropType<Element>, required: true }
});
const controller: Ref<AbortController> = ref({} as AbortController);
const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const selected: Ref<ConceptSummary[]> = ref([]);
const suggestions: Ref<ConceptSummary[]> = ref([]);
const debounce = ref(0);

const emit = defineEmits({ onChange: (payload: ConceptSummary[]) => payload });

onMounted(async () => {
  const iri = props.entityValue["@id"] || props.entityValue["@set"] || props.entityValue["@type"];
  const cSummary = { name: props.entityValue.name || iri, iri: iri } as ConceptSummary;
  selected.value.push(cSummary);
});

async function search(searchTerm: any) {
  if (!isObject(controller.value)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, controller.value);
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}

function change() {
  emit("onChange", selected.value);
}
</script>

<style scoped></style>
