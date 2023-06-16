<template>
  <Dropdown :options="['in', 'notIn']" v-model:model-value="whereType" />
  <AutoComplete v-model="selected" optionLabel="name" :suggestions="suggestions" @complete="debounceForSearch" @item-select="onSelect" />
  <EntailmentOptionsSelect :entailmentOptions="entailmentOptions" />
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "../../editTextQuery/EntailmentOptionsSelect.vue";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { Match } from "@im-library/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

interface Props {
  baseEntityMatch: Match;
  editMatch: Match;
}

const props = defineProps<Props>();
const filterStore = useFilterStore();
const whereType = ref("in");
const entailmentOptions: Ref<string[]> = ref([]);
const controller: Ref<AbortController> = ref({} as AbortController);
const filterDefaults: Ref<FilterOptions> = computed(() => filterStore.filterDefaults);
const selected: Ref<ConceptSummary> = ref({} as ConceptSummary);
const suggestions: Ref<ConceptSummary[]> = ref([]);
const debounce = ref(0);

onMounted(() => {
  selected.value.iri = props.editMatch["@id"] ?? props.editMatch["@set"] ?? (props.editMatch["@type"] as string);
  selected.value.name = getNameFromRef(props.editMatch);
  if (props.editMatch.exclude) whereType.value = "notIn";
});

function onSelect(event: any) {
  props.editMatch.name = selected.value.name;
  if (isValueSet(selected.value.entityType)) props.editMatch["@id"] = selected.value.iri;
  else if (isRecordModel(selected.value.entityType)) props.editMatch["@id"] = selected.value.iri;
  else props.editMatch["@id"] = selected.value.iri;
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
