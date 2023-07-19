<template>
  <div>
    <!-- <h1>Download page</h1>  -->
    <br> <!-- <br> -->
    <button @click="refreshBtn">Refresh</button>
    <br><br>
    <button @click="DownloadBtn('/opt/files/test.txt')">Download Test</button>
    <br><br>

    <table v-if="showResults">

      <!--
      <tr v-for="item in searchResults">
        <td>{{item.DT}}</td>
        <td>{{item.A}}</td>
        <td>{{item.F}}</td>
      </tr>
      -->

      <tbody>
        <!-- searchResults -->
        <!-- :rowsPerPageOptions="[5, 10]" -->
        <DataTable :value="searchResults" @rowSelect="onRowSelect" selectionMode="single" scrollable scrollHeight="600px" showGridlines paginator :rows="20" tableStyle="min-width: 50rem">
          <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column>
          <!-- <template #body="{ rowData }: { rowData: YourObjectType }">
            <span>{{ rowData[col.field] }}</span>
            <div>
              {{ logToConsole(rowData[col.field.data]) }}
            </div>
            <div v-if="col.field === 'F'">
              <button v-if="rowData[col.field] !== null" @click="downloadFile(rowData[col.field])">Download</button>
            </div>
            <div v-else>
              {{ rowData[col.field] }}
            </div>
          </template> -->
        </DataTable>
      </tbody>

    </table>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import uprnService from "@/services/UprnService";
import {ref, computed} from "vue";
import {FilerService} from "@/services";
import UprnService from "@/services/UprnService";
import Env from "@/services/Env";

const username = Env.UPRN_USER;

const showResults = ref(false);
const searchResults = ref({});

const columns = [
  { field: 'DT', header: 'Date/Time' },
  { field: 'A', header: 'Action' },
  { field: 'F', header: 'File' },
  //{ field: 'download', header: 'Download' }
]

interface YourObjectType {
  DT: string;
  A: string;
  F: string | null;
}

const refreshBtn = () => {

  uprnService.activity(username)
      .then((result) => {

        console.log('Service Result:', JSON.stringify(result));

        showResults.value = true;
        searchResults.value = result;

      }).catch((error) => {
    // Handle any errors that occurred during the service call
    console.error('Service Error:', error);
  });
}

const DownloadBtn = (testfile) => {
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
};

const setup= () => {
  //const XResults = ref([searchResults]);
  console.log("hit");
  const columns =  [{ field: 'DT', header: 'Date/Time' },
    { field: 'A', header: 'Action' },
    { field: 'F', header: 'File' }]

  const filteredResults = computed(() => {
    return searchResults.value.filter((row) => row.F === null);
  });

  function onRowSelect(rowData) {
    // Handle row selection
  }

  return {
    searchResults,
    columns,
    filteredResults,
    onRowSelect
  };
}

function down() {
  // Handle the download functionality
}

function logToConsole(output: any) {
  console.log("["+output+"]");
}

</script>

<style scoped>
.data-table {
  border-collapse: collapse;
  width: 100%;
}

.data-table th,
.data-table td {
  padding: 8px;
  border: 1px solid #ddd;
}

.data-table th {
  background-color: #f2f2f2;
}
</style>