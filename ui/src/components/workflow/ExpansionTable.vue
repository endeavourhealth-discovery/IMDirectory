<template>
  <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
    <ProgressSpinner />
  </div>
  <DataTable
    v-else
    :value="contents"
    v-model:selection="selected"
    v-model:expandedRows="expandedRows"
    dataKey="iri"
    responsiveLayout="scroll"
    @rowExpand="onRowExpand"
    @dragstart="startDrag"
    @row-select="onRowSelect"
    @row-unselect="onRowUnselect"
    @row-select-all="rowSelectAll"
    @row-unselect-all="rowUnselectAll"
    :reorderableColumns="false"
    :paginator="paginable"
    :rows="rows || 18"
    :loading="loading"
    class="p-datatable-sm"
    v-model:filters="filters"
    filterDisplay="menu"
  >
    <template #empty> No records found. </template>
    <template #loading> Loading data. Please wait. </template>
    <template #header>
      <div class="flex justify-content-center align-items-center">
        <h5 class="m-0">{{ title }}</h5>
        <span v-if="inputSearch" class="p-input-icon-left">
          <IMFontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
          <InputText v-model="searchTerm" type="text" placeholder="Search" @input="search" />
        </span>
      </div>
    </template>
    <Column v-if="drag" :rowReorder="true" headerStyle="width: 3rem" />
    <Column v-if="selectable" selectionMode="multiple" headerStyle="width: 3em" />
    <Column field="name" header="Name">
      <template #body="{ data }: any">
        <IMFontAwesomeIcon v-if="data.type" :icon="getFAIconFromType(data.type)" :style="'color: ' + getColourFromType(data.type)" class="p-mx-1 type-icon" />
        <span>{{ data.name }}</span>
      </template>
    </Column>
    <Column field="iri" header="Iri">
      <template #body="{ data }: any">
        {{ data.iri }}
      </template>
    </Column>
    <Column v-if="showActions" :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; gap: 0.25rem;">
      <template #body="{ data }: any">
        <Button icon="fa-solid fa-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="view(data.iri)" v-tooltip.top="'View'" />
        <Button
          icon="fa-solid fa-circle-info"
          class="p-button-rounded p-button-text p-button-plain row-button"
          @click="showInfo(data.iri)"
          v-tooltip.top="'Info'"
        />
        <Button
          icon="fa-solid fa-play"
          class="p-button-rounded p-button-text p-button-plain row-button"
          @click="starMapping(data.iri)"
          v-tooltip.left="'Start task'"
        />
      </template>
    </Column>

    <Column v-if="removableRows" headerStyle="width: 3rem">
      <template #body="{ data }: any">
        <Button icon="fa-solid fa-xmark" severity="danger" class="p-button-rounded p-button-text" @click="remove(data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { DirectService, Env, EntityService } from "@/services";
import { FilterMatchMode } from "primevue/api";
import { useRouter } from "vue-router";
import DataTable, { DataTableFilterMeta, DataTableFilterMetaData } from "primevue/datatable";

interface Props {
  contents: [];
  title?: string;
  loading?: boolean;
  selectable?: boolean;
  inputSearch?: boolean;
  paginable?: boolean;
  rows?: number;
  drag?: boolean;
  removableRows?: boolean;
  showActions?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  search: (_payload: string) => true,
  startDrag: (_payload: any) => true,
  select: (_payload: any) => true,
  unselect: (_payload: any) => true,
  remove: (_payload: any) => true,
  selectAll: (_payload: any) => true,
  unselectAll: () => true,
  showDetails: (_payload: string) => true
});

const router = useRouter();

const directService = new DirectService();

const selected: Ref<any[]> = ref([]);
const expandedRows: Ref<any[]> = ref([]);
const searchTerm = ref("");
const filters: Ref<DataTableFilterMeta> = ref({ scheme: { value: null, matchMode: FilterMatchMode.IN } as DataTableFilterMetaData });

function view(iri: string) {
  directService.view(iri, "concept");
}

function showInfo(iri: string) {
  emit("showDetails", iri);
}

function starMapping(iri: string) {
  router.push({ name: "Mapper", params: { taskIri: iri } });
}

function remove(data: any) {
  emit("remove", data);
}

async function onRowExpand(event: any) {
  event.data.expandView = await EntityService.getPartialEntity(event.data.iri, []);
}

function search() {
  emit("search", searchTerm.value);
}

function startDrag(event: any) {
  const rowString = event.srcElement.innerText as string;
  const data = rowString.split("\t");
  const found = props.contents.find((content: any) => content.iri === data[data.length - 1]);
  emit("startDrag", found);
}

function onRowSelect(event: any) {
  emit("select", event.data);
}

function onRowUnselect(event: any) {
  emit("unselect", event.data);
}

function rowSelectAll(event: any) {
  emit("selectAll", event.data);
}

function rowUnselectAll() {
  emit("unselectAll");
}
</script>

<style scoped>
.type-icon {
  padding-right: 0.5rem;
}
</style>
