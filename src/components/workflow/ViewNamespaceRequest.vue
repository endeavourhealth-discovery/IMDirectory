<template>
  <div id="namespace-request-content">
    <h2>{{ props.id }}</h2>
    <Card class="namespace-request-card">
      <template #content>
        <div v-if="loading"><ProgressSpinner /></div>
        <div v-else class="namespace-request">
          <TaskViewer :id="id" :editMode="editMode" :submitRequested="submitRequested" @updateTask="updateTask" />
          <div class="field">
            <label for="namespace">Namespace being requested</label>
            <Select
              v-model="selectedNamespace"
              :options="namespaceOptions"
              :class="{ 'p-invalid': namespaceErrorMessage }"
              :disabled="!editMode"
              @blur="showErrorMessages.namespace = true"
            />
            <small v-if="showErrorMessages.namespace && namespaceErrorMessage" class="p-error">{{ namespaceErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="read">Read access</label>
            <Checkbox v-model="allowRead" binary />
          </div>
          <div class="field">
            <label for="read">Write access</label>
            <Checkbox v-model="allowWrite" binary />
          </div>
          <div class="flex gap-1">
            <Button v-if="canEdit && !editMode" label="Edit" @click="editMode = true" />
            <Button v-if="editMode" label="Cancel" @click="cancelEdit" severity="secondary" />
            <Button v-if="editMode" @click="updateGraphRequest" :loading="loading" label="Update" />
            <Button v-if="isAdmin || isAssignee" label="Reject" severity="danger" @click="rejectNamespaceRequest" />
            <Button v-if="isAdmin || isAssignee" label="Approve" @click="approveRequest" severity="success" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Namespace, NamespaceRequest, Task } from "@/interfaces/AutoGen";
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
const canEdit = computed(() => currentUser.value?.username === namespaceRequest.value?.createdBy);
const isAdmin = computed(() => userStore.isAdmin);
const isValidNamespaceRequest = computed(() => !namespaceErrorMessage.value);
const isAssignee = computed(() => namespaceRequest.value?.assignedTo === currentUser.value?.username);

const namespaceRequest: Ref<NamespaceRequest | undefined> = ref();
const editMode = ref(false);
const submitRequested = ref(false);
const loading = ref(true);
const showErrorMessages = ref({ namespace: false });

onMounted(async () => {
  loading.value = true;
  namespaceRequest.value = await WorkflowService.getNamespaceRequest(props.id);
  if (namespaceRequest.value) setValuesFromNamespaceRequest(namespaceRequest.value);
  await setOptions();
  loading.value = false;
});

const selectedNamespace: Ref<Namespace | undefined> = ref();
const namespaceErrorMessage = ref("");
const namespaceOptions: Ref<Namespace[]> = ref([]);
watch(selectedNamespace, newValue => {
  if (!newValue) namespaceErrorMessage.value = "Required field";
  else namespaceErrorMessage.value = "";
});

const allowRead = ref(false);
const allowWrite = ref(false);

async function setOptions() {
  namespaceOptions.value = await ConfigService.getNamespaces();
}

function setValuesFromNamespaceRequest(namespaceRequest: NamespaceRequest) {
  if (namespaceRequest.namespacePermission) selectedNamespace.value = namespaceRequest.namespacePermission.iri;
}

function updateGraphRequest() {
  submitRequested.value = true;
}

async function updateTask(task: Task) {
  if (isValidNamespaceRequest.value) {
    confirm.require({
      message: "Are you sure you want to update this namespace request?",
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
        const updatedNamespaceRequest: NamespaceRequest = {
          id: { iri: props.id },
          namespacePermission: { iri: selectedNamespace.value, read: allowRead.value, write: allowWrite.value },
          createdBy: task.createdBy,
          type: task.type,
          state: task.state,
          assignedTo: task.assignedTo,
          dateCreated: task.dateCreated,
          history: task.history
        };
        await WorkflowService.updateNamespaceRequest(updatedNamespaceRequest).then(async () => {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Namespace request successfully updated."
          });
        });

        editMode.value = false;
      }
    });
    submitRequested.value = false;
  }
}

function cancelEdit() {
  if (namespaceRequest.value) setValuesFromNamespaceRequest(namespaceRequest.value);
  editMode.value = false;
}

async function approveRequest() {
  if (namespaceRequest.value) await WorkflowService.approveNamespaceRequest(namespaceRequest.value);
}

async function rejectNamespaceRequest() {
  if (namespaceRequest.value) await WorkflowService.rejectNamespaceRequest(namespaceRequest.value);
}
</script>

<style scoped>
#namespace-request-content {
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

.namespace-request-card {
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
