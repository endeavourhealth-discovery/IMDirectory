<template>
  <ConfirmDialog></ConfirmDialog>
  <OverlayPanel ref="summaryOverlay" id="summary_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
    <OverlaySummary :hoveredResult="hoveredItem" />
  </OverlayPanel>

  <div class="definition-main-container">
    <h5 class="title">Task Definition</h5>
    <Card class="task-definition-container">
      <template #header>
        <div class="flex">
          <div class="flex flex-auto field p-float-label">
            <InputText disabled id="iri" type="text" class="p-inputtext-lg input-text" v-model="taskIri" />
            <label for="iri">Iri</label>
          </div>
          <div class="flex flex-auto field p-float-label">
            <InputText id="name" type="text" class="p-inputtext-lg input-text" v-model="name" />
            <label for="name">Name</label>
          </div>
          <div class="flex flex-auto field p-float-label">
            <Dropdown class="p-inputtext-lg input-text" id="type" v-model="type" :options="taskTypes" optionLabel="name" />
            <label for="type">Type</label>
          </div>
        </div>
        <small v-if="taskIriExists" id="iri" class="field p-error">Iri exists. Saving will update the entity.</small>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12">
            <Panel header="Search filters" :toggleable="false">
              <div class="flex justify-content-between">
                <MultiSelect
                  v-model="selectedFilters.schemes"
                  :options="filterOptions.schemes"
                  optionLabel="name"
                  optionValue="iri"
                  placeholder="Select scheme"
                />
                <MultiSelect v-model="selectedFilters.types" :options="filterOptions.types" optionLabel="name" optionValue="@id" placeholder="Select type" />
                <MultiSelect
                  v-model="selectedFilters.status"
                  :options="filterOptions.status"
                  optionLabel="name"
                  optionValue="@id"
                  placeholder="Select status"
                />
                <InputText v-model="searchTerm" placeholder="Keyword Search" />
                <Button :loading="loading" icon="pi pi-search" label="Search" class="save-button" @click="search()" />
              </div>
            </Panel>
          </div>

          <div class="col-5 result-table-container">
            <DataTable
              class="flex-1 flex justify-content-center p-datatable-sm result-table"
              v-model:selection="selectedResults"
              dataKey="iri"
              :value="unmapped"
              responsiveLayout="scroll"
              :loading="searching"
              selectionMode="multiple"
              @row-dblclick="addSelectedTask($event.data)"
            >
              <template #empty> No results found. </template>
              <template #loading> Loading results. </template>
              <Column field="name" header="Name">
                <template #body="{ data }: any">
                  <div class="hover-name" @mouseenter="showOverlay($event, data)" @mouseleave="hideOverlay()">
                    {{ data.name }}
                  </div>
                </template>
              </Column>
              <Column field="usage" header="Usage"> </Column>
              <Column>
                <template #body="{ data }: any">
                  <div class="buttons-container">
                    <Button
                      icon="pi pi-fw pi-eye"
                      class="p-button-rounded p-button-text p-button-plain row-button"
                      @click="view(data.iri)"
                      v-tooltip.top="'View'"
                    />
                    <Button
                      icon="pi pi-fw pi-info-circle"
                      class="p-button-rounded p-button-text p-button-plain row-button"
                      @click="showInfo(data.iri)"
                      v-tooltip.top="'Info'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div class="col">
            <div class="flex flex-column align-items-center">
              <Button class="pick-button" icon="pi pi-arrow-right" @click="addSelectedTasks" />
              <Button class="pick-button" icon="pi pi-arrow-left" @click="removeSelectedTasks" />
            </div>
          </div>
          <div class="col-5">
            <DataTable
              class="flex-1 flex justify-content-center p-datatable-sm content-table"
              v-model:selection="selectedContents"
              dataKey="iri"
              :value="contents"
              responsiveLayout="scroll"
              :loading="loading"
              selectionMode="multiple"
            >
              <template #empty> No actions added. </template>
              <template #loading> Loading contents. </template>
              <Column field="name" header="Name">
                <template #body="{ data }: any">
                  <div @mouseenter="showOverlay($event, data)" @mouseleave="hideOverlay()">
                    {{ data.name }}
                  </div>
                </template>
              </Column>
              <Column field="usage" header="Usage"></Column>
              <Column>
                <template #body="{ data }: any">
                  <div class="buttons-container">
                    <Button
                      icon="pi pi-fw pi-eye"
                      class="p-button-rounded p-button-text p-button-plain row-button"
                      @click="view(data.iri)"
                      v-tooltip.top="'View'"
                    />
                    <Button
                      icon="pi pi-fw pi-info-circle"
                      class="p-button-rounded p-button-text p-button-plain row-button"
                      @click="showInfo(data.iri)"
                      v-tooltip.top="'Info'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </template>
    </Card>
    <div class="button-bar">
      <Button icon="pi pi-times" label="Cancel" severity="secondary" @click="goToTaskViewer" />
      <Button :loading="saveLoading" icon="pi pi-check" label="Save" class="save-button" @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, Ref, ref, watch } from "vue";
import ConfirmDialog from "primevue/confirmdialog";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import "vue-json-pretty/lib/styles.css";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { DirectService, EntityService, Env } from "@/services";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { useRoute, useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  data: any;
}

const props = defineProps<Props>();

const emit = defineEmits({
  nextPage: (_payload: { pageIndex: number; data: {} }) => true,
  prevPage: (_payload: { pageIndex: number; data: {} }) => true,
  showDetails: (_payload: string) => true,
  updateSelected: (_payload: string) => true
});

const filterStore = useFilterStore();
const route = useRoute();
const router = useRouter();

const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);

const directService = new DirectService();

const taskIri = ref("");
const selected: Ref<any> = ref({});
const type: Ref<any> = ref({});
const name = ref("");
const taskTypes: Ref<any[]> = ref([]);
const taskIriExists = ref(false);
const hoveredItem: Ref<any> = ref({});
const unmapped: Ref<any[]> = ref([]);
const selectedResults: Ref<any[]> = ref([]);
const contents: Ref<any[]> = ref([]);
const selectedContents: Ref<any[]> = ref([]);
const searchResults: Ref<any[]> = ref([]);
const controller: Ref<AbortController> = ref({} as AbortController);
const searchTerm = ref("");
const loading = ref(true);
const searching = ref(true);
const saveLoading = ref(false);
const selectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);

watch(taskIri, async newValue => {
  if (newValue) await setIriExists();
});
watch(name, () => generateTaskIri());
watch(type, () => generateTaskIri());
watch(selected, () => emit("updateSelected", selected.value.iri));
watch(
  () => route.params.taskIri,
  newValue => {
    taskIri.value = newValue as string;
    init();
  }
);

const summaryOverlay = ref();

onMounted(async () => {
  taskIri.value = route.params.taskIri as string;
  loading.value = true;
  searching.value = true;
  await init();
  searching.value = false;
  loading.value = false;
});

function hideOverlay(): void {
  summaryOverlay.value.hide();
}

function showOverlay(event: any, data: ConceptSummary): void {
  hoveredItem.value = data;
  summaryOverlay.value.show(event, event.target);
}

function addSelectedTask(selected: any) {
  const found = contents.value.find(action => action.iri === selected.iri);
  if (!found) {
    contents.value.push(selected);
  }
}

function addSelectedTasks() {
  for (const selectedResult of selectedResults.value) {
    addSelectedTask(selectedResult);
  }
}

function removeSelectedTasks() {
  for (const selectedAction of selectedContents.value) {
    const foundIndex = contents.value.findIndex(action => action.iri === selectedAction.iri);
    if (foundIndex !== -1) {
      contents.value.splice(foundIndex, 1);
    }
  }
}

async function setIriExists() {
  taskIriExists.value = await EntityService.iriExists(taskIri.value);
}

function generateTaskIri() {
  if (isObjectHasKeys(type.value) && name.value) {
    const typeLC = type.value.name.split(" ")[0].toLowerCase();
    const nameReplaced = name.value.charAt(0).toLowerCase() + name.value.slice(1).replaceAll(" ", "");
    taskIri.value = "http://task.endhealth.info/" + typeLC + "#" + nameReplaced;
  }
}

async function getTaskTypes() {
  taskTypes.value = (await EntityService.getEntityChildren(IM.NAMESPACE + "Task")).map(child => {
    return { "@id": child["@id"], name: child.name };
  });
}

async function getUnmapped(limit?: number) {
  searching.value = true;
  const results = await EntityService.getUnmapped(
    undefined,
    selectedFilters.value.status.map(status => status["@id"]),
    selectedFilters.value.schemes.map(scheme => scheme["@id"]),
    selectedFilters.value.types.map(type => type["@id"]),
    0,
    limit || 100
  );

  unmapped.value = buildTableEntityList(results);
  searching.value = false;
}

function buildTableEntityList(entityList: any[]) {
  return entityList.map(entity => {
    return {
      iri: entity["@id"],
      name: entity[RDFS.LABEL],
      usage: entity["http://endhealth.info/im#usageTotal"]
    };
  });
}

function getNameDisplay(properties: any[]) {
  if (isArrayHasLength(properties)) {
    const names = properties.map(property => property.name);
    return names.join(", ");
  }
  return "";
}

async function init() {
  await getUnmapped();
  await getTaskTypes();
  if (taskIri.value) {
    await setIriExists();
    const updateTask = await EntityService.getPartialEntity(taskIri.value, []);
    name.value = updateTask[RDFS.LABEL];
    type.value = updateTask[RDF.TYPE][0];
    const children = await EntityService.getTaskActions(taskIri.value);
    contents.value = buildTableEntityList(children);
  } else {
    taskIriExists.value = false;
    name.value = "";
    type.value = undefined;
  }
}

function view(iri: string) {
  if (iri) directService.view(iri, "concept");
}

function goToTaskViewer() {
  router.push({ name: "TaskViewer" });
}

function showInfo(iri: string) {
  if (iri) emit("showDetails", iri);
}

async function search(): Promise<void> {
  searching.value = true;
  if (searchTerm.value.length > 0) {
    searchResults.value = [];
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchTerm.value;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    setFilters(searchRequest);
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    await fetchSearchResults(searchRequest, controller.value);
  } else {
    await getUnmapped();
  }
  searching.value = false;
}

function setFilters(searchRequest: SearchRequest) {
  searchRequest.schemeFilter = selectedFilters.value.schemes.map(scheme => scheme["@id"]);
  searchRequest.statusFilter = selectedFilters.value.status.map(status => status["@id"]);
  searchRequest.typeFilter = selectedFilters.value.types.map(type => type["@id"]);
}

async function fetchSearchResults(searchRequest: SearchRequest, controller: AbortController) {
  const result = await EntityService.advancedSearch(searchRequest, controller);
  if (result && isArrayHasLength(result)) {
    searchResults.value = result.map(item => {
      return { iri: item.iri, name: item.name, type: item.entityType, scheme: item.scheme, status: item.status, usage: item.weighting };
    });
  } else {
    searchResults.value = [];
  }
  unmapped.value = searchResults.value;
}

async function save() {
  saveLoading.value = true;
  const entity = buildEntity();
  if (!(await EntityService.iriExists(entity["@id"]))) {
    const created = await EntityService.createEntity(entity);
    for (const action of contents.value) {
      await EntityService.addTaskAction(action.iri, created["@id"]);
    }
  } else {
    const updated = await EntityService.updateEntity(entity);
    for (const action of contents.value) {
      await EntityService.addTaskAction(action.iri, updated["@id"]);
    }
  }
  saveLoading.value = false;
}

function buildEntity() {
  const entity = { "@id": taskIri.value } as any;
  entity[RDFS.LABEL] = name.value;
  entity[RDF.TYPE] = [type.value];
  entity[IM.HAS_STATUS] = { "@id": IM.ACTIVE, name: "Active" };
  entity[IM.IS_CONTAINED_IN] = { "@id": IM.NAMESPACE + "Tasks", name: "Tasks" };
  return entity;
}
</script>

<style scoped>
.task-definition-container {
  flex: 0 1 auto;
  overflow: auto;
  width: 100%;
  height: calc(100vh - 11.6rem);
  padding: 2.5rem 1rem 1rem 1rem;
  row-gap: 1.75rem;
  background-color: var(--surface-a);
}

.definition-main-container {
  background-color: var(--surface-a);
}

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  width: 100%;
  border-bottom: 1px solid var(--surface-border);
  border-left: 1px solid var(--surface-border);
  border-right: 1px solid var(--surface-border);
  border-radius: 3px;
  background-color: var(--surface-a);
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}

.field {
  padding: 0.3rem;
  margin: 0.5rem;
}

.input-text {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.pick-list-row {
  display: flex;
  align-items: center;
}

.row-button:hover {
  background-color: var(--text-color) !important;
  color: var(--surface-a) !important;
  z-index: 2;
}

label {
  font-size: 1rem !important;
}
.p-field {
  margin-top: 2rem;
}

.title {
  padding: 1rem 1rem 0 1rem;
}

.pick-button {
  margin-top: 1rem;
}

.result-table,
.content-table {
  height: calc(100vh - 33rem);
}
</style>
