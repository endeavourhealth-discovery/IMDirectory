<template>
  <div id="topbar-mapper-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Filer</strong></span>
      </template>
    </TopBar>

    <ProgressBar v-if="progress !== undefined" :value="progress" />

    <div class="main-container">
      <FileUpload
        name="demo[]"
        url="https://www.primefaces.org/upload.php"
        @upload="onAdvancedUpload($event)"
        :multiple="true"
        accept="application/json"
        :maxFileSize="100000000"
      >
        <template #empty>
          <p>Drag and drop files here to upload. Only TTDocuments allowed.</p>
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
import { ToastSeverity } from "@/enums";
import { FilerService } from "@/services";
import { Ref, ref } from "vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTDocument } from "@/interfaces/AutoGen";
const toast = useToast();

const progress = ref(); // Store the progress percentage
const intervalId: Ref<number | undefined> = ref(); // For polling
const polling = ref(1000);

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
  if (Array.isArray(event.files))
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
    }
}

async function getTTDocument(file: File) {
  const url = URL.createObjectURL(file);
  const ttDocument = (await d3.json(url)) as TTDocument;
  ttDocument.crud = {
    iri: IM.REPLACE_ALL_PREDICATES
  };

  return ttDocument;
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
</style>
