<template>
  <div v-if="!loading" class="compare-set-section">
    <div class="section-header">
      <div>{{ header }}</div>
      <AutocompleteSearchBar
        v-if="header !== 'Shared members '"
        v-model:selected="selectedSet"
        :root-entities="[IM.NAMESPACE + 'Sets']"
        :im-query="searchQuery"
      />
      <div v-if="isArrayHasLength(members)">Total members ({{ members.length }})</div>
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <Listbox
      v-model="selected"
      :options="members"
      optionLabel="name"
      :virtualScrollerOptions="{ itemSize: 45, delay: 150 }"
      listStyle="height: 97%"
      filter
      filter-placeholder="Filter"
    >
      <template #option="{ option }: { option: Concept }">
        <div class="member-name" @mouseover="showOverlay($event, option['@id'])" @mouseleave="hideOverlay" @contextmenu="onMemberRightClick($event, option)">
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
import { isArrayHasLength, isObject } from "@/helpers/DataTypeCheckers";
import { FilterOptions, SearchOptions } from "@/interfaces";
import { Concept, QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { IM, RDFS } from "@/vocabulary";
import { useToast } from "primevue/usetoast";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
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
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const controller: Ref<AbortController> = ref({} as AbortController);
const menu = ref();

const selectedSet: Ref<SearchResultSummary | undefined> = ref();
const filteredSets: Ref<SearchResultSummary[]> = ref([]);
const selected: Ref<Concept | undefined> = ref();
const searchQuery: Ref<QueryRequest | undefined> = ref();
const loading = ref(true);
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
    command: () => {
      if (selected.value?.["@id"]) directService.view(selected.value["@id"]);
    }
  }
]);

const emit = defineEmits({ "update:selectedSet": _payload => true });

watch(
  () => selectedSet.value?.iri,
  async newValue => emit("update:selectedSet", selectedSet.value)
);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

async function init() {
  if (props.setIri) {
    const entity = await EntityService.getEntitySummary(props.setIri);
    if (entity) selectedSet.value = entity;
    const queryFilterOptions: SearchOptions = {
      schemes: filterOptions.value.schemes,
      status: filterOptions.value.status,
      types: [
        { "@id": IM.CONCEPT_SET },
        { "@id": IM.SET },
        { "@id": IM.QUERY_SET },
        { "@id": IM.VALUE_SET },
        { "@id": IM.CONCEPT_SET },
        { "@id": IM.CONCEPT_SET_GROUP }
      ],
      textSearch: entity.name,
      page: { pageNumber: 1, pageSize: 100 }
    };
    searchQuery.value = buildIMQueryFromFilters(queryFilterOptions);
  }
}

function onMemberRightClick(event: any, option: Concept) {
  selected.value = option;
  menu.value.show(event);
}
</script>

<style scoped>
.section-header {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}

.p-listbox {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.p-listbox:deep(.p-listbox-list) {
  width: 100%;
}

.loading-icon {
  flex: 0 0 auto;
}

.member-name {
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

<style>
.p-listbox-item {
  width: 100%;
  height: 100%;
}
</style>
