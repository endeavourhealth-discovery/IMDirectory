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
          <Button type="button" label="Compare" @click="showCompareSetDialog = true" data-testid="compareButton" outlined />
        </div>
      </div>
    </div>

    <Accordion multiple v-model:value="active">
      <AccordionPanel value="0">
        <AccordionHeader>Subsets</AccordionHeader>
        <AccordionContent>
          <div class="set-accordion-content" id="set-definition-container">
            <SubsetDisplay :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionContent>
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
        </AccordionContent>
        <div class="set-accordion-content" id="set-definition-container">
          <QueryDisplay :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </AccordionPanel>
      <AccordionPanel value="2" header="Direct Members">
        <AccordionHeader>Direct Members</AccordionHeader>
        <AccordionContent>
          <div class="set-accordion-content" id="members-container">
            <Members :entityIri="props.entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" @open-download-dialog="displayDialog" />
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
  <CompareSetDialog v-model:show-dialog="showCompareSetDialog" :set-iri-a="entityIri" />
  <DownloadByQueryOptionsDialog
    :showDialog="showOptions"
    @download="download"
    @downloadIMV1="downloadIMV1"
    @close-dialog="showOptions = false"
    :show-definition="hasDefinition"
  />
</template>

<script setup lang="ts">
import Members from "./Members.vue";
import CompareSetDialog from "./CompareSetDialog.vue";
import SubsetDisplay from "./SubsetDisplay.vue";
import DownloadByQueryOptionsDialog from "@/components/shared/dialogs/DownloadByQueryOptionsDialog.vue";
import Footer from "@/components/shared/dynamicDialogs/Footer.vue";
import { computed, markRaw, onMounted, Ref, ref, watch } from "vue";
import { EntityService, SetService } from "@/services";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import QueryDisplay from "@/components/directory/viewer/QueryDisplay.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDialog } from "primevue/usedialog";
import setupDownloadFile from "@/composables/downloadFile";
import { useUserStore } from "@/stores/userStore";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { DownloadSettings } from "@im-library/interfaces";

interface Props {
  entityIri: string;
}

const dynamicDialog = useDialog();

const props = defineProps<Props>();
const toast = useToast();
const subsetOf = ref();
const isContainedIn = ref();
const subclassOf = ref();
const active: Ref<string[]> = ref([]);
const emit = defineEmits({ navigateTo: (_payload: string) => true });
const showCompareSetDialog = ref(false);

const { downloadFile } = setupDownloadFile(window, document);
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const downloading = ref(false);
const isPublishing = ref(false);
const showOptions = ref(false);
const entity: Ref<any> = ref({});

const { copyObjectToClipboard } = setupCopyToClipboard();

const hasDefinition = computed(() => isObjectHasKeys(entity.value, [IM.DEFINITION]) && entity.value[IM.DEFINITION]);

onMounted(async () => {
  active.value = ["0", "1", "2"];
  entity.value = await EntityService.getPartialEntity(props.entityIri, [IM.IS_SUBSET_OF, IM.IS_CONTAINED_IN, RDFS.SUBCLASS_OF, IM.DEFINITION, IM.HAS_MEMBER]);
  if (entity.value[IM.IS_SUBSET_OF]) {
    subsetOf.value = entity.value[IM.IS_SUBSET_OF];
  }
  if (entity.value[IM.IS_CONTAINED_IN]) {
    isContainedIn.value = entity.value[IM.IS_CONTAINED_IN];
  }
  if (entity.value[RDFS.SUBCLASS_OF]) {
    subclassOf.value = entity.value[RDFS.SUBCLASS_OF];
  }
});

async function onCopy(event: any) {
  event.stopPropagation();
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.DEFINITION]);
  if (isObjectHasKeys(entity, [IM.DEFINITION])) {
    const definition = JSON.parse(entity[IM.DEFINITION]);
    copyObjectToClipboard(navigator, definition);
  }
}

async function download(downloadSettings: DownloadSettings): Promise<void> {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  const definition = downloadSettings.selectedContents.includes("Definition");
  const core = downloadSettings.selectedContents.includes("Core");
  const legacy = downloadSettings.selectedContents.includes("Legacy");
  const im1id = downloadSettings.selectedContents.includes("IM1Id");
  showOptions.value = false;

  const schemes = [] as string[];
  if (downloadSettings.selectedSchemes.length !== 0) {
    downloadSettings.selectedSchemes.forEach(s => schemes.push(s["@id"]));
  }
  let result;
  try {
    result = await EntityService.getFullExportSet(
      props.entityIri,
      definition,
      core,
      legacy,
      downloadSettings.includeSubsets,
      downloadSettings.legacyInline,
      im1id,
      downloadSettings.selectedFormat,
      schemes,
      true
    );
  } catch (error: any) {
    if (isObjectHasKeys(error?.response?.data, ["code"]) && error?.response?.data?.code === "DownloadException") {
      downloadDialog.options.templates = { footer: markRaw(Footer) };
      downloadDialog.data.title = "Error";
      downloadDialog.data.text = "Download failed from server";
      return;
    } else throw error;
  }
  const labelResult = await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL, IM.VERSION]);
  let label = "";
  if (isObjectHasKeys(labelResult, [RDFS.LABEL, IM.VERSION])) label = labelResult[RDFS.LABEL] + " v" + labelResult[IM.VERSION];
  else if (isObjectHasKeys(labelResult, [RDFS.LABEL])) label = labelResult[RDFS.LABEL];
  downloadFile(result, getFileName(label, downloadSettings.selectedFormat));
  downloadDialog.close();
}

async function downloadIMV1(downloadOptions: DownloadSettings): Promise<void> {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  showOptions.value = false;
  let result;
  try {
    result = await SetService.IMV1(props.entityIri, true);
  } catch (err: any) {
    if (isObjectHasKeys(err?.response?.data, ["code"]) && err?.response.data.code === "DownloadException") {
      downloadDialog.options.templates = { footer: markRaw(Footer) };
      downloadDialog.data.title = "Error";
      downloadDialog.data.text = "Download failed from server";
      return;
    } else throw err;
  }
  let label = "";
  const resultLabel = await EntityService.getPartialEntity(props.entityIri, [RDFS.LABEL]);
  if (isObjectHasKeys(resultLabel, [RDFS.LABEL])) label = resultLabel[RDFS.LABEL];
  downloadFile(result, label + ".txt");
  downloadDialog.close();
}

function getFileName(label: string, format: string) {
  if (label.length > 100) {
    label = label.substring(0, 100);
  }
  return label + " - " + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + "." + format;
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
  background-color: var(--p-highlight-bg) !important;
  color: var(--p-text-color) !important;
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

.text {
  font-size: medium;
  padding: 0 0 1rem 0;
}
</style>
