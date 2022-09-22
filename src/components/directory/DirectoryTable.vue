<template>
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
    :paginator="totalCount > pageSize ? true : false"
    :rows="pageSize"
    :totalRecords="totalCount"
    contextMenu
    @rowContextmenu="onRowContextMenu"
    @row-dblclick="onRowDblClick"
    @row-select="onRowSelect"
    @page="onPage($event)"
  >
    <template #loading> Loading data. Please wait. </template>
    <template #empty> No records found. </template>

    <template #header>Contains</template>
    <Column field="name" header="Name">
      <template #body="{ data }">
        <span :style="getColourStyleFromType(data.type)" class="p-mx-1 type-icon">
          <i :class="data.icon" aria-hidden="true" />
        </span>
        <span>{{ data.name }}</span>
      </template>
    </Column>
    <Column field="type" header="Type">
      <template #body="{ data }">
        <span>{{ getTypesDisplay(data.type) }}</span>
      </template>
    </Column>
    <Column :exportable="false">
      <template #body="{ data }">
        <div class="buttons-container">
          <Button
            v-if="data.hasChildren"
            @click="open(data['@id'])"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            type="button"
            class="p-button-rounded p-button-text p-button-plain row-button"
            icon="pi pi-folder-open"
            v-tooltip.top="'Open'"
          />
          <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="view(data['@id'])" v-tooltip.top="'View'" />
          <Button
            icon="pi pi-fw pi-info-circle"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="showInfo(data['@id'])"
            v-tooltip.top="'Info'"
          />
          <Button
            icon="fa-solid fa-pen-to-square"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="edit(data['@id'])"
            v-tooltip.top="'Edit'"
          />
          <Button
            v-if="isFavourite(data['@id'])"
            style="color: #e39a36"
            icon="pi pi-fw pi-star-fill"
            class="p-button-rounded p-button-text row-button-fav"
            @click="updateFavourites(data['@id'])"
            v-tooltip.left="'Unfavourite'"
          />

          <Button
            v-else
            icon="pi pi-fw pi-star"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="updateFavourites(data['@id'])"
            v-tooltip.left="'Favourite'"
          />
        </div>
      </template>
    </Column>
  </DataTable>
  <ContextMenu ref="menu" :model="rClickOptions" />
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import _ from "lodash";
import { Helpers, Vocabulary, Services } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import axios from "axios";
const { IM, RDFS, RDF } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;
const { EntityService, DirectService, Env } = Services;

const emit = defineEmits({ openBar: () => true });

const route = useRoute();
const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const favourites = computed(() => store.state.favourites);

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

const entityService = new EntityService(axios);
const directService = new DirectService(axios);

const conceptIsFavourite = computed(() => conceptIri.value === IM.NAMESPACE + "Favourites");

const loading = ref(false);
const children: Ref<any[]> = ref([]);
const selected: Ref<any> = ref({});
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Open",
    icon: "pi pi-fw pi-folder-open",
    command: () => open((selected.value as any)["@id"])
  },
  {
    label: "View",
    icon: "pi pi-fw pi-eye",
    command: () => view((selected.value as any)["@id"])
  },
  {
    label: "Info",
    icon: "pi pi-fw pi-info-circle",
    command: () => showInfo((selected.value as any)["@id"])
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
const nextPage = ref(2);
const pageSize = ref(50);

const menu = ref();

onMounted(() => init());

async function init() {
  loading.value = true;
  !isFavourite ? await getChildren(conceptIri.value) : await getFavourites();
  loading.value = false;
}

function onFavouriteView() {
  return conceptIri.value === IM.NAMESPACE + "Favourites";
}

async function getFavourites() {
  const result = await entityService.getPartialEntities(favourites.value, []);
  children.value = result.map((child: any) => {
    return { "@id": child["@id"], name: child[RDFS.LABEL], type: child[RDF.TYPE] };
  });
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
}

function getTypesDisplay(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

async function getChildren(iri: string) {
  const result = await entityService.getPagedChildren(iri, 1, pageSize.value);
  children.value = result.result;
  totalCount.value = result.totalCount;
  children.value.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
}

function isFavourite(iri: string) {
  return isArrayHasLength(favourites.value) && favourites.value.includes(iri);
}

function updateRClickOptions() {
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

function onRowDblClick(event: any) {
  if (isFolder(event.data.type)) open(event.data["@id"]);
  else view(event.data["@id"]);
}

function view(iri: string) {
  directService.directTo(Env.VIEWER_URL, iri, "concept");
}

function edit(iri: string) {
  directService.directTo(Env.EDITOR_URL, iri, "editor");
}

function open(iri: string) {
  const currentRoute = route.name as RouteRecordName | undefined;
  router.push({
    name: currentRoute,
    params: { selectedIri: iri }
  });
}

function onRowSelect(event: any) {
  store.commit("updateSelectedConceptIri", event.data["@id"]);
}

function showInfo(iri: string) {
  store.commit("updateSelectedConceptIri", iri);
  emit("openBar");
}

async function loadMore() {
  loading.value = true;
  const result = await entityService.getPagedChildren(conceptIri.value, nextPage.value, pageSize.value);
  children.value = result.result;
  loading.value = false;
}

async function onPage(event: any) {
  nextPage.value = event.page + 1;
  await loadMore();
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
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.row-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
