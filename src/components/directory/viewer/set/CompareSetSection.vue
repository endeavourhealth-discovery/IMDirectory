<template>
  <div v-if="!loading" class="compare-set-section">
    <div class="section-header">
      <div>{{ header }}</div>
      <AutocompleteSearchBar
        v-if="header !== 'Shared members '"
        v-model:selected="modelSelectedSet"
        :root-entities="[NAMESPACE.IM + 'Sets']"
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
        <div class="member-name" @mouseover="showOverlay($event, option.iri)" @mouseleave="hideOverlay" @contextmenu="onMemberRightClick($event, option)">
          {{ option.name }}
        </div>
      </template>
    </Listbox>
    <OverlaySummary ref="OS" />
    <ContextMenu ref="menu" :model="rClickItems" />
  </div>
</template>

<script setup lang="ts">
import { OverlaySummary } from "vue-library/components";
import { useCopyToClipboard } from "vue-library/composables";
import { useOverlay } from "vue-library/composables";
import { buildIMQueryFromFilters } from "@/helpers/buildQuery";
import { EntityService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { isArrayHasLength } from "vue-library/helpers";
import { SearchOptions } from "@/interfaces";
import type { Concept, FilterOptions, QueryRequest, SearchResultSummary } from "vue-library/interfaces";
import { IM, NAMESPACE } from "vue-library/enums";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { useDirectService } from "@/composables/useDirectService";

const props = defineProps<{
  header: string;
  members: Concept[];
  setIri?: string;
  //  loading: boolean;
}>();

const modelSelectedSet = defineModel<SearchResultSummary | undefined>("selectedSet");

const emit = defineEmits<{
  "update:selectedSet": [payload: SearchResultSummary | undefined];
}>();

const directService = useDirectService();
const { OS, showOverlay, hideOverlay } = useOverlay();
const filterStore = useFilterStore();
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const menu = ref();

const selected: Ref<Concept | undefined> = ref();
const searchQuery: Ref<QueryRequest | undefined> = ref();
const loading = ref(true);
const { copyObjectToClipboard } = useCopyToClipboard();

const rClickItems = ref([
  {
    label: "Copy code",
    icon: "fa-solid fa-copy",
    command: async () => {
      if (selected.value?.code) await copyObjectToClipboard(navigator, selected.value?.code);
    }
  },
  {
    separator: true
  },
  {
    label: "View",
    icon: "fa-duotone fa-up-right-from-square",
    command: async () => {
      if (selected.value?.iri) await directService.view(selected.value.iri);
    }
  }
]);

watch(
  () => modelSelectedSet.value?.iri,
  () => emit("update:selectedSet", modelSelectedSet.value)
);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

async function init() {
  if (props.setIri) {
    const entity = await EntityService.getEntitySummary(props.setIri);
    if (entity) modelSelectedSet.value = entity;
    const queryFilterOptions: SearchOptions = {
      schemes: filterOptions.value.schemes,
      status: filterOptions.value.status,
      types: [{ iri: IM.CONCEPT_SET }, { iri: IM.SET }, { iri: IM.QUERY_SET }, { iri: IM.VALUE_SET }, { iri: IM.CONCEPT_SET }, { iri: IM.CONCEPT_SET_GROUP }],
      textSearch: entity.name,
      page: { pageNumber: 1, pageSize: 100 }
    };
    searchQuery.value = buildIMQueryFromFilters(queryFilterOptions);
  }
}

function onMemberRightClick(event: MouseEvent, option: Concept) {
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
