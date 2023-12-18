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
          <Column field="pid" header="Actions" class="space-children" style="width: 13rem">
            <template #body="{ data }">
              <Button
                v-if="data.status == 'Finished'"
                icon="pi pi-download"
                size="small"
                @click="confirmDownload(data.id)"
                outlined
                v-tooltip.left="'Download query results'"
              ></Button>
              <Button
                v-if="data.status == 'Finished'"
                icon="pi pi-eye"
                size="small"
                @click="viewResults(data.id)"
                outlined
                v-tooltip.left="'View query results'"
              ></Button>
              <Button
                v-if="data.status == 'Finished'"
                icon="pi pi-chart-bar"
                size="small"
                @click="graphResults(data.id, data.baseType)"
                outlined
                v-tooltip.left="'Graph results'"
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
  <Dialog
    header="Query Results"
    :visible="tableView && resultData != undefined"
    :modal="true"
    :style="{ width: '80vw' }"
    @update:visible="resultData = undefined"
  >
    <DataTable
      :value="resultData"
      scrollable
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      @page="pageTable"
    >
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" text />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-download" text />
      </template>
      <Column field="id" header="Id" /> <Column field="json" header="Data"
    /></DataTable>
    <template #footer>
      <Button label="Close" @click="tableView = false" data-testid="close-button" />
    </template>
  </Dialog>
  <Dialog header="Query Results" :visible="graphView" :modal="true" :style="{ width: '80vw' }" @update:visible="resultData = undefined">
    <div class="chart-options">
      <div>
        <label for="style">Style</label>
        <Dropdown id="style" v-model="selectedStyle" :options="styleOptions" placeholder="Select a style"></Dropdown>
      </div>
      <div>
        <label for="group">Group by</label>
        <MultiSelect id="group" v-model="selectedGroups" :options="modelProps" optionLabel="name" placeholder="Select property"></MultiSelect>
        <!--        <Dropdown id="group" v-model="selectedGroup" :options="modelProps" optionLabel="name" placeholder="Select a property"></Dropdown>-->
      </div>
      <div>
        <label for="show">Showing</label>
        <Dropdown id="show" v-model="selectedCalc" :options="calcOptions" placeholder="Select a calculation"></Dropdown>
      </div>
    </div>
    <v-chart v-if="graphData" class="chart" :option="graphOptions" autoresize />
    <template #footer>
      <Button label="Close" @click="graphView = false" data-testid="close-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { DataModelService, QueryService } from "@/services";
import { Ref } from "vue/dist/vue";
import { QueryQueueItem } from "@im-library/interfaces";
import Swal from "sweetalert2";
import { DataTablePageEvent } from "primevue/datatable";
import VChart from "vue-echarts";
import { EChartsOption } from "echarts";
import { TTIriRef } from "@im-library/interfaces/AutoGen";

const route = useRoute();
const queueId: Ref<any> = ref(); // : ComputedRef<any[]> = computed(() => [{ id: route.params.queueId as string }]);
const loading: Ref<boolean> = ref(true);
const queueData: Ref<QueryQueueItem[]> = ref([]);
const resultData: Ref<any[] | undefined> = ref();
const tableView: Ref<boolean> = ref(false);
const graphView: Ref<boolean> = ref(false);
const modelProps: Ref<TTIriRef[]> = ref([]);
const selectedGroups: Ref<TTIriRef[]> = ref([]);
const selectedCalc: Ref<string> = ref("Count");
const calcOptions: string[] = ["Count", "Sum", "Average", "Percentage"];
const selectedCalcField: Ref<string | undefined> = ref();
const selectedStyle: Ref<any> = ref("pie");
const styleOptions: string[] = ["pie", "bar", "line"];
const graphData = ref();

const graphOptions: Ref<EChartsOption> = ref({});

onMounted(async () => {
  await refresh();
});

watch(
  () => route.params.queueId,
  async newValue => {
    queueId.value = { id: newValue };
    await refresh();
  }
);

watch(
  () => [selectedGroups.value, selectedCalc.value, selectedStyle.value],
  async () => {
    await refreshGraph();
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

function confirmStop(id: string) {
  Swal.fire({
    title: "Stop the query?",
    html: "No query results will be produced",
    icon: "warning",
    confirmButtonText: "Stop the query",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) stop(id);
  });
}

async function stop(id: string) {
  await QueryService.stop(id);
  await refresh();
}

function confirmRemove(id: string) {
  Swal.fire({
    title: "Delete queue item?",
    html: "This will also delete the associated query results",
    icon: "warning",
    confirmButtonText: "Delete queue item",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) remove(id);
  });
}

async function remove(id: string) {
  await QueryService.deleteFromQueue(id);
  await refresh();
}

function confirmDownload(id: string) {
  Swal.fire({
    title: "Download query results?",
    html: "This could take a while for large amounts of data",
    icon: "warning",
    confirmButtonText: "Download query results",
    showCancelButton: true,
    cancelButtonText: "Cancel"
  }).then(result => {
    if (result.isConfirmed) download(id);
  });
}

function download(id: string) {
  console.log("DOWNLOAD " + id);
}

async function viewResults(id: string) {
  queueId.value = { id: id };
  resultData.value = await QueryService.getResultData(queueId.value.id);
  tableView.value = true;
}

async function graphResults(id: string, modelIri: string) {
  if (modelProps.value.length == 0) {
    modelProps.value = (await DataModelService.getDataModelProperties(modelIri)).map(p => p.property!);
  }

  queueId.value = { id: id };
  graphView.value = true;
}

async function refreshGraph() {
  if (!selectedGroups.value || !selectedCalc.value) return;

  graphData.value = await QueryService.getGraphData(
    queueId.value.id,
    selectedGroups.value.map(g => g["@id"]),
    selectedCalc.value,
    selectedCalcField.value
  );

  if ("pie" === selectedStyle.value) {
    graphOptions.value = {
      title: {
        text: "Query Results",
        left: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: graphData.value.map((v: any) => v[0])
      },
      series: [
        {
          name: "Cohort",
          type: selectedStyle.value,
          radius: "55%",
          center: ["50%", "60%"],
          data: graphData.value.map((v: any) => ({ name: v[0], value: v[1] })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };
  } else {
    const series: any[] = [];
    const groups: string[] = [...new Set<string>(graphData.value.map((v: any) => v[0]))];

    if (selectedGroups.value.length == 1) {
      series.push({
        name: "Cohort",
        type: selectedStyle.value,
        data: graphData.value.map((v: any) => v[1]),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      });
    } else {
      const subGroups: string[] = [...new Set<string>(graphData.value.map((v: any) => v[1]))];
      const keyData: any = {};
      for (const g of groups) {
        keyData[g] = {};
        for (const s of subGroups) {
          keyData[g][s] = 0;
        }
      }

      for (const r of graphData.value) {
        keyData[r[0]][r[1]] = r[2];
      }

      for (const s of subGroups) {
        const sg = { name: s, data: groups.map((g: any) => keyData[g][s]), type: selectedStyle.value, stack: "Total" };
        series.push(sg);
      }
    }

    graphOptions.value = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      xAxis: {
        type: "category",
        data: groups
      },
      yAxis: {
        type: "value"
      },
      series: series
    };
  }
}

async function pageTable(data: DataTablePageEvent) {
  resultData.value = await QueryService.getResultData(queueId.value.id, data.page + 1, data.rows);
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

.chart {
  height: 60vh;
}

.chart-options {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.chart-options * {
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  gap: 10px;
}
</style>
