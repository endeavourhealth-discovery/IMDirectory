<template>
  <div id="address-file-download">

    <div id="search-results">
        <DataTable :value="searchResults" @rowSelect="onRowSelect" :loading="loading" selectionMode="single" scrollable scrollHeight="flex" showGridlines>
          <Column header="Date/Time" field="date-time">
            <template #body="{data}">
              <span>{{data.DT}}</span>
            </template>
          </Column>
          <Column header="Action" field="action">
            <template #body="{data}">
              <span>{{data.A}}</span>
            </template>
          </Column>
          <Column header="Filename" field="file">
            <template #body="{data}">
              <span>{{data.F}}</span>
            </template>
          </Column>
          <Column Header="Download" field="download">
            <template #body="{data}">
              <Button v-if="data.F" label="download" @click="DownloadBtn(data.F)"></Button>
            </template>
          </Column>
        </DataTable>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import uprnService from "@/services/UprnService";
import {ref, computed, onMounted} from "vue";
import {FilerService} from "@/services";
import UprnService from "@/services/UprnService";
import Env from "@/services/Env";

const username = import.meta.env.VITE_UPRN_USER;

const showResults = ref(false);
const searchResults = ref({});
const loading = ref(true);

async function refreshBtn () {

  loading.value = true;

  const result = await uprnService.activity(username)
  if (result) {
    console.log('Service Result:', JSON.stringify(result));

    showResults.value = true;
    searchResults.value = result;
  }

  loading.value = false;
}

onMounted (
    () => {refreshBtn();}
)

function DownloadBtn(testfile) {
  console.log("download test");

  //let testfile = "/opt/files/test.txt";

  UprnService.download(testfile)
      .then((blob: any) => {
        // let blob = response.data;
        console.log(blob);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = testfile;
        link.click();

        toast.add({ severity: "warn", summary: "Good news", detail: "Downloded OK", life: 3000 });
      })
      .catch((error: any) => {
        console.error("Error downloading the file:", error);
      });
}

const toast = useToast();
const confirm = useConfirm();

const onRowSelect = (event) => {
  if (event.data.F == undefined) {
    toast.add({ severity: "warn", summary: "Consider", detail: "Please select a row that contains a filename", life: 3000 });
    return;
  }
  confirm.require({
    header: "Confirm",
    message: 'Download ' + event.data.F +"?",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      const filename = event.data.F;
      const filenameParts = filename.split('/');
      const lastPiece = filenameParts[filenameParts.length - 1];

      DownloadBtn(lastPiece);
    },
    reject: () => {
      toast.add({ severity: "warn", summary: "Test", detail: "reject", life: 3000 });
    }
  });
}

function down() {
  // Handle the download functionality
}

function logToConsole(output: any) {
  console.log("["+output+"]");
}

</script>

<style scoped>
.buttons-container
{
  padding-top: 1rem;
}
#search-results {
  flex: 1 1 auto;
  overflow: auto;
  width: 100%;
}
#address-file-download {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  padding: 0.5rem;
}
</style>