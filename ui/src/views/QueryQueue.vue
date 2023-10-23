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
          <Column field="iri" header="Query"></Column>
          <Column field="queued" header="Queued"></Column>
          <Column field="started" header="Started"></Column>
          <Column field="finished" header="Finished"></Column>
          <Column field="killed" header="Killed"></Column>
          <Column field="status" header="Status">
            <template #body="{ data }"> <Tag v-tooltip="data.status" :value="getStatus(data.status)" :severity="getSeverity(data.status)" /> </template
          ></Column>
          <Column field="pid" header="Actions">
            <template #body="{ data }">
              <Button v-if="data.status == 'Running'" size="small" severity="danger">Kill</Button>
              <Button v-if="data.status == 'Finished'" size="small">Results</Button>
              <Button v-if="data.status.startsWith('Error')" size="small">Retry</Button>
            </template>
          </Column>
          <Column field="pid" header="">
            <template #body="{ data }">
              <Button v-if="data.status != 'Running'" icon="pi pi-trash" size="small" severity="danger"></Button>
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

const route = useRoute();
const queueId: ComputedRef<any[]> = computed(() => [{ id: route.params.queueId as string }]);
const loading = ref(true);
const queueData: Ref<any[]> = ref([]);

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

function getStatus(status: string) {
  if (status.startsWith("Error")) return "Error";
  else return status;
}

function getSeverity(status: string) {
  if (status.startsWith("Error")) return "danger";
  else if (status == "Killed") return "warning";
  else if (status == "Running") return "warning";
  else return "success";
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
</style>
