<template>
  <div id="search-results-main-container">
    <DataTable
      :paginator="true"
      :rows="20"
      :value="searchResults"
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
            <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="data.iri" />
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
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import rowClick from "@/composables/rowClick";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import setupDownloadFile from "@/composables/downloadFile";
import { useRootStore } from "@/stores/rootStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";

const props = defineProps({
  searchResults: { type: Array as PropType<any[]>, default: [] },
  totalRecords: { type: Number, required: false, default: 0 },
  loading: { type: Boolean, required: true }
});

const rootStore = useRootStore();
const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const fontAwesomePro = computed(() => directoryStore.fontAwesomePro);
const searchLoading = computed(() => directoryStore.searchLoading);

const { downloadFile } = setupDownloadFile(window, document);

const directService = new DirectService();

const selected: Ref<any> = ref({});
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

const OS: Ref<any> = ref();
const contextMenu = ref();
const menu = ref();
const { onRowClick }: { onRowClick: Function } = rowClick();

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
  processSearchResults();
}

function processSearchResults() {
  for (const result of props.searchResults) {
    if (isObjectHasKeys(result, ["entityType"])) {
      result.icon = getFAIconFromType(result.entityType);
      result.colour = getColourFromType(result.entityType);
      result.typeNames = getNamesAsStringFromTypes(result.entityType);
      result.favourite = isFavourite(result.iri);
    } else if (isObjectHasKeys(result, ["type"])) {
      result.icon = getFAIconFromType(result.type);
      result.colour = getColourFromType(result.type);
      result.typeNames = getNamesAsStringFromTypes(result.type);
      result.favourite = isFavourite(result.iri);
    }
  }
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

function onRowContextMenu(event: any) {
  selected.value = event.data;
  updateRClickOptions();
  contextMenu.value.show(event.originalEvent);
}

function onRowSelect(event: any) {
  onRowClick(event.data.iri);
}

async function showOverlay(event: any, data: any): Promise<void> {
  await OS.value.showOverlay(event, data.iri);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
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
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  row-gap: 0.5rem;
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
