<template>
  <div id="content-table-container" class="content-wrapper">
    <DataTable
      :value="children"
      class="concept-data-table p-datatable-sm scrollbar"
      v-model:selection="selected"
      selectionMode="single"
      dataKey="@id"
      scrollHeight="flex"
      :loading="loading"
      :lazy="true"
      :paginator="true"
      :rowsPerPageOptions="[25, 50, 100]"
      :rows="25"
      :totalRecords="totalCount ? totalCount : children.length"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :currentPageReportTemplate="templateString"
      contextMenu
      @rowContextmenu="onRowContextMenu"
      @page="onPage($event)"
      @row-select="onRowSelect"
    >
      <template #loading> Loading data. Please wait. </template>
      <template #empty> No records found. </template>

      <Column field="name" header="Name">
        <template #body="{ data }: any">
          <div>
            <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" :style="getColourStyleFromType(data.type)" class="p-mx-1 type-icon" />
            <span @mouseover="showOverlay($event, data)" @mouseleave="hideOverlay($event)">{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }: any">
          <span>{{ getTypesDisplay(data.type) }}</span>
        </template>
      </Column>
      <Column :exportable="false" style="justify-content: flex-end">
        <template #body="{ data }: any">
          <div class="buttons-container">
            <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="data['@id']" />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu ref="menu" :model="rClickOptions" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { useStore } from "vuex";
import _ from "lodash";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService, DirectService } from "@/services";
import rowClick from "@/composables/rowClick";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const favourites = computed(() => store.state.favourites);

const directService = new DirectService();
const { onRowClick }: { onRowClick: Function } = rowClick();

watch(
  () => conceptIri.value,
  () => init()
);
watch(
  () => _.cloneDeep(favourites.value),
  () => {
    if (conceptIsFavourite.value) init();
  }
);

const conceptIsFavourite = computed(() => conceptIri.value === IM.NAMESPACE + "Favourites");

const loading = ref(false);
const children: Ref<any[]> = ref([]);
const selected: Ref<any> = ref({});
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Open",
    icon: "pi pi-fw pi-folder-open",
    command: () => directService.select((selected.value as any)["@id"])
  },
  {
    label: "View in new tab",
    icon: "pi pi-fw pi-external-link",
    command: () => directService.view((selected.value as any)["@id"])
  },
  {
    separator: true
  },
  {
    label: "Favourite",
    icon: "pi pi-fw pi-star",
    command: () => updateFavourites((selected.value as any)["@id"])
  }
]);
const totalCount = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");

const menu = ref();
const OS: Ref<any> = ref();

onMounted(() => init());

async function init() {
  loading.value = true;
  !conceptIsFavourite.value ? await getChildren(conceptIri.value) : await getFavourites();
  loading.value = false;
}

async function getFavourites() {
  const result = await EntityService.getPartialEntities(favourites.value, [RDFS.LABEL, RDF.TYPE]);
  children.value = result.map((child: any) => {
    return { "@id": child["@id"], name: child[RDFS.LABEL], type: child[RDF.TYPE] };
  });
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
  totalCount.value = children.value.length;
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
}

function getTypesDisplay(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

async function getChildren(iri: string) {
  const result = await EntityService.getPagedChildren(iri, currentPage.value + 1, pageSize.value);
  children.value = result.result;
  totalCount.value = result.totalCount;
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
}

function isFavourite(iri: string) {
  return isArrayHasLength(favourites.value) && favourites.value.includes(iri);
}

function updateRClickOptions() {
  rClickOptions.value[0].label = selected.value.hasChildren ? "Open" : "Select";
  rClickOptions.value[0].icon = selected.value.hasChildren ? "pi pi-fw pi-folder-open" : "fa-solid fa-sitemap";
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value["@id"]) ? "Unfavourite" : "Favourite";
}

function onRowContextMenu(data: any) {
  selected.value = data.data;
  updateRClickOptions();
  menu.value.show(event);
}

function updateFavourites(iri: string) {
  store.commit("updateFavourites", iri);
}

function onRowSelect(event: any) {
  onRowClick(event.data["@id"]);
}

async function onPage(event: any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  const result = await EntityService.getPagedChildren(conceptIri.value, currentPage.value + 1, pageSize.value);
  children.value = result.result;
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
  scrollToTop();
  loading.value = false;
}

function scrollToTop(): void {
  const resultsContainer = document.getElementById("content-table-container") as HTMLElement;
  const scrollBox = resultsContainer?.getElementsByClassName("scrollbar")[0] as HTMLElement;
  if (scrollBox) {
    scrollBox.scrollTop = 0;
  }
}

async function showOverlay(event: any, data: any): Promise<void> {
  await OS.value.showOverlay(event, data["@id"]);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}
</script>

<style scoped>
.buttons-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  row-gap: 0.5rem;
}

.type-icon {
  padding-right: 0.5rem;
}

.row-button:hover {
  background-color: var(--surface-border) !important;
  color: var(--surface-a) !important;
}

.row-button-fav:hover {
  background-color: var(--yellow-500) !important;
  color: var(--surface-a) !important;
}

.content-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.scrollbar {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
