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
              @click="toggle"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              :loading="downloading"
              data-testid="downloadButton"
            />
            <template id="overlay_menu">
              <Menu ref="menu" v-if="checkAuthorization()" :model="downloadMenu1" :popup="true" appendTo="body" data-testid="menuWithPublish" />
              <Menu ref="menu" v-else :model="downloadMenu" :popup="true" appendTo="body" data-testid="menuWithoutPublish" />
            </template>
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
        <template #body="{ data }">
          <IMViewerLink :iri="data['@id']" :label="data.name" action="select"/>
        </template>
      </Column>
      <template #footer v-if="loadButton">
        <Button label="Load more..." class="p-button-text p-button-plain" @click="loadMore" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { TTIriRef } from "im-library/interfaces";
import { DataTypeCheckers } from "im-library/helpers";
import { EntityService, LoggerService, SetService } from "@/services";
import { IM, RDFS } from "im-library/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";

const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const toast = useToast();
const store = useStore();
const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);
const hasDefintion: Ref<boolean> = ref(false);

const loading = ref(false);
const downloading = ref(false);
const members: Ref<TTIriRef[]> = ref([]);
const isPublishing = ref(false);
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
  () => props.conceptIri,
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
  const entity = await EntityService.getPartialEntity(props.conceptIri, [IM.DEFINITION]);
  hasDefintion.value = isObjectHasKeys(entity, [IM.DEFINITION]);
}

function toggle(event: any) {
  const x = menu.value as any;
  x.toggle(event);
}

async function getMembers(): Promise<void> {
  loading.value = true;
  const paged = await EntityService.getPartialAndTotalCount(props.conceptIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = paged.result;
  totalCount.value = paged.totalCount;
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
  loading.value = false;
}

async function downloadIMV1(): Promise<void> {
  downloading.value = true;
  try {
    toast.add(LoggerService.success("Download will begin shortly"));
    const result = await SetService.IMV1(props.conceptIri);
    const label: string = (await EntityService.getPartialEntity(props.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, label + ".txt");
  } catch (error) {
    toast.add(LoggerService.error("Download failed from server"));
  } finally {
    downloading.value = false;
  }
}

async function download(core: boolean, legacy: boolean, flat: boolean = false): Promise<void> {
  downloading.value = true;
  try {
    toast.add(LoggerService.success("Download will begin shortly"));
    const result = (await EntityService.getFullExportSet(props.conceptIri, core, legacy, flat)).data;
    const label: string = (await EntityService.getPartialEntity(props.conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    downloadFile(result, getFileName(label));
  } catch (error) {
    toast.add(LoggerService.error("Download failed from server"));
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

function downloadFile(data: any, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([data], { type: "application" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}

function publish() {
  isPublishing.value = true;
  SetService.publish(props.conceptIri)
    .then(() => {
      isPublishing.value = false;
      toast.add(LoggerService.success("Value set published", "Published to IM1 :" + props.conceptIri));
    })
    .catch(() => {
      isPublishing.value = false;
      toast.add(LoggerService.error("Failed to publish value set", "Publish to IM1 FAILED :" + props.conceptIri));
    });
}

function checkAuthorization() {
  if (isLoggedIn.value && currentUser.value) {
    return currentUser.value.roles.includes("IM1_PUBLISH");
  } else return false;
}

async function getPage(event:any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  let pagedNewMembers = await EntityService.getPartialAndTotalCount(props.conceptIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = pagedNewMembers.result;
  loading.value = false;
}
</script>

<style scoped>
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
</style>
