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
            <span @mouseover="showOverlay($event, data['@id'])" @mouseleave="hideOverlay">{{ data.name }}</span>
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
            <ActionButtons
              v-if="data.iri"
              :buttons="['findInTree', 'view', 'edit', 'favourite']"
              :iri="data['@id']"
              :name="data.name"
              @locate-in-tree="locateInTree"
            />
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
import { cloneDeep } from "lodash-es";
import { TTIriRef } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@/vocabulary";
import { EntityService, DirectService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import { getNamesAsStringFromTypes } from "@/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";
import setupOverlay from "@/composables/setupOverlay";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";

const props = defineProps<{
  entityIri: string;
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const { OS, showOverlay, hideOverlay } = setupOverlay();
const directService = new DirectService();

watch(
  () => props.entityIri,
  () => init()
);

watch(
  () => cloneDeep(favourites.value),
  () => {
    if (conceptIsFavourite.value) init();
  }
);

const conceptIsFavourite = computed(() => props.entityIri === IM.FAVOURITES);

const loading = ref(false);
const children: Ref<any[]> = ref([]);
const selected: Ref<any> = ref({});
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Open",
    icon: "fa-solid fa-folder-open",
    command: () => emit("navigateTo", selected.value["@id"])
  },
  {
    label: "View in new tab",
    icon: "fa-solid fa-arrow-up-right-from-square",
    command: () => directService.view(selected.value["@id"])
  }
]);
const totalCount = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");

const menu = ref();

onMounted(() => init());

async function init() {
  loading.value = true;
  if (isLoggedIn.value) {
    rClickOptions.value.push({
      separator: true
    });
    rClickOptions.value.push({
      label: "Favourite",
      icon: "fa-solid fa-star",
      command: () => updateFavourites(selected.value["@id"])
    });
  }
  if (conceptIsFavourite.value) await getFavourites();
  else await getChildren(props.entityIri);

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
  rClickOptions.value[0].icon = selected.value.hasChildren ? "fa-solid fa-folder-open" : "fa-solid fa-sitemap";
  if (isLoggedIn.value) rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value["@id"]) ? "Unfavourite" : "Favourite";
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

.content-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
