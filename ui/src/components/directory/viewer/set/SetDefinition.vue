<template>
  <div class="set-definition-wrapper">
    <div class="details-container">
      <div class="table-header-bar">
        <ArrayObjectNamesToStringWithLabel v-if="isContainedIn" label="Contained in" :data="isContainedIn" />
        <ArrayObjectNamesToStringWithLabel v-if="subsetOf" label="Subset of" :data="subsetOf" />
        <ArrayObjectNamesToStringWithLabel v-if="subclassOf" label="Subclass of" :data="subclassOf" />
        <div class="buttons-container">
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
          <Button
            type="button"
            label="Compare"
            @click="showCompareSetDialog = true"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            :loading="downloading"
            data-testid="downloadButton"
          />
        </div>
      </div>
    </div>

    <Accordion multiple v-model:activeIndex="active">
      <AccordionTab header="Subsets">
        <div class="set-accordion-content" id="set-definition-container">
          <SubsetDisplay :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="definition-header">
            <span>Definition</span>
            <Button
              icon="fa-solid fa-copy"
              severity="secondary"
              class="p-button-outlined concept-button"
              v-tooltip.top="'Copy definition'"
              data-testid="copy-definition-button"
              @click="onCopy"
            />
          </div>
        </template>
        <div class="set-accordion-content" id="set-definition-container">
          <QueryDisplay :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </AccordionTab>
      <AccordionTab header="Direct Members">
        <div class="set-accordion-content" id="members-container">
          <Members :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </AccordionTab>
    </Accordion>
  </div>
  <CompareSetDialog v-model:show-dialog="showCompareSetDialog" :set-iri-a="entityIri" />
  <Dialog :visible="showOptions" :modal="true" :closable="false" :close-on-escape="false" header="Please select download options">
    <div class="flex-container content-container">
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
        <div class="card flex justify-content-left">
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
          <div class="card flex justify-content-left" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checked" class="w-9rem h-2rem" />
          </div>
        </div>
        <div class="toggle-container" :hidden="!displayLegacyOptions">
          <span class="text">Legacy</span>
          <div class="card flex justify-content-left" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checkedLegacy" onLabel="Own Row" offLabel="Inline Column" class="w-9rem h-2rem" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" v-if="displayLegacyOptions">
      <div class="p-field">
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="scheme" v-model="selectedSchemes" :options="schemesOptions" optionLabel="name" display="chip" />
            <label for="scheme">Filter Legacy Scheme</label>
          </span>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" style="justify-content: flex-end">
      <div class="card flex justify-content-center" style="gap: 1rem">
        <Button v-if="selectedFormat === 'IMv1'" label="Download" @click="downloadIMV1" :disabled="!isOptionsSelected" />
        <Button v-else label="Download" @click="download" :disabled="!isOptionsSelected" />
        <Button label="Cancel" severity="danger" @click="closeDialog" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Members from "./Members.vue";
import CompareSetDialog from "./CompareSetDialog.vue";
import SubsetDisplay from "./SubsetDisplay.vue";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { EntityService, SetService } from "@/services";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import QueryDisplay from "@/components/directory/viewer/QueryDisplay.vue";
import setupDownloadFile from "@/composables/downloadFile";
import { useUserStore } from "@/stores/userStore";
import { useFilterStore } from "@/stores/filterStore";
import { TTIriRef } from "@im-library/interfaces/AutoGen";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();
const toast = useToast();
const subsetOf = ref();
const isContainedIn = ref();
const subclassOf = ref();
const ttentity = ref();
const active = ref([] as number[]);
const emit = defineEmits({ navigateTo: (_payload: string) => true });
const showCompareSetDialog = ref(false);

const { downloadFile } = setupDownloadFile(window, document);
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const filterStore = useFilterStore();
const filterOptions = computed(() => filterStore.filterOptions);
const schemesOptions = filterOptions.value.schemes.filter((c: any) => c["@id"] !== IM.NAMESPACE || c["@id"] !== SNOMED.NAMESPACE);

const loading = ref(false);
const downloading = ref(false);
const members: Ref<TTIriRef[]> = ref([]);
const isPublishing = ref(false);
const showOptions = ref(false);
const isOptionsSelected = ref(false);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);

const formats = ref([
  { key: "csv", name: "csv", disable: false },
  { key: "tsv", name: "tsv", disable: false },
  { key: "xls", name: "xlsx", disable: false },
  { key: "im1", name: "IMv1", disable: false }
]);

const selectedFormat = ref();

const contents = ref([
  { key: "definition", name: "Definition", disable: true },
  { key: "core", name: "Core", disable: true },
  { key: "legacy", name: "Legacy", disable: true },
  { key: "im1Id", name: "IM1Id", disable: true }
]);

const selectedContents = ref();
const checkedLegacy = ref(false);
const checked = ref(true);
const displayLegacyOptions = ref(false);
const coreSelected = ref(false);

watch(selectedContents, () => {
  if (contents.value.length !== 0 && selectedFormat.value !== "IMv1") {
    contents.value[1].disable = !!(selectedContents.value.includes("Definition") && selectedFormat.value !== "xlsx");
    isCoreSelected();
    isLegacySelected();
  }
  isOptionsSelected.value = (selectedContents.value.length !== 0 && selectedFormat.value != null) || selectedFormat.value === "IMv1";
});

watch(selectedFormat, () => {
  selectedContents.value = [];
  checked.value = true;
  checkedLegacy.value = false;
  if (selectedFormat.value) {
    if (selectedFormat.value === "IMv1") {
      contents.value.forEach((f: any) => (f.disable = true));
    } else {
      contents.value.forEach((f: any) => (f.disable = false));
    }
  } else {
    contents.value.forEach((f: any) => (f.disable = true));
  }
});

onMounted(async () => {
  active.value = [0, 1, 2];
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.IS_SUBSET_OF, IM.IS_CONTAINED_IN, RDFS.SUBCLASS_OF]);
  ttentity.value = entity;
  if (entity[IM.IS_SUBSET_OF]) {
    subsetOf.value = entity[IM.IS_SUBSET_OF];
  }
  if (entity[IM.IS_CONTAINED_IN]) {
    isContainedIn.value = entity[IM.IS_CONTAINED_IN];
  }
  if (entity[RDFS.SUBCLASS_OF]) {
    subclassOf.value = entity[RDFS.SUBCLASS_OF];
  }
});

async function onCopy(event: any) {
  event.stopPropagation();
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.DEFINITION]);
  if (isObjectHasKeys(entity, [IM.DEFINITION])) {
    await navigator.clipboard.writeText(entity[IM.DEFINITION]);
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Definition copied to clipboard"));
  }
}

async function download(): Promise<void> {
  const definition = selectedContents.value.includes("Definition");
  const core = selectedContents.value.includes("Core");
  const legacy = selectedContents.value.includes("Legacy");
  const im1id = selectedContents.value.includes("IM1Id");
  showOptions.value = false;
  downloading.value = true;

  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Download will begin shortly"));
  const schemes = [] as string[];
  if (selectedSchemes.value.length !== 0) {
    selectedSchemes.value.forEach(s => schemes.push(s["@id"]));
  }
  let result;
  try {
    result = await EntityService.getFullExportSet(
      props.entityIri,
      definition,
      core,
      legacy,
      checked.value,
      checkedLegacy.value,
      im1id,
      selectedFormat.value,
      schemes,
      true
    );
  } catch (error: any) {
    if (isObjectHasKeys(error?.response?.data, ["code"]) && error?.response?.data?.code === "DownloadException") {
      toast.add(new ToastOptions(ToastSeverity.ERROR, "Download failed from server", error));
      return;
    } else throw error;
  }
  const labelResult = await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL]);
  let label = "";
  if (isObjectHasKeys(labelResult, [RDFS.LABEL])) label = labelResult[RDFS.LABEL];
  downloadFile(result, getFileName(label));
  downloading.value = false;
}

async function downloadIMV1(): Promise<void> {
  showOptions.value = false;
  downloading.value = true;
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Download will begin shortly"));
  let result;
  try {
    result = await SetService.IMV1(props.entityIri, true);
  } catch (err: any) {
    if (isObjectHasKeys(err?.response?.data, ["code"]) && err?.response.data.code === "DownloadException") {
      toast.add(new ToastOptions(ToastSeverity.ERROR, "Download  failed from server", err));
      return;
    } else throw err;
  }
  let label = "";
  const resultLabel = await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL]);
  if (isObjectHasKeys(resultLabel, [RDFS.LABEL])) label = resultLabel[RDFS.LABEL];
  downloadFile(result, label + ".txt");
  downloading.value = false;
}

function getFileName(label: string) {
  if (label.length > 100) {
    label = label.substring(0, 100);
  }
  return label + " - " + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + "." + selectedFormat.value;
}

function checkAuthorization() {
  if (isLoggedIn.value && currentUser.value) {
    return currentUser.value.roles.includes("IM1_PUBLISH");
  } else return false;
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

function displayDialog() {
  showOptions.value = true;
}

function closeDialog() {
  showOptions.value = false;
}

function isCoreSelected() {
  if (selectedContents.value.includes("Core")) {
    if (selectedFormat.value !== "xlsx") {
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
    selectedSchemes.value = [];
    coreSelected.value = false;
    const indexLegacy = selectedContents.value.indexOf("Legacy");
    if (indexLegacy !== -1) {
      selectedContents.value.splice(indexLegacy, 1);
    }
    const indexIM1Id = selectedContents.value.indexOf("IM1Id");
    if (indexIM1Id !== -1) {
      selectedContents.value.splice(indexIM1Id, 1);
    }
  }
}

function isLegacySelected() {
  if (selectedContents.value.includes("Legacy")) {
    displayLegacyOptions.value = true;
  } else {
    displayLegacyOptions.value = false;
    selectedSchemes.value = [];
    checkedLegacy.value = false;
  }
}
</script>

<style scoped>
.details-container {
  padding-bottom: 1rem;
}
.set-accordion-content {
  height: 100%;
}

.set-definition-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.definition-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
}

.concept-button {
  margin-right: 0.5rem;
}

.concept-button:hover {
  background-color: var(--highlight-bg) !important;
  color: var(--text-color) !important;
}

.table-header-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
}

.buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-right: 0.5rem;
}

.check-container {
  gap: 1rem;
}

.content-container {
  padding: 20px;
}

.text {
  font-size: medium;
  padding: 0 0 1rem 0;
}

.flex-container {
  gap: 5rem;
  display: flex;
  flex-wrap: nowrap;
}

.p-field {
  width: 400px;
}

.item-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.toggle-container {
  padding: 0 0 30px 0;
  gap: 2rem;
}
</style>
