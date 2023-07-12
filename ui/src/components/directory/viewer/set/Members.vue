<template>
  <div id="members-table-container">
    <DataTable
      :value="members"
      showGridlines
      :scrollable="true"
      sortMode="single"
      sortField="label"
      :sortOrder="1"
      class="p-datatable-sm"
      scrollHeight="flex"
      :loading="loading"
      data-testid="table"
      :lazy="true"
      :paginator="true"
      :rowsPerPageOptions="[25, 50, 100]"
      :rows="25"
      :totalRecords="totalCount"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :currentPageReportTemplate="templateString"
      @page="getPage($event)"
    >
      <template #header>
        <div class="table-header-bar">
          <div class="checkboxes-container">
            <template v-if="checkAuthorization()">
              <Button type="button" label="Publish" @click="publish" :loading="isPublishing" data-testid="publishButton"></Button>
            </template>
            <Button
              type="button"
              label="Download..."
              @click="displayDialog"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              :loading="downloading"
              data-testid="downloadButton"
            />
          </div>
        </div>
      </template>
      <template #empty>
        No direct members found.
        <div v-if="hasDefintion">
          <Button label="Download to see query defintion results" class="p-button-link" @click="toggle" />
        </div>
      </template>
      <template #loading> Loading data. Please wait... </template>
      <Column field="member" header="Name">
        <template #body="{ data }: any">
          <IMViewerLink :iri="data['@id']" :label="data.name" action="select" />
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog :visible="showOptions" :modal="true" :closable="false" :close-on-escape="false">
    <div class="type-selector">
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="header-content-container">
        <span class="text">Select to download</span>
        <div class="type-buttons-container">
          <button v-for="option in checkAuthorization() ? downloadMenu1 : downloadMenu" class="custom-button" @click="option.command">
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EntityService, SetService } from "@/services";
import { IM, RDFS } from "@im-library/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import setupDownloadFile from "@/composables/downloadFile";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();
const { downloadFile } = setupDownloadFile(window, document);
const toast = useToast();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const hasDefintion: Ref<boolean> = ref(false);

const loading = ref(false);
const downloading = ref(false);
const members: Ref<TTIriRef[]> = ref([]);
const isPublishing = ref(false);
const showOptions = ref(false);
const downloadMenu = ref([
  { label: "Definition Only", command: () => download(false, false) },
  { label: "Core", command: () => download(true, false) },
  { label: "Core & Legacy", command: () => download(true, true) },
  { label: "Core & Legacy (Flat)", command: () => download(true, true, true) }
]);
const downloadMenu1 = ref([
  { label: "Definition Only", command: () => download(false, false) },
  { label: "Core", command: () => download(true, false) },
  { label: "Core & Legacy", command: () => download(true, true) },
  { label: "Core & Legacy (Flat)", command: () => download(true, true, true) },
  { label: "IMv1", command: () => downloadIMV1() }
]);

const menu = ref();
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");
const totalCount = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  await getMembers();
  await setHasDefinition();
}

async function setHasDefinition() {
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.DEFINITION]);
  hasDefintion.value = isObjectHasKeys(entity, [IM.DEFINITION]);
}

function displayDialog() {
  showOptions.value = true;
}

function toggle(event: any) {
  const x = menu.value as any;
  x.toggle(event);
}

async function getMembers(): Promise<void> {
  loading.value = true;
  const paged = await EntityService.getPartialAndTotalCount(props.entityIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = paged.result;
  totalCount.value = paged.totalCount;
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
  loading.value = false;
}

async function downloadIMV1(): Promise<void> {
  showOptions.value = false;
  downloading.value = true;
  try {
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Download will begin shortly"));
    const result = await SetService.IMV1(props.entityIri);
    const label: string = (await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, label + ".txt");
  } catch (err) {
    toast.add(new ToastOptions(ToastSeverity.ERROR, "Download  failed from server", err));
  } finally {
    downloading.value = false;
  }
}

async function download(core: boolean, legacy: boolean, flat: boolean = false): Promise<void> {
  showOptions.value = false;
  downloading.value = true;
  try {
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Download will begin shortly"));
    const result = (await EntityService.getFullExportSet(props.entityIri, core, legacy, flat)).data;
    const label: string = (await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, getFileName(label));
  } catch (error) {
    toast.add(new ToastOptions(ToastSeverity.ERROR, "Download failed from server", error));
  } finally {
    downloading.value = false;
  }
}

function getFileName(label: string) {
  if (label.length > 100) {
    label = label.substring(0, 100);
  }
  return label + " - " + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + ".xlsx";
}

function publish() {
  isPublishing.value = true;
  SetService.publish(props.entityIri)
    .then(() => {
      isPublishing.value = false;
      toast.add(new ToastOptions(ToastSeverity.SUCCESS, `Value set published to IM1 : ${props.entityIri}`));
    })
    .catch(() => {
      isPublishing.value = false;
      toast.add(new ToastOptions(ToastSeverity.ERROR, `Failed to publish value set to IM1 : ${props.entityIri}`));
    });
}

function checkAuthorization() {
  if (isLoggedIn.value && currentUser.value) {
    return currentUser.value.roles.includes("IM1_PUBLISH");
  } else return false;
}

async function getPage(event: any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  let pagedNewMembers = await EntityService.getPartialAndTotalCount(props.entityIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = pagedNewMembers.result;
  loading.value = false;
}
</script>

<style scoped>
.header-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.type-selector {
  width: 100%;
  height: 100%;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.type-buttons-container {
  width: 80%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.text {
  font-size: large;
  padding: 0 0 1rem 0;
}

#members-table-container {
  height: 100%;
  width: 100%;
}

#members-table-container:deep(td) {
  width: 100%;
  overflow: auto;
  word-break: break-all;
}

#members-table-container:deep(.p-datatable) {
  width: 100%;
  height: 100%;
}

#members-table-container:deep(.p-datatable-table) {
  width: 100%;
}

#members-table-container:deep(.p-datatable-wrapper) {
  height: auto;
  flex: 0 1 auto;
}

.group-header {
  font-weight: 700;
  color: rgba(51, 153, 255, 0.8);
}

.checkboxes-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
}

.complex-member-container {
  width: 100%;
}

.name-container {
  width: 100%;
  padding: 1rem;
  white-space: pre;
  overflow: auto;
}

.html-container ::v-deep(p) {
  margin-bottom: 0 !important;
}

.table-header-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
}

.custom-button {
  display: flex;
  font-family: "Lato", sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: steelblue;
  color: #fff;
  line-height: 42px;
  padding: 0 1rem;
  border: none;
}

.custom-button span {
  flex: 1 1 auto;
  display: block;
  width: 100%;
  height: 100%;
}
.custom-button:before,
.custom-button:after {
  position: absolute;
  content: "";
  height: 0%;
  width: 2px;
  background: steelblue;
}
.custom-button:before {
  right: 0;
  top: 0;
  transition: all 500ms ease;
}
.custom-button:after {
  left: 0;
  bottom: 0;
  transition: all 500ms ease;
}
.custom-button:hover {
  color: steelblue;
  background: transparent;
}
.custom-button:hover:before {
  transition: all 500ms ease;
  height: 100%;
}
.custom-button:hover:after {
  transition: all 500ms ease;
  height: 100%;
}
.custom-button span:before,
.custom-button span:after {
  position: absolute;
  content: "";
  background: steelblue;
}
.custom-button span:before {
  left: 0;
  top: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:after {
  right: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:hover:before {
  width: 100%;
}
.custom-button span:hover:after {
  width: 100%;
}
</style>
