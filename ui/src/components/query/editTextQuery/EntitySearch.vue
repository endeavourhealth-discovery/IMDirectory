<template>
  <AutoComplete v-model="selected" optionLabel="name" :suggestions="suggestions" @complete="debounceForSearch" @item-select="onSelect" />
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { onMounted, PropType, Ref, ref, computed, watch } from "vue";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  entityValue: ConceptSummary;
}

const props = defineProps<Props>();

const filterStore = useFilterStore();

watch(
  () => props.entityValue.iri,
  () => initValues()
);

const controller: Ref<AbortController> = ref({} as AbortController);
const filterDefaults: Ref<FilterOptions> = computed(() => filterStore.filterDefaults);
const selected: Ref<ConceptSummary> = ref("" as any);
const suggestions: Ref<ConceptSummary[]> = ref([]);
const debounce = ref(0);

onMounted(() => {
  initValues();
});

function onSelect() {
  props.entityValue.iri = selected.value.iri;
  props.entityValue.name = selected.value.name;
}
function initValues() {
  selected.value = { iri: props.entityValue.iri, name: props.entityValue.name || props.entityValue.iri } as ConceptSummary;
}

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
</script>

<style scoped></style>
