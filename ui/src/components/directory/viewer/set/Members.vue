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
          <IMViewerLink :iri="data['@id']" :label="data.name" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog :visible="showOptions" :modal="true" :closable="false" :close-on-escape="false" header="Please select download options">
    <div class="flex-container content-container" v-if="showSchemes">
      <div class="p-field">
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="scheme" v-model="selectedSchemes" :options="schemesOptions" optionLabel="name" display="chip" />
            <label for="scheme">Select scheme</label>
          </span>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" >
      <div class="item-container">
        <span class="text">Format</span>
        <div class="card flex justify-content-center">
          <div class="flex flex-column gap-3">
            <div v-for="format of formats" :key="format.key" class="flex align-items-center">
              <RadioButton v-model="selectedFormat" :inputId="format.key" name="pizza" :value="format.name" />
              <label :for="format.key" class="ml-2">{{ format.name }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="item-container">
        <span class="text">Content</span>
        <div class="card flex justify-content-left" >
          <div class="flex flex-column gap-3">
            <div v-for="content of contents" :key="content.key" class="flex align-items-center check-container">
              <Checkbox v-model="selectedContents" :inputId="content.key" name="content" :value="content.name" :disabled="content.disable" />
              <label :for="content.key">{{ content.name }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="item-container">
        <div class="toggle-container" :hidden="!coreSelected">
          <span class="text">Show Subset</span>
          <div class="card flex justify-content-left" style="margin:10px 0 0 0">
            <ToggleButton v-model="checked" class="w-9rem h-2rem" />
          </div>
        </div>
        <div class="toggle-container" :hidden="!showLegacy">
          <span class="text" >Legacy</span>
          <div class="card flex justify-content-left" style="margin:10px 0 0 0">
            <ToggleButton v-model="checkedLegacy" onLabel="Own Row" offLabel="Inline Column" class="w-9rem h-2rem" />
          </div>
        </div>
        <div class="toggle-container" :hidden="!showLegacy">
          <span class="text" >Filter schemes</span>
          <div class="card flex justify-content-left" style="margin:10px 0 0 0">
            <ToggleButton v-model="filterSchemes" class="w-9rem h-2rem" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex-container content-container">
      <div class="card flex justify-content-center" style="gap: 1rem">
        <Button v-if="selectedFormat === 'IMv1'" label="Download" @click="downloadIMV1" :disabled="!isOptionsSelected"/>
        <Button v-else label="Download" @click="download" :disabled="!isOptionsSelected"/>
        <Button label="Cancel" severity="danger" @click="closeDialog"/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ComputedRef, onMounted, ref, Ref, watch} from "vue";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EntityService, SetService } from "@/services";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import setupDownloadFile from "@/composables/downloadFile";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";
import { useFilterStore } from "@/stores/filterStore";
import { FilterOptions } from "@im-library/interfaces";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({ onOpenTab: (payload: string) => payload, navigateTo: (_payload: string) => true });
const { downloadFile } = setupDownloadFile(window, document);
const toast = useToast();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const hasDefintion: Ref<boolean> = ref(false);

const filterStore = useFilterStore();
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const schemesOptions = filterOptions.value.schemes.filter((c: any) => c["@id"] !== IM.NAMESPACE || c["@id"] !== SNOMED.NAMESPACE);

const loading = ref(false);
const downloading = ref(false);
const members: Ref<TTIriRef[]> = ref([]);
const isPublishing = ref(false);
const showOptions = ref(false);
const isOptionsSelected= ref(false);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);

const formats = ref([
  {key: "csv", name: "csv", disable: false},
  {key: "tsv", name: "tsv", disable: false},
  {key: "xls", name: "xlsx", disable: false},
  {key: "im1", name: "IMv1", disable: false}
]);

const selectedFormat = ref();

const contents = ref([
  {key: "definition", name: "Definition", disable: true},
  {key: "core", name: "Core", disable: true},
  {key: "legacy", name: "Legacy", disable: true},
  {key: "im1Id", name: "IM1Id", disable: true}
]);

const selectedContents = ref();
const checkedLegacy = ref(false);
const filterSchemes = ref(false);
const checked = ref(true);
const showLegacy = ref(false);
const showSchemes = ref(false);
const coreSelected = ref(false);

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

watch(
    () => selectedContents.value,
    () => {
      if(contents.value.length !== 0 && selectedFormat.value !== "IMv1") {
        contents.value[1].disable = !!(selectedContents.value.includes("Definition") && selectedFormat.value !== "xlsx");
        isCoreSelected();
        isLegacySelected();
      }
      isOptionsSelected.value = selectedContents.value.length !== 0 && selectedFormat.value != null || selectedFormat.value === "IMv1";
    }
)

watch(
    () => selectedFormat.value,
    () => {
      selectedContents.value = [];
      checked.value = true;
      checkedLegacy.value = false;
      filterSchemes.value = false;
      if(selectedFormat.value) {
        if(selectedFormat.value === "IMv1") {
          contents.value.forEach((f:any) => f.disable = true);
        } else {
          contents.value.forEach((f:any) => f.disable = false);
        }
      } else {
        contents.value.forEach((f:any) => f.disable = true);
      }
    }
)

watch(
    () => filterSchemes.value,
    () => {
      if(filterSchemes.value) {
        showSchemes.value = true;
      } else {
        showSchemes.value = false;
        selectedSchemes.value = [];
      }
    })

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

async function download(): Promise<void> {
  const definition = selectedContents.value.includes("Definition");
  const core = selectedContents.value.includes("Core");
  const legacy = selectedContents.value.includes("Legacy");
  const im1id = selectedContents.value.includes("IM1Id");
  showOptions.value = false;
  downloading.value = true;
  try {
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Download will begin shortly"));
    const schemes = [] as string[];
    if(selectedSchemes.value.length !== 0) {
      selectedSchemes.value.forEach(s => schemes.push(s["@id"]));
    }
    const result = (await EntityService.getFullExportSet(props.entityIri, definition, core, legacy, checked.value, checkedLegacy.value, im1id, selectedFormat.value,schemes)).data;
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
  return label + " - " + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + "." + selectedFormat.value;
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

function displayDialog() {
  showOptions.value = true;
}

function closeDialog() {
  showOptions.value = false;
}

function toggle(event: any) {
  const x = menu.value as any;
  x.toggle(event);
}

function isCoreSelected() {
  if(selectedContents.value.includes("Core")) {
    if(selectedFormat.value !== "xlsx") {
      contents.value[0].disable = true;
    }
    contents.value[2].disable = false;
    contents.value[3].disable = false;
    coreSelected.value = true;
  } else {
    contents.value[0].disable = false;
    contents.value[2].disable = true;
    contents.value[3].disable = true;
    checked.value = true;
    checkedLegacy.value = false;
    filterSchemes.value = false;
    showSchemes.value = false;
    selectedSchemes.value = [];
    coreSelected.value = false;
    const indexLegacy = selectedContents.value.indexOf("Legacy");
    if(indexLegacy !== -1) {
      selectedContents.value.splice(indexLegacy, 1);
    }
    const indexIM1Id = selectedContents.value.indexOf("IM1Id");
    if(indexIM1Id !== -1) {
      selectedContents.value.splice(indexIM1Id, 1);
    }
  }
}

function isLegacySelected() {
  if(selectedContents.value.includes("Legacy")) {
    showLegacy.value = true;
    if(filterSchemes.value) {
      showSchemes.value = true;
    }
  } else {
    showLegacy.value = false;
    showSchemes.value = false;
    selectedSchemes.value = [];
    checkedLegacy.value = false;
    filterSchemes.value = false;
  }
}

</script>

<style scoped>
.p-field {
  width: 400px;
}

.item-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  /*align-items: center;*/
}

.toggle-container{
  padding: 0 0 30px 0;
  gap: 2rem;
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
.flex-container {
  gap: 5rem;
  display: flex;
  flex-wrap: nowrap;
}

/*::v-deep(.p-dialog) {*/
/*  padding: 50px 200px 50px 200px !important;*/
/*}*/

.check-container{
  gap: 1rem;
}

.content-container{
  padding: 20px;
}


.text {
  font-size: medium;
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
