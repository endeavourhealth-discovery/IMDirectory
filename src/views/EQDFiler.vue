<template>
  <div id="topbar-mapper-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>EQD Filer</strong></span>
      </template>
    </TopBar>

    <ProgressBar v-if="progress !== undefined" :value="progress" />

    <div class="main-container">
      <div class="path-container">
        <label> Destination folder: </label>
        <InputText v-model="iri" class="input-text" disabled /> <Button label="Browse" @click="showFolders" />
      </div>
      <Dialog v-model:visible="showDialog" modal maximizable header="Select destination folder">
        <div>
          {{ iri }}
          <NavTree :selectedIri="iri" :typeFilter="[IM.FOLDER]" :useEmits="true" :childLength="20" @row-clicked="showDetails" />
        </div>
        <template #footer>
          <div class="im-dialog-footer">
            <div class="button-footer">
              <Button label="Close" @click="showDialog = false" text />
              <Button label="Select" class="primary" @click="showDialog = false" text />
            </div>
          </div>
        </template>
      </Dialog>
      <FileUpload
        name="demo[]"
        url="https://www.primefaces.org/upload.php"
        @upload="onAdvancedUpload($event)"
        :multiple="true"
        accept="application/json"
        :maxFileSize="100000000"
      >
        <template #empty>
          <p>Drag and drop files here to upload. Only EQD files allowed.</p>
        </template>
      </FileUpload>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import FileUpload, { FileUploadUploadEvent } from "primevue/fileupload";
import { useToast } from "primevue/usetoast";
import { IM } from "@/vocabulary";
import * as d3 from "d3";
import { ToastOptions } from "@/models";
import { ToastSeverity, UserRole } from "@/enums";
import { FilerService } from "@/services";
import { computed, Ref, ref, watch } from "vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTDocument } from "@/interfaces/AutoGen";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { useFilerStore } from "@/stores/filerStore";
import AdminService from "@/services/AdminService";
import NavTree from "@/components/shared/NavTree.vue";
import setupTree from "@/composables/setupTree";
import type { TreeNode } from "primevue/treenode";
const toast = useToast();
const filerStore = useFilerStore();
const iri = computed(() => filerStore.filerSelectedIri);

const progress = ref(); // Store the progress percentage
const intervalId: Ref<number | undefined> = ref(); // For polling
const polling = ref(1000);
const showDialog = ref(false);

const emit = defineEmits<{
  rowSelected: [payload: any];
  rowClicked: [payload: any];
  rowDblClicked: [payload: any];
  foundInTree: [];
}>();

const { root, selectedKeys, selectedNode, expandedKeys, expandedData, createTreeNode, loadMore, onNodeExpand, onNodeCollapse, findPathToNode, customOnClick } =
  setupTree(emit, 20);

async function showFolders() {
  showDialog.value = true;
}

async function expandNode(node: TreeNode) {
  await onNodeExpand(node, [IM.FOLDER]);
}

async function showDetails(data: any) {
  filerStore.updateFilerIri(data);
}

function pollProgress(taskId: string) {
  intervalId.value = window.setInterval(() => {
    FilerService.getTaskProgress(taskId)
      .then(response => {
        progress.value = response.progress;
        if (!isObjectHasKeys(response) || progress.value >= 100) {
          clearInterval(intervalId.value);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, polling.value);
}

async function onAdvancedUpload(event: FileUploadUploadEvent) {
  /*if (Array.isArray(event.files))
    for (const file of event.files) {
      try {
        const ttDocument = await getTTDocument(file);
        FilerService.fileDocument(ttDocument)
          .then(response => {
            pollProgress(response.taskId);
          })
          .catch(err => {
            console.error(err);
          });
      } catch (error) {
        toast.add(new ToastOptions(ToastSeverity.ERROR, "An error occurred: " + (error as Error).message));
      }
    }*/
}

async function getTTDocument(file: File) {
  /*  const url = URL.createObjectURL(file);
  const ttDocument = (await d3.json(url)) as TTDocument;
  ttDocument.crud = {
    iri: IM.REPLACE_ALL_PREDICATES
  };

  return ttDocument;*/
}
</script>

<style scoped lang="scss">
#topbar-mapper-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.path-container {
  margin: 1rem;
}

.input-text {
  width: 40%;
}
</style>
