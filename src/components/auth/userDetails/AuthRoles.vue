<template>
  <div class="roles-container">
    <div class="roles-content">
      <p>Authorisation roles active for your account</p>
      <DataTable
        id="roles-table"
        v-if="currentUser"
        :value="
          currentUser.roles.map((role: string) => {
            return { role: role };
          })
        "
      >
        <template #empty> No roles </template>
        <Column field="role" header="Role" />
      </DataTable>
      <Button label="Request role" @click="handleRequestRole" :loading="loadingRoles" />
    </div>
  </div>
  <Dialog v-model:visible="showRequestRoleDialog" :modal="true" header="Request role">
    <div class="role-request-dialog">
      <Select v-model="selectedRole" :option="roleOptions" placeholder="Select a role" checkmark />
    </div>
    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="showRequestRoleDialog = false" />
      <Button label="Request" @click="requestRoleSubmit" :disabled="!selectedRole" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import AdminService from "@/services/AdminService";
import WorkflowService from "@/services/WorkflowService";
import { RoleRequest, TaskState, TaskType, UserRole } from "@/interfaces/AutoGen";

const userStore = useUserStore();
const confirm = useConfirm();

const currentUser = computed(() => userStore.currentUser);

const loadingRoles = ref(false);
const showRequestRoleDialog = ref(false);
const roleOptions: Ref<UserRole[]> = ref([]);
const selectedRole: Ref<UserRole | undefined> = ref();

async function handleRequestRole() {
  loadingRoles.value = true;
  roleOptions.value = await AdminService.getGroups();
  roleOptions.value = roleOptions.value.filter(ro => ro !== UserRole.ADMIN);
  showRequestRoleDialog.value = true;
  loadingRoles.value = false;
}

async function requestRoleSubmit() {
  confirm.require({
    message: "Are you sure you want to request role: " + selectedRole.value,
    header: "Request role",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Confirm"
    },
    accept: async () => {
      await createUpdateRoleRequest();
    }
  });
}

async function createUpdateRoleRequest() {
  if (selectedRole.value) {
    const roleRequest: RoleRequest = {
      role: selectedRole.value,
      type: TaskType.ROLE_REQUEST,
      hostUrl: window.location.origin
    };
    await WorkflowService.createRoleRequest(roleRequest);
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
