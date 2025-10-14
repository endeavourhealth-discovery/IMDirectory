<template>
  <div id="graph-request-content">
    <h2>{{ props.id }}</h2>
    <Card class="graph-request-card">
      <template #content>
        <div v-if="loading"><ProgressSpinner /></div>
        <div v-else class="graph-request">
          <TaskViewer :id="id" :editMode="editMode" :submitRequested="submitRequested" @updateTask="updateTask" />
          <div class="field">
            <label for="graph">Graph being requested</label>
            <Select
              v-model="selectedGraph"
              :options="graphOptions"
              :class="{ 'p-invalid': graphErrorMessage }"
              :disabled="!editMode"
              @blur="showErrorMessages.graph = true"
            />
            <small v-if="showErrorMessages.graph && graphErrorMessage" class="p-error">{{ graphErrorMessage }}</small>
          </div>
          <div class="flex gap-1">
            <Button v-if="canEdit && !editMode" label="Edit" @click="editMode = true" />
            <Button v-if="editMode" label="Cancel" @click="cancelEdit" severity="secondary" />
            <Button v-if="editMode" @click="updateGraphRequest" :loading="loading" label="Update" />
            <Button v-if="isAdmin || isAssignee" label="Reject" severity="danger" @click="rejectGraphRequest" />
            <Button v-if="isAdmin || isAssignee" label="Approve" @click="approveRequest" severity="success" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Graph, GraphRequest, Task } from "@/interfaces/AutoGen";
import WorkflowService from "@/services/WorkflowService";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import Swal from "sweetalert2";
import { computed, onMounted, ref, Ref, watch } from "vue";
import TaskViewer from "./TaskViewer.vue";
import ConfigService from "@/services/ConfigService";

interface Props {
  id: string;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const confirm = useConfirm();

const currentUser = computed(() => userStore.currentUser);
const canEdit = computed(() => currentUser.value?.username === graphRequest.value?.createdBy);
const isAdmin = computed(() => userStore.isAdmin);
const isValidGraphRequest = computed(() => !graphErrorMessage.value);
const isAssignee = computed(() => graphRequest.value?.assignedTo === currentUser.value?.username);

const graphRequest: Ref<GraphRequest | undefined> = ref();
const editMode = ref(false);
const submitRequested = ref(false);
const loading = ref(true);
const showErrorMessages = ref({ graph: false });

onMounted(async () => {
  loading.value = true;
  graphRequest.value = await WorkflowService.getGraphRequest(props.id);
  if (graphRequest.value) setValuesFromGraphRequest(graphRequest.value);
  await setOptions();
  loading.value = false;
});

const selectedGraph: Ref<Graph | undefined> = ref();
const graphErrorMessage = ref("");
const graphOptions: Ref<Graph[]> = ref([]);
watch(selectedGraph, newValue => {
  if (!newValue) graphErrorMessage.value = "Required field";
  else graphErrorMessage.value = "";
});

async function setOptions() {
  graphOptions.value = await ConfigService.getGraphs();
}

function setValuesFromGraphRequest(graphRequest: GraphRequest) {
  if (graphRequest.graph) selectedGraph.value = graphRequest.graph;
}

function updateGraphRequest() {
  submitRequested.value = true;
}

async function updateTask(task: Task) {
  if (isValidGraphRequest.value) {
    confirm.require({
      message: "Are you sure you want to update this graph request?",
      header: "Confirm update",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true
      },
      acceptProps: {
        label: "Update"
      },
      accept: async () => {
        const updatedGraphRequest: GraphRequest = {
          id: { iri: props.id },
          graph: selectedGraph.value,
          createdBy: task.createdBy,
          type: task.type,
          state: task.state,
          assignedTo: task.assignedTo,
          dateCreated: task.dateCreated,
          history: task.history
        };
        await WorkflowService.updateRoleRequest(updatedGraphRequest).then(async () => {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Graph request successfully updated."
          });
        });

        editMode.value = false;
      }
    });
    submitRequested.value = false;
  }
}

function cancelEdit() {
  if (graphRequest.value) setValuesFromGraphRequest(graphRequest.value);
  editMode.value = false;
}

async function approveRequest() {
  if (graphRequest.value) await WorkflowService.approveGraphRequest(graphRequest.value);
}

async function rejectGraphRequest() {
  if (graphRequest.value) await WorkflowService.rejectGraphRequest(graphRequest.value);
}
</script>

<style scoped>
#role-request-content {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 1rem;
}

.topbar-content {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.role-request-card {
  width: 80%;
  overflow: auto;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.text-area {
  height: 5rem;
}
.title {
  font-size: 2rem;
}

.other-container {
  display: flex;
  flex-flow: column nowrap;
  margin-left: 2rem;
  padding-top: 0.25rem;
}

.error-indented {
  margin-left: 2rem;
}
</style>
