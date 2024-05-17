<template>
  <div id="search-results-main-container">
    <DataTable
      :paginator="true"
      :rows="rows"
      :value="searchResults"
      class="p-datatable-sm"
      v-model:selection="selected"
      selectionMode="single"
      @row-select="onRowSelect"
      contextMenu
      @rowContextmenu="onRowContextMenu"
      :scrollable="true"
      scrollHeight="flex"
      ref="searchTable"
      dataKey="iri"
      :autoLayout="true"
      @page="onPage($event)"
      :lazy="true"
      :total-records="totalCount"
      :rows-per-page-options="[rows, rows * 2, rows * 4, rows * 8]"
      :loading="searchLoading"
    >
      <template #empty> None </template>
      <Column field="name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #header>
          <span>Results</span>
          <span v-if="totalCount"> {{ " (" + totalCount + ")" }}</span>
          <Button
            :disabled="!searchResults"
            class="p-button-rounded p-button-text p-button-lg p-button-icon-only"
            icon="fa-duotone fa-fw fa-file-arrow-down"
            @click="exportCSV()"
            v-tooltip.right="'Download results table'"
          />
        </template>
        <template #body="{ data }: any">
          <div class="datatable-flex-cell">
            <IMFontAwesomeIcon v-if="data.icon" :style="'color: ' + data.colour" :icon="data.icon" class="recent-icon" />
            <span class="break-word" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay($event)">
              {{ data.code ? data.name + " | " + data.code : data.name }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="usageTotal" header="Usage">
        <template #body="{ data }: any">
          <span>{{ data.usageTotal }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="{ data }: any">
          <div class="buttons-container">
            <ActionButtons
              :buttons="['findInTree', 'view', 'edit', 'favourite']"
              :iri="data.iri"
              @locate-in-tree="(iri: string) => emit('locateInTree', iri)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { DirectService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import setupDownloadFile from "@/composables/downloadFile";
import { useUserStore } from "@/stores/userStore";
import _ from "lodash";
import setupOverlay from "@/composables/setupOverlay";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDialog } from "primevue/usedialog";
import { SearchResultSummary, SearchResponse, QueryRequest, SearchRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { ExtendedSearchResultSummary } from "@im-library/interfaces";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import setupSearch from "@/composables/setupSearch";
import { EclSearchRequest, FilterOptions } from "@im-library/interfaces";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  searchTerm?: string;
  updateSearch?: boolean;
  selectedFilterOptions?: FilterOptions;
  imQuery?: QueryRequest;
  osQuery?: SearchRequest;
  eclQuery?: EclSearchRequest;
  pageSize?: number;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  rowSelected: (_payload: SearchResultSummary) => true,
  locateInTree: (_payload: string) => true,
  "update:loading": _payload => true
});

onMounted(async () => {
  if (props.pageSize) rows.value = props.pageSize;
  if (props.searchTerm) await onSearch();
});

const userStore = useUserStore();
const dynamicDialog = useDialog();
const favourites = computed(() => userStore.favourites);
const filterStore = useFilterStore();
const storeFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const typeOptions = _.cloneDeep(storeFilterOptions.value.types);
const { searchLoading, search } = setupSearch();
const { downloadFile } = setupDownloadFile(window, document);

const directService = new DirectService();

const selected: Ref<ExtendedSearchResultSummary> = ref({} as ExtendedSearchResultSummary);
const searchResults: Ref<ExtendedSearchResultSummary[]> = ref([]);
const totalCount = ref(0);
const page = ref(0);
const rows = ref(25);
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Select",
    icon: "fa-solid fa-sitemap",
    command: () => directService.select((selected.value as any).iri, "Folder")
  },
  {
    label: "View in new tab",
    icon: "fa-solid fa-arrow-up-right-from-square",
    command: () => directService.view((selected.value as any).iri)
  },
  {
    separator: true
  },
  {
    label: "Favourite",
    icon: "fa-solid fa-star",
    command: () => updateFavourites()
  }
]);
const delay = ref(200);
const clicks = ref(0);
const timer: Ref<NodeJS.Timeout> = ref({} as NodeJS.Timeout);

const { OS, showOverlay, hideOverlay } = setupOverlay();

const contextMenu = ref();

watch(
  () => props.updateSearch,
  async () => await onSearch()
);

watch(
  () => searchLoading.value,
  () => emit("update:loading", searchLoading.value)
);

async function onSearch() {
  const response = await search(
    props.searchTerm,
    props.selectedFilterOptions,
    { pageNumber: page.value + 1, pageSize: rows.value },
    props.osQuery,
    props.imQuery,
    props.eclQuery
  );
  console.log(response);
  if (response?.entities && isArrayHasLength(response.entities)) processSearchResults(response);
  else {
    searchResults.value = [];
    totalCount.value = 0;
  }
}

function updateFavourites(row?: any) {
  if (row) selected.value = row.data;
  userStore.updateFavourites(selected.value.iri);
}

function isFavourite(iri: string) {
  if (!favourites.value?.length) return false;
  return favourites.value.includes(iri);
}

function processSearchResults(searchResponse: SearchResponse | undefined): void {
  if (searchResponse?.entities && isArrayHasLength(searchResponse.entities)) {
    searchResults.value = searchResponse.entities.map(result => {
      const copy: any = _.cloneDeep(result);
      copy.icon = getFAIconFromType(result.entityType);
      copy.colour = getColourFromType(result.entityType);
      copy.typeNames = getNamesAsStringFromTypes(result.entityType);
      copy.favourite = isFavourite(result.iri);
      return copy;
    });
    totalCount.value = searchResponse.count ?? 0;
  }
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

async function onPage(event: any) {
  page.value = event.page;
  rows.value = event.rows;
  await onSearch();
  scrollToTop();
}

function scrollToTop() {
  const scrollArea = document.getElementsByClassName("p-datatable-scrollable-table")[0] as HTMLElement;
  scrollArea?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function onRowContextMenu(event: any) {
  selected.value = event.data;
  updateRClickOptions();
  contextMenu.value.show(event.originalEvent);
}

function onRowSelect(event: any) {
  clicks.value++;
  if (clicks.value === 1) {
    timer.value = setTimeout(() => {
      const found = searchResults.value.find(result => event.data.iri === result.iri);
      if (found) emit("rowSelected", found);
      clicks.value = 0;
    }, delay.value);
  } else {
    clearTimeout(timer.value);
    const found = searchResults.value.find(result => event.data.iri === result.iri);
    if (found) emit("rowSelected", found);
    clicks.value = 0;
  }
}

async function exportCSV(): Promise<void> {
  if (isArrayHasLength(searchResults.value)) {
    const downloadDialog = dynamicDialog.open(LoadingDialog, {
      props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
      data: { title: "Downloading", text: "Preparing your download..." }
    });
    const response = await search(
      props.searchTerm,
      props.selectedFilterOptions,
      { pageNumber: 1, pageSize: totalCount.value },
      props.osQuery,
      props.imQuery,
      props.eclQuery
    );
    if (response && isArrayHasLength(response.entities)) {
      const heading = ["name", "iri", "code"].join(",");
      const body = response?.entities?.map((row: any) => '"' + [row.name, row.iri, row.code].join('","') + '"').join("\n");
      const csv = [heading, body].join("\n");
      downloadFile(csv, "results.csv");
    }
    downloadDialog.close();
  }
}
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  background-color: var(--surface-a);
  display: flex;
  flex-flow: column nowrap;
}

.buttons-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.break-word {
  word-break: normal;
}

.recent-icon {
  height: 1rem;
  font-size: 1rem;
}

.datatable-flex-cell {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 0;
  flex: 1 1 0;
  gap: 0.25rem;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}
</style>
