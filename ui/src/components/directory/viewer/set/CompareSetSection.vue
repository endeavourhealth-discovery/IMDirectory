<template>
  <div class="compare-set-section">
    <div v-if="header === 'Shared members '" class="section-header-shared">{{ header }} - ({{ members.length }})</div>
    <div v-else class="section-header">
      <div class="section-header-title">{{ header }}</div>
      <Inplace :closable="true">
        <template #display> {{ selectedSet.name || "Click to select set" }} - ({{ members.length }}) </template>
        <template #content>
          <AutoComplete v-model="selectedSet" optionLabel="name" :suggestions="filteredSets" @complete="searchValueSet" />
        </template>
      </Inplace>
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <Listbox v-else v-model="selected" :options="members" optionLabel="name" />
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS } from "@im-library/vocabulary";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
interface Props {
  header: string;
  selectedSet?: SearchResultSummary;
  members: any[];
  setIri?: string;
  loading: boolean;
}
const props = defineProps<Props>();

const filterStore = useFilterStore();
const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });
const controller: Ref<AbortController> = ref({} as AbortController);

const selectedSet: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const filteredSets: Ref<SearchResultSummary[]> = ref([]);
const selected = ref();

const emit = defineEmits({ "update:selectedSet": _payload => true });

watch(
  () => selectedSet.value.iri,
  async newValue => emit("update:selectedSet", selectedSet.value)
);

onMounted(async () => {
  await init();
});

async function init() {
  if (props.setIri) {
    const entity = await EntityService.getPartialEntity(props.setIri, [RDFS.LABEL]);
    selectedSet.value = { iri: entity["@id"], name: entity[RDFS.LABEL] } as SearchResultSummary;
  }
}

async function search(searchText: string): Promise<SearchResultSummary[]> {
  if (searchText && searchText.length > 2) {
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = [];
    const schemes = selectedFilters.value.schemes;
    for (const scheme of schemes) {
      searchRequest.schemeFilter!.push(scheme["@id"]);
    }

    searchRequest.statusFilter = [];
    const statusList = selectedFilters.value.status;
    for (const status of statusList) {
      searchRequest.statusFilter!.push(status["@id"]);
    }

    searchRequest.typeFilter = [];
    const types = [IM.CONCEPT_SET, IM.VALUE_SET];
    for (const type of types) {
      searchRequest.typeFilter!.push(type);
    }

    if (isArrayHasLength(selectedFilters.value.sortFields) && isObjectHasKeys(selectedFilters.value.sortFields[0])) {
      const sortField = selectedFilters.value.sortFields[0];
      if (sortField["@id"] === IM.NAMESPACE + "Usage") searchRequest.sortField = "weighting";

      if (isArrayHasLength(selectedFilters.value.sortDirections) && isObjectHasKeys(selectedFilters.value.sortDirections[0])) {
        const sortDirection = selectedFilters.value.sortDirections[0];
        if (sortDirection["@id"] === IM.NAMESPACE + "Descending") searchRequest.sortDirection = SortDirection.DESC;
        if (sortDirection["@id"] === IM.NAMESPACE + "Ascending") searchRequest.sortDirection = SortDirection.ASC;
      }
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await EntityService.advancedSearch(searchRequest, controller.value);
    if (result?.entities) return result.entities;
  }
  return [];
}

async function searchValueSet(event: any) {
  const searchTerm: string = event.query;
  filteredSets.value = await search(searchTerm);
}
</script>

<style scoped>
.section-header-title {
  padding-bottom: 1rem;
}
.section-header {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.section-header-shared {
  display: flex;
  justify-content: center;
  align-items: baseline;
  padding-bottom: 1rem;
}

.compare-set-section {
  height: 100%;
  width: 100%;
}

.p-listbox {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.loading-icon {
  flex: 0 0 auto;
}
</style>
