<template>
  <div id="search-results-main-container">
    <DataTable
      :paginator="true"
      :rows="20"
      :value="processedSearchResults"
      class="p-datatable-sm"
      v-model:selection="selected"
      selectionMode="single"
      @row-select="onRowSelect"
      contextMenu
      @rowContextmenu="onRowContextMenu"
      :scrollable="true"
      scrollHeight="flex"
      :loading="loading"
      ref="searchTable"
      dataKey="iri"
      :autoLayout="true"
      @page="scrollToTop"
    >
      <template #empty> None </template>
      <Column field="name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #header>
          Results
          <Button
            :disabled="!searchResults?.length"
            class="p-button-rounded p-button-text p-button-lg p-button-icon-only"
            :icon="fontAwesomePro ? 'fa-duotone fa-fw fa-file-arrow-down' : 'fa-solid fa-fw fa-file-arrow-down'"
            @click="exportCSV()"
            v-tooltip.right="'Download results table'"
          />
        </template>
        <template #body="{ data }: any">
          <div class="datatable-flex-cell">
            <IMFontAwesomeIcon v-if="data.icon" :style="'color: ' + data.colour" :icon="data.icon" class="recent-icon" />
            <span class="break-word" @mouseover="showOverlay($event, data)" @mouseleave="hideOverlay($event)">
              {{ data.code ? data.name + " | " + data.code : data.name }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="weighting" header="Usage">
        <template #body="{ data }: any">
          <span>{{ data.weighting || data.usage }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="{ data }: any">
          <div class="buttons-container">
            <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="data.iri" @locate-in-tree="(iri:string) => emit('locateInTree', iri)" />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, Ref, watch } from "vue";
import { DirectService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import setupDownloadFile from "@/composables/downloadFile";
import { useUserStore } from "@/stores/userStore";
import { useSharedStore } from "@/stores/sharedStore";
import { ConceptSummary } from "@im-library/interfaces";
import _ from "lodash";

interface Props {
  searchResults?: ConceptSummary[];
  totalRecords?: number;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchResults: () => [] as ConceptSummary[],
  totalRecords: 0
});

const emit = defineEmits({ rowSelected: (_payload: ConceptSummary) => true, locateInTree: (_payload: string) => true });

const sharedStore = useSharedStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const { downloadFile } = setupDownloadFile(window, document);

const directService = new DirectService();

const selected: Ref<any> = ref({});
const processedSearchResults: Ref<any[]> = ref([]);
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Select",
    icon: "fa-solid fa-sitemap",
    command: () => directService.select((selected.value as any).iri, "Folder")
  },
  {
    label: "View in new tab",
    icon: "pi pi-fw pi-external-link",
    command: () => directService.view((selected.value as any).iri)
  },
  {
    separator: true
  },
  {
    label: "Favourite",
    icon: "pi pi-fw pi-star",
    command: () => updateFavourites()
  }
]);
const delay = ref(200);
const clicks = ref(0);
const timer: Ref<NodeJS.Timeout> = ref({} as NodeJS.Timeout);

const OS: Ref<any> = ref();
const contextMenu = ref();

watch(
  () => props.searchResults,
  () => init()
);

onMounted(() => init());

function updateFavourites(row?: any) {
  if (row) selected.value = row.data;
  userStore.updateFavourites(selected.value.iri);
}

function isFavourite(iri: string) {
  if (!favourites.value?.length) return false;
  return favourites.value.includes(iri);
}

function init() {
  processedSearchResults.value = processSearchResults(props.searchResults);
}

function processSearchResults(searchResults: ConceptSummary[]): any[] {
  return searchResults.map(result => {
    const copy: any = _.cloneDeep(result);
    copy.icon = getFAIconFromType(result.entityType);
    copy.colour = getColourFromType(result.entityType);
    copy.typeNames = getNamesAsStringFromTypes(result.entityType);
    copy.favourite = isFavourite(result.iri);
    return copy;
  });
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

async function scrollToTop() {
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
      const found = props.searchResults.find(result => event.data.iri === result.iri);
      if (found) emit("rowSelected", found);
      clicks.value = 0;
    }, delay.value);
  } else {
    clearTimeout(timer.value);
    const found = props.searchResults.find(result => event.data.iri === result.iri);
    if (found) emit("rowSelected", found);
    clicks.value = 0;
  }
}

async function showOverlay(event: any, data: any): Promise<void> {
  if (OS.value) await OS.value.showOverlay(event, data.iri);
}

function hideOverlay(event: any): void {
  if (OS.value) OS.value.hideOverlay(event);
}

function exportCSV(): void {
  const heading = ["name", "iri", "code"].join(",");
  const body = props.searchResults?.map((row: any) => '"' + [row.name, row.iri, row.code].join('","') + '"').join("\n");
  const csv = [heading, body].join("\n");
  downloadFile(csv, "results.csv");
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
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1.25rem;
  padding: 5px;
}

.datatable-flex-cell {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 0;
  flex: 1 1 0;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}
</style>
