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
      @page="onPage($event)"
      @row-select="onRowSelect"
    >
      <template #loading> Loading data. Please wait. </template>
      <template #empty> No records found. </template>

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
      <Column :exportable="false" style="justify-content: flex-end">
        <template #body="{ data }">
          <div class="buttons-container">
            <Button
              :icon="data.hasChildren ? 'pi pi-folder-open' : 'fa-solid fa-sitemap'"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.select(data['@id'])"
              v-tooltip.top="data.hasChildren ? 'Open' : 'Select'"
              data-testid="select-button"
            />
            <Button
              icon="pi pi-fw pi-external-link"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.view(data['@id'])"
              v-tooltip.top="'View in new tab'"
            />
            <Button
              icon="fa-solid fa-pen-to-square"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.edit(data['@id'])"
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
const { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes } = ConceptTypeMethods;
const { isArrayHasLength } = DataTypeCheckers;

const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const favourites = computed(() => store.state.favourites);

const directService = new DirectService();

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
  directService.select(event.data["@id"]);
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
.action-column {
  all: unset;
  justify-content: flex-end !important;
}
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
