<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>Query Queue</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="container">
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else>
        <Button label="Refresh" icon="fa-solid fa-arrows-rotate" @click="refresh" size="small" />

        <DataTable :value="queueData" tableStyle="font-size: 0.8rem" dataKey="id" class="p-datatable-sm" v-model:selection="queueId" selectionMode="single">
          <!--      <Column field="id" header="Id"></Column>-->
          <Column field="name" header="Query"></Column>
          <Column field="queued" header="Queued" style="width: 8.5rem"></Column>
          <Column field="started" header="Started" style="width: 8.5rem"></Column>
          <Column field="finished" header="Finished" style="width: 8.5rem"></Column>
          <Column field="stopped" header="Stopped" style="width: 8.5rem"></Column>
          <Column field="time" header="Run time" style="width: 5rem"></Column>
          <Column field="status" header="Status" style="width: 5rem">
            <template #body="{ data }"> <Tag v-tooltip="data.status" :value="getStatus(data)" :severity="getSeverity(data)" /> </template
          ></Column>
          <Column field="pid" header="Actions" class="space-children" style="width: 10rem">
            <template #body="{ data }">
              <Button
                v-if="data.status == 'Finished'"
                icon="pi pi-download"
                size="small"
                @click="confirmDownload(data.id)"
                outlined
                v-tooltip.left="'Download query results'"
              ></Button>
              <!--              <Button v-if="data.status.startsWith('Error')" size="small">Retry</Button>-->
              <Button
                v-if="data.status == 'Running'"
                icon="pi pi-stop"
                size="small"
                severity="danger"
                @click="confirmStop(data.id)"
                style="float: right"
                outlined
                v-tooltip.left="'Stop query running'"
              ></Button>

              <Button
                v-if="data.status != 'Running'"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                @click="confirmRemove(data.id)"
                style="float: right"
                outlined
                v-tooltip.left="'Delete queue item (and results)'"
              ></Button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { ComputedRef, computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { QueryService } from "@/services";
import { Ref } from "vue/dist/vue";
import { QueryQueueItem } from "@im-library/interfaces";
import Swal from "sweetalert2";

const route = useRoute();
const queueId: ComputedRef<any[]> = computed(() => [{ id: route.params.queueId as string }]);
const loading = ref(true);
const queueData: Ref<QueryQueueItem[]> = ref([]);

onMounted(async () => {
  await refresh();
});

watch(
  () => queueId.value,
  async () => {
    await refresh();
  }
);

async function refresh() {
  loading.value = true;

  queueData.value = await QueryService.listQueue();

  loading.value = false;
}

function getStatus(data: QueryQueueItem) {
  if (data.status.startsWith("Error")) return "Error";
  else if (data.status.startsWith("Finish") && data.pid) return "Fetching";
  else return data.status;
}

function getSeverity(data: QueryQueueItem) {
  if (data.status.startsWith("Error")) return "danger";
  else if (data.status.startsWith("Stop")) return "danger";
  else if (data.status == "Running") return "warning";
  else if (data.status.startsWith("Finish") && data.pid) return "warning";
  else return "success";
}

function confirmStop(queueId: string) {
  console.log("Confirm");
  Swal.fire({
    title: "Stop the query?",
    html: "No query results will be produced",
    icon: "warning",
    confirmButtonText: "Stop the query",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) stop(queueId);
  });
}

async function stop(queueId: string) {
  await QueryService.stop(queueId);
  await refresh();
}

function confirmRemove(queueId: string) {
  console.log("Confirm");
  Swal.fire({
    title: "Delete queue item?",
    html: "This will also delete the associated query results",
    icon: "warning",
    confirmButtonText: "Delete queue item",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) remove(queueId);
  });
}

async function remove(queueId: string) {
  await QueryService.deleteFromQueue(queueId);
  await refresh();
}

function confirmDownload(queueId: string) {
  console.log("Confirm");
  Swal.fire({
    title: "Download query results?",
    html: "This could take a while for large amounts of data",
    icon: "warning",
    confirmButtonText: "Download query results",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) download(queueId);
  });
}

function download(queueId: string) {
  console.log("DOWNLOAD " + queueId);
}
</script>

<style lang="scss">
#topbar-query-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.container {
  padding: 1rem;
}

.space-children > * {
  margin: 0 0.2rem;
}
</style>
