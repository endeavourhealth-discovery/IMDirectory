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
      :rows-per-page-options="[rowsOriginal, rowsOriginal * 2, rowsOriginal * 4, rowsOriginal * 8]"
      :loading="searchLoading"
      :paginatorTemplate="
        disablePageDropdown
          ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'
          : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
      "
      :pt="{ thead: { class: '!z-1' } }"
    >
      <template #empty> None </template>
      <Column field="name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #header>
          <div class="header">
            <div class="results-title">
              <span>Results </span>
              <span v-if="totalCount">
                <span>(</span>
                <span data-testid="total-results">{{ totalCount }}</span>
                <span>)</span>
              </span>
            </div>
            <Button
              :disabled="!searchResults.length"
              label="Download..."
              @click="() => (showDownloadOptions = true)"
              v-tooltip.right="'Download search results'"
            />
          </div>
        </template>
        <template #body="{ data }">
          <div class="datatable-flex-cell">
            <IMFontAwesomeIcon v-if="data.icon" :style="'color: ' + data.colour" :icon="data.icon" class="recent-icon" />
            <span class="break-word flex-1" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay">
              {{ (data.code ? data.name + " | " + data.code : data.name) + " [" + schemesWithPrefixes[data.scheme.iri]?.prefix + "]" }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="usageTotal" header="Weighting">
        <template #body="{ data }">
          <BatteryBar
            :highest-value="highestUsage"
            :current-value="data.usageTotal ?? 0"
            v-tooltip.left="{ value: data.usageTotal?.toString() ?? '0', class: 'entity-tooltip' }"
          />
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="{ data }">
          <div class="buttons-container">
            <ActionButtons
              :buttons="!showSelect ? ['findInTree', 'view', 'edit', 'favourite'] : ['viewHierarchy', 'view', 'addToList']"
              :iri="data.iri"
              :name="data.name"
              @locate-in-tree="(iri: string) => emit('locateInTree', iri)"
              @view-hierarchy="(iri: string) => emit('viewHierarchy', iri)"
              @add-to-list="(iri: string) => emit('addToList', iri)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
    <OverlaySummary ref="OS" />
    <DownloadByQueryOptionsDialog
      :show-dialog="showDownloadOptions"
      :show-im1="false"
      :show-definition="false"
      :show-core="false"
      :show-legacy="false"
      :show-im1-id="false"
      @download="download"
      @close-dialog="showDownloadOptions = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { DirectService, EclService, EntityService, QueryService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import DownloadByQueryOptionsDialog from "./dialogs/DownloadByQueryOptionsDialog.vue";
import BatteryBar from "./BatteryBar.vue";
import { getNamesAsStringFromTypes } from "@/helpers/ConceptTypeMethods";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import setupDownloadFile from "@/composables/downloadFile";
import { useUserStore } from "@/stores/userStore";
import { cloneDeep } from "lodash-es";
import setupOverlay from "@/composables/setupOverlay";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDialog } from "primevue/usedialog";
import { DownloadByQueryOptions, EclSearchRequest, SearchResultSummary, SearchResponse, QueryRequest } from "@/interfaces/AutoGen";
import { DownloadSettings, ExtendedSearchResultSummary, Namespace, SearchOptions } from "@/interfaces";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { FilterOptions } from "@/interfaces";
import { useFilterStore } from "@/stores/filterStore";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { MenuItem } from "primevue/menuitem";
import { DataTablePageEvent, DataTableRowSelectEvent } from "primevue/datatable";

interface Props {
  searchTerm?: string;
  updateSearch?: boolean;
  imQuery?: QueryRequest;
  eclQuery?: EclSearchRequest;
  pageSize?: number;
  disablePageDropdown?: boolean;
  showSelect?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  rowSelected: [payload: SearchResultSummary];
  locateInTree: [payload: string];
  searchResultsUpdated: [payload: SearchResponse | undefined];
  addToList: [payload: string];
  viewHierarchy: [payload: string];
}>();

const modelLoading = defineModel<boolean | undefined>("loading");

onMounted(async () => {
  schemesWithPrefixes.value = await EntityService.getSchemes();
  if (props.pageSize) {
    rows.value = props.pageSize;
    rowsOriginal.value = props.pageSize;
  }
  if (props.searchTerm) await onSearch();
});

const userStore = useUserStore();
const dynamicDialog = useDialog();
const favourites = computed(() => userStore.favourites);
const filterStore = useFilterStore();
const searchLoading: Ref<boolean> = ref(false);
const { downloadFile } = setupDownloadFile(window, document);
const selectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilterOptions);
const schemesWithPrefixes: Ref<{ [x: string]: Namespace }> = ref({});
const directService = new DirectService();

const selected: Ref<ExtendedSearchResultSummary> = ref({} as ExtendedSearchResultSummary);
const searchResults: Ref<ExtendedSearchResultSummary[]> = ref([]);
const totalCount = ref(0);
const highestUsage = ref(0);
const page = ref(0);
const rows = ref(25);
const rowsOriginal = ref(25);
const rClickOptions: Ref<MenuItem[]> = ref([
  {
    label: "Select",
    icon: "fa-solid fa-sitemap",
    command: () => directService.select(selected.value.iri)
  },
  {
    label: "View in new tab",
    icon: "fa-solid fa-arrow-up-right-from-square",
    command: () => directService.view(selected.value.iri)
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
const showDownloadOptions = ref(false);

const { OS, showOverlay, hideOverlay } = setupOverlay();

const contextMenu = ref();

watch(
  () => props.updateSearch,
  async () => await onSearch()
);

watch(
  () => searchLoading.value,
  () => (modelLoading.value = searchLoading.value)
);

async function onSearch() {
  const response = await search(page.value + 1, rows.value);
  emit("searchResultsUpdated", response);
  if (response?.entities && isArrayHasLength(response.entities)) processSearchResults(response);
  else {
    searchResults.value = [];
    totalCount.value = 0;
  }
}

async function search(pageNumber: number, pageSize: number) {
  let response = undefined;
  searchLoading.value = true;
  if (props.eclQuery) {
    props.eclQuery.page = pageNumber;
    props.eclQuery.size = pageSize;
    response = await EclService.ECLSearch(props.eclQuery);
  }
  if (props.searchTerm && props.searchTerm.length > 2) {
    if (props.imQuery) {
      props.imQuery.textSearch = props.searchTerm;
      props.imQuery.page = { pageNumber: pageNumber, pageSize: pageSize };
      response = await QueryService.queryIMSearch(props.imQuery);
    } else {
      const searchOptions: SearchOptions = cloneDeep(selectedFilters.value);
      searchOptions.textSearch = props.searchTerm;
      searchOptions.page = { pageNumber: pageNumber, pageSize: pageSize };
      const imQuery = buildIMQueryFromFilters(searchOptions);
      response = await QueryService.queryIMSearch(imQuery);
    }
  }
  searchLoading.value = false;
  return response;
}

function updateFavourites(row?: { data: ExtendedSearchResultSummary }) {
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
      const copy = cloneDeep(result) as ExtendedSearchResultSummary;
      copy.icon = getFAIconFromType(result.entityType);
      copy.color = getColourFromType(result.entityType);
      copy.typeNames = getNamesAsStringFromTypes(result.entityType);
      copy.favourite = isFavourite(result.iri);
      return copy;
    });
    totalCount.value = searchResponse.count ?? 0;
    highestUsage.value = searchResponse.highestUsage ?? 0;
  }
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

async function onPage(event: DataTablePageEvent) {
  page.value = event.page;
  rows.value = event.rows;
  await onSearch();
  scrollToTop();
}

function scrollToTop() {
  const scrollArea = document.getElementsByClassName("p-datatable-scrollable-table")[0] as HTMLElement;
  scrollArea?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function onRowContextMenu(event: { originalEvent: MouseEvent; data: ExtendedSearchResultSummary }) {
  selected.value = event.data;
  updateRClickOptions();
  contextMenu.value.show(event.originalEvent);
}

function onRowSelect(event: DataTableRowSelectEvent<ExtendedSearchResultSummary>) {
  const mouseEvent = event.originalEvent as MouseEvent;
  if (mouseEvent.metaKey || mouseEvent.ctrlKey) {
    directService.view(event.data.iri);
  } else {
    const found = searchResults.value.find(result => event.data.iri === result.iri);
    if (found) emit("rowSelected", found);
  }
}

async function download(downloadSettings: DownloadSettings): Promise<void> {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  let downloadQuery: QueryRequest | undefined;
  let eclSearchRequest: EclSearchRequest | undefined;
  if (props.eclQuery) {
    eclSearchRequest = cloneDeep(props.eclQuery);
    eclSearchRequest.page = 1;
    eclSearchRequest.size = totalCount.value;
  }
  if (props.searchTerm && props.searchTerm.length > 2) {
    if (props.imQuery) {
      downloadQuery = cloneDeep(props.imQuery);
      downloadQuery.textSearch = props.searchTerm;
      downloadQuery.page = { pageNumber: 1, pageSize: totalCount.value };
    } else {
      const searchOptions: SearchOptions = cloneDeep(selectedFilters.value);
      searchOptions.textSearch = props.searchTerm;
      searchOptions.page = { pageNumber: 1, pageSize: totalCount.value };
      downloadQuery = buildIMQueryFromFilters(searchOptions);
    }
  }
  if (downloadQuery || eclSearchRequest) {
    const options: DownloadByQueryOptions = {
      queryRequest: downloadQuery,
      eclSearchRequest: eclSearchRequest,
      totalCount: totalCount.value,
      format: downloadSettings.selectedFormat
    };
    const result = await EntityService.downloadSearchResults(options);
    if (result) downloadFile(result, "search-results-" + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + "." + downloadSettings.selectedFormat);
  }
  downloadDialog.close();
}
</script>

<style scoped>
#search-results-main-container {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  background-color: var(--p-content-background);
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

.header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
}
</style>
