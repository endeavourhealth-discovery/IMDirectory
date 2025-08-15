<template>
  <div class="graphs-container">
    <div class="graphs-content">
      <p>Database graphs active for your account</p>
      <DataTable id="graphs-table" :value="userGraphs" :loading="loading">
        <template #empty> No graphs </template>
        <Column header="Graph" field="graph" />
      </DataTable>
      <Button label="Request graph" @click="handleRequestGraph" :loading="loadingGraphs" />
    </div>
  </div>
  <Dialog v-model:visible="showRequestGraphDialog" :modal="true" header="Request graph">
    <div v-if="!loadingGraphs" class="graph-request-dialog">
      <Select v-model="selectedGraph" :options="graphOptions" placeholder="Select a graph" checkmark />
    </div>
    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="showRequestGraphDialog = false" />
      <Button label="Request" @click="requestGraphSubmit" :disabled="!selectedGraph" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import WorkflowService from "@/services/WorkflowService";
import { Graph, GraphRequest, TaskState, TaskType } from "@/interfaces/AutoGen";
import ConfigService from "@/services/ConfigService";
import { UserService } from "@/services";

const confirm = useConfirm();

const loading = ref(false);
const loadingGraphs = ref(false);
const showRequestGraphDialog = ref(false);
const graphOptions: Ref<Graph[]> = ref([]);
const selectedGraph: Ref<Graph | undefined> = ref();
const userGraphs: Ref<{ graph: Graph }[]> = ref([]);

onMounted(async () => {
  loading.value = true;
  userGraphs.value = (await UserService.getUserGraphs()).map(graph => {
    return { graph: graph };
  });
  loading.value = false;
});

async function handleRequestGraph() {
  loadingGraphs.value = true;
  graphOptions.value = await ConfigService.getGraphs();
  showRequestGraphDialog.value = true;
  loadingGraphs.value = false;
}

async function requestGraphSubmit() {
  confirm.require({
    message: "Are you sure you want to request access to graph: " + selectedGraph.value,
    header: "Request graph access",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Confirm"
    },
    accept: async () => {
      await createGraphRequest();
    }
  });
}

async function createGraphRequest() {
  if (selectedGraph.value) {
    const graphRequest: GraphRequest = {
      graph: selectedGraph.value,
      type: TaskType.GRAPH_REQUEST,
      hostUrl: window.location.origin
    };
    await WorkflowService.createGraphRequest(graphRequest);
  }
}
</script>

<style scoped>
.roles-container {
  width: 32rem;
}

.roles-content {
  padding: 1rem;
}
</style>
