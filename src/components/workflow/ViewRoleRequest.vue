<template>
  <div id="role-request-content">
    <h2>{{ props.id }}</h2>
    <Card class="role-request-card">
      <template #content>
        <div v-if="loading"><ProgressSpinner /></div>
        <div v-else class="role-request">
          <TaskViewer :id="id" :editMode="editMode" :submitRequested="submitRequested" @updateTask="updateTask" />
          <div class="field">
            <label for="role">Role being requested</label>
            <Select
              v-model="selectedRole"
              :options="roleOptions"
              :class="{ 'p-invalid': roleErrorMessage }"
              :disabled="!editMode"
              @blur="showErrorMessages.role = true"
            />
            <small v-if="showErrorMessages.role && roleErrorMessage" class="p-error">{{ roleErrorMessage }}</small>
          </div>
          <div class="flex gap-1">
            <Button v-if="canEdit && !editMode" label="Edit" @click="editMode = true" />
            <Button v-if="editMode" label="Cancel" @click="cancelEdit" severity="secondary" />
            <Button v-if="editMode" @click="updateRoleRequest" :loading="loading" label="Update" />
            <Button v-if="isAdmin || isAssignee" label="Reject" severity="danger" @click="rejectRoleRequest" />
            <Button v-if="isAdmin || isAssignee" label="Approve" @click="approveRequest" severity="success" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { enumToArray } from "@/helpers/Converters";
import { RoleRequest, Task, UserRole } from "@/interfaces/AutoGen";
import AdminService from "@/services/AdminService";
import WorkflowService from "@/services/WorkflowService";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import Swal from "sweetalert2";
import { computed, onMounted, ref, Ref, watch } from "vue";
import TaskViewer from "./TaskViewer.vue";

interface Props {
  id: string;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const confirm = useConfirm();

const currentUser = computed(() => userStore.currentUser);
const canEdit = computed(() => currentUser.value?.username === roleRequest.value?.createdBy);
const isAdmin = computed(() => userStore.isAdmin);
const isValidRoleRequest = computed(() => !roleErrorMessage.value);
const isAssignee = computed(() => roleRequest.value?.assignedTo === currentUser.value?.username);

const roleRequest: Ref<RoleRequest | undefined> = ref();
const editMode = ref(false);
const submitRequested = ref(false);
const loading = ref(true);
const showErrorMessages = ref({ role: false });

onMounted(async () => {
  loading.value = true;
  roleRequest.value = await WorkflowService.getRoleRequest(props.id);
  if (roleRequest.value) setValuesFromRoleRequest(roleRequest.value);
  await setOptions();
  loading.value = false;
});

const selectedRole: Ref<UserRole | undefined> = ref();
const roleErrorMessage = ref("");
const roleOptions: Ref<UserRole[]> = ref([]);
watch(selectedRole, newValue => {
  if (!newValue) roleErrorMessage.value = "Required field";
  else roleErrorMessage.value = "";
});

async function setOptions() {
  roleOptions.value = (await AdminService.getGroups()) as UserRole[];
}

function setValuesFromRoleRequest(roleRequest: RoleRequest) {
  if (roleRequest.role) selectedRole.value = roleRequest.role;
}

function updateRoleRequest() {
  submitRequested.value = true;
}

async function updateTask(task: Task) {
  if (isValidRoleRequest.value) {
    confirm.require({
      message: "Are you sure you want to update this role request?",
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
        const updatedRoleRequest: RoleRequest = {
          id: { iri: props.id },
          role: selectedRole.value,
          createdBy: task.createdBy,
          type: task.type,
          state: task.state,
          assignedTo: task.assignedTo,
          dateCreated: task.dateCreated,
          history: task.history
        };
        await WorkflowService.updateRoleRequest(updatedRoleRequest).then(async () => {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Role request successfully updated."
          });
        });

        editMode.value = false;
      }
    });
    submitRequested.value = false;
  }
}

function cancelEdit() {
  if (roleRequest.value) setValuesFromRoleRequest(roleRequest.value);
  editMode.value = false;
}

async function approveRequest() {
  if (roleRequest.value) await WorkflowService.approveRoleRequest(roleRequest.value);
}

async function rejectRoleRequest() {
  if (roleRequest.value) await WorkflowService.rejectRoleRequest(roleRequest.value);
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
