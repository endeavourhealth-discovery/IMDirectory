<template>
  <div class="compare-set-section">
    <div v-if="header === 'Shared members '" class="section-header-shared">{{ header }} - ({{ members.length }})</div>
    <div v-else class="section-header">
      <div class="section-header-title">{{ header }}</div>
      <Inplace :closable="true">
        <template #display> {{ selectedSet?.name || "Click to select set" }} - ({{ members.length }}) </template>
        <template #content>
          <AutoComplete v-model="selectedSet" optionLabel="name" :suggestions="filteredSets" @complete="searchValueSet" />
        </template>
      </Inplace>
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <Listbox v-else v-model="selected" :options="members" optionLabel="name">
      <template #option="{ option }">
        <div
          class="member-name"
          @dblclick="directService.view(option['@id'])"
          @mouseover="showOverlay($event, option['@id'])"
          @mouseleave="hideOverlay($event)"
        >
          <span>{{ option.name }} |</span>
          <span
            class="member-code"
            v-tooltip.right="'Copy to clipboard'"
            v-clipboard:copy="option.code"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
            >{{ option.code }}</span
          >
        </div>
      </template>
    </Listbox>
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import setupOverlay from "@/composables/setupOverlay";
import { DirectService, EntityService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { SortDirection, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions } from "@im-library/interfaces";
import { Concept, SearchRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { ToastOptions } from "@im-library/models";
import { IM, RDFS } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
interface Props {
  header: string;
  selectedSet?: SearchResultSummary;
  members: Concept[];
  setIri?: string;
  loading: boolean;
}
const props = defineProps<Props>();

const toast = useToast();
const directService = new DirectService();
const { OS, showOverlay, hideOverlay } = setupOverlay();
const filterStore = useFilterStore();
const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });
const controller: Ref<AbortController> = ref({} as AbortController);

const selectedSet: Ref<SearchResultSummary | undefined> = ref();
const filteredSets: Ref<SearchResultSummary[]> = ref([]);
const selected: Ref<Concept | undefined> = ref();

const emit = defineEmits({ "update:selectedSet": _payload => true });

watch(
  () => selectedSet.value?.iri,
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

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Code copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, "Failed to copy code to clipboard"));
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
      if (sortField["@id"] === IM.USAGE) searchRequest.sortField = "weighting";

      if (isArrayHasLength(selectedFilters.value.sortDirections) && isObjectHasKeys(selectedFilters.value.sortDirections[0])) {
        const sortDirection = selectedFilters.value.sortDirections[0];
        if (sortDirection["@id"] === IM.DESCENDING) searchRequest.sortDirection = SortDirection.DESC;
        if (sortDirection["@id"] === IM.ASCENDING) searchRequest.sortDirection = SortDirection.ASC;
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
