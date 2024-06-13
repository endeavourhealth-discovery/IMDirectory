<template>
  <div class="compare-set-section">
    <div class="section-header">
      <div>{{ header }}</div>
      <AutoComplete v-if="header !== 'Shared members '" v-model="selectedSet" optionLabel="name" :suggestions="filteredSets" @complete="searchValueSet" />
      <div v-if="isArrayHasLength(members)">({{ members.length }})</div>
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <Listbox v-model="selected" :options="members" optionLabel="name" :virtualScrollerOptions="{ itemSize: 45, delay: 150 }" listStyle="height: 97%" filter>
      <template #option="{ option }: { option: Concept }">
        <div
          class="member-name"
          @mouseover="showOverlay($event, option['@id'])"
          @mouseleave="hideOverlay($event)"
          @contextmenu="onMemberRightClick($event, option)"
        >
          {{ option.name }}
        </div>
      </template>
    </Listbox>
    <OverlaySummary ref="OS" />
    <ContextMenu ref="menu" :model="rClickItems" />
  </div>
</template>

<script setup lang="ts">
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import setupOverlay from "@/composables/setupOverlay";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { DirectService, EntityService, QueryService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { isArrayHasLength, isObject } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions, SearchOptions } from "@im-library/interfaces";
import { Concept, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { RDFS } from "@im-library/vocabulary";
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
const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilterOptions);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });
const controller: Ref<AbortController> = ref({} as AbortController);
const menu = ref();

const selectedSet: Ref<SearchResultSummary | undefined> = ref();
const filteredSets: Ref<SearchResultSummary[]> = ref([]);
const selected: Ref<Concept | undefined> = ref();
const { copyObjectToClipboard } = setupCopyToClipboard();

const rClickItems = ref([
  {
    label: "Copy code",
    icon: "fa-solid fa-copy",
    command: async () => {
      if (selected.value?.code) copyObjectToClipboard(navigator, selected.value?.code);
    }
  },
  {
    separator: true
  },
  {
    label: "View",
    icon: "fa-duotone fa-up-right-from-square",
    command: () => directService.view(selected.value?.["@id"])
  }
]);

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

async function search(searchText: string): Promise<SearchResultSummary[]> {
  if (searchText && searchText.length > 2) {
    const filterOptions: SearchOptions = {
      schemes: selectedFilters.value.schemes,
      status: selectedFilters.value.status,
      types: selectedFilters.value.types,
      textSearch: searchText,
      page: { pageNumber: 1, pageSize: 100 }
    };

    const imQuery = buildIMQueryFromFilters(filterOptions);

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await QueryService.queryIMSearch(imQuery, controller.value);
    return result.entities ?? [];
  }
  return [];
}

async function searchValueSet(event: any) {
  const searchTerm: string = event.query;
  filteredSets.value = await search(searchTerm);
}

function onMemberRightClick(event: any, option: Concept) {
  selected.value = option;
  menu.value.show(event);
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: center;
  align-items: baseline;
  height: 5%;
}

.p-listbox {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-icon {
  flex: 0 0 auto;
}

.member-name {
  display: flex;
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
}
</style>

<style>
.p-listbox-item {
  width: 100%;
  height: 100%;
}
</style>
