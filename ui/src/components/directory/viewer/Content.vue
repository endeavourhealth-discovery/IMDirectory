<template>
  <div id="content-table-container" class="content-wrapper">
    <DataTable
      :value="children"
      class="concept-data-table p-datatable-sm"
      v-model:selection="selected"
      selectionMode="single"
      dataKey="@id"
      :scrollable="true"
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
            <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="data['@id']" @locate-in-tree="locateInTree" />
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
import _ from "lodash";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService, DirectService, UserService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const currentUser = computed(() => userStore.currentUser);

const directService = new DirectService();

watch(
  () => props.entityIri,
  () => init()
);

watch(
  () => _.cloneDeep(favourites.value),
  () => {
    if (conceptIsFavourite.value) init();
  }
);

const conceptIsFavourite = computed(() => props.entityIri === IM.NAMESPACE + "Favourites");

const loading = ref(false);
const children: Ref<any[]> = ref([]);
const selected: Ref<any> = ref({});
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Open",
    icon: "pi pi-fw pi-folder-open",
    command: () => emit("navigateTo", (selected.value as any)["@id"])
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
  !conceptIsFavourite.value ? await getChildren(props.entityIri) : await getFavourites();
  loading.value = false;
}

async function getFavourites() {
  let favouriteList: string[];
  if (currentUser.value) favouriteList = await UserService.getUserFavourites();
  else favouriteList = favourites ? favourites.value : [];
  const result = await EntityService.getPartialEntities(favouriteList, [RDFS.LABEL, RDF.TYPE]);
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
  userStore.updateFavourites(iri);
}

function onRowSelect(event: any) {
  emit("navigateTo", event.data["@id"]);
}

async function onPage(event: any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  const result = await EntityService.getPagedChildren(props.entityIri, currentPage.value + 1, pageSize.value);
  children.value = result.result;
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
  scrollToTop();
  loading.value = false;
}

function scrollToTop(): void {
  const scrollArea = document.getElementsByClassName("p-datatable-scrollable-table")[0] as HTMLElement;
  scrollArea?.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function showOverlay(event: any, data: any): Promise<void> {
  await OS.value.showOverlay(event, data["@id"]);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
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
