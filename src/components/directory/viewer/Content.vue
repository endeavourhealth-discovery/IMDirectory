<template>
  <div class="content-wrapper">
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
      :paginator="totalCount > pageSize"
      :rows="pageSize"
      :totalRecords="totalCount"
      contextMenu
      @rowContextmenu="onRowContextMenu"
      @row-dblclick="onRowDblClick"
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
            <Button
              v-else
              icon="fa-solid fa-sitemap"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="open(data['@id'])"
              v-tooltip.top="'Select'"
              data-testid="select-button"
            />
            <Button
              icon="pi pi-fw pi-external-link"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="view(data['@id'])"
              v-tooltip.top="'View in new tab'"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import _ from "lodash";
import { TTIriRef } from "@/im_library/interfaces";
import { ConceptTypeMethods, DataTypeCheckers } from "@/im_library/helpers";
import { IM, RDF, RDFS } from "@/im_library/vocabulary";
import { EntityService, Env, DirectService } from "@/im_library/services";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import axios from "axios";
const { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes } = ConceptTypeMethods;
const { isArrayHasLength } = DataTypeCheckers;

const route = useRoute();
const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const favourites = computed(() => store.state.favourites);

const directService = new DirectService(store);

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
    command: () => open((selected.value as any)["@id"])
  },
  {
    label: "View in new tab",
    icon: "pi pi-fw pi-external-link",
    command: () => view((selected.value as any)["@id"])
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
  !conceptIsFavourite.value ? await getChildren(conceptIri.value) : await getFavourites();
  loading.value = false;
}

async function getFavourites() {
  const result = await EntityService.getPartialEntities(favourites.value, [RDFS.LABEL, RDF.TYPE]);
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
  const result = await EntityService.getPagedChildren(iri, 1, pageSize.value);
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
  directService.directTo(Env.DIRECTORY_URL, iri, "folder");
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

async function loadMore() {
  loading.value = true;
  const result = await EntityService.getPagedChildren(conceptIri.value, nextPage.value, pageSize.value);
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

.content-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
