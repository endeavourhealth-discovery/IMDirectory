<template>
  <div v-if="userDetails" id="user-details" class="flex flex-1 flex-col items-center">
    <Card class="w-full">
      <template #title>
        <h1>User details</h1>
      </template>
      <template #content>
        <div class="flex flex-col flex-nowrap items-center gap-3">
          <div class="flex w-80 flex-col">
            <strong>Username</strong><span>{{ userDetails.username }}</span>
          </div>
          <div class="flex w-80 flex-col">
            <strong>Email</strong><span>{{ userDetails.email }}</span>
          </div>
          <div class="flex w-80 flex-col">
            <strong>First name</strong><span>{{ userDetails.firstName }}</span>
          </div>
          <div class="flex w-80 flex-col">
            <strong>Last name</strong><span>{{ userDetails.lastName }}</span>
          </div>
          <div class="flex w-80 flex-col">
            <strong>Avatar</strong>
            <img class="w-20 self-center" data-testid="avatar-image" id="selected-avatar" :src="`/avatars/${userDetails.avatar}`" alt="avatar icon" />
            <span class="self-center">{{ userDetails.avatar }}</span>
          </div>
          <div class="flex w-80 flex-col">
            <strong>MFA Status</strong>
            <div>
              <span v-for="status in userDetails.mfaStatus">{{ status }}</span>
            </div>
          </div>
          <div class="flex w-80 flex-col gap-3">
            <strong>Role</strong>
            <DataTable :value="userDetails.roles">
              <Column>
                <template #body="{ data }">{{ data }}</template>
              </Column>
              <Column>
                <template #body="{ data }">
                  <Button label="Remove" severity="danger" @click="confirmDeleteRole(userDetails.username, data)" />
                </template>
              </Column>
            </DataTable>
            <Button label="Add role" @click="showAddRole = true" class="w-fit" />
          </div>
          <Button label="Reset password" severity="danger" @click="confirmResetPassword(userDetails.username)" />
          <Button label="Delete user" severity="danger" @click="confirmDeleteUser(userDetails.username)" />
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="showAddRole" header="Add role" :style="{ width: '25rem' }">
      <div class="flex flex-col items-center gap-3">
        <SelectButton v-model="mode" :options="modeOptions" />
        <Select v-if="mode === 'Existing'" v-model="selectedRole" :options="roleOptions" placeholder="select a role" checkmark />
        <InputText v-else v-model="selectedRole" />
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showAddRole = false" />
        <Button label="Add" @click="addRoleToUser" :disabled="!selectedRole" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import AdminService from "@/services/AdminService";
import { User } from "@/interfaces";
import { useConfirm } from "primevue/useconfirm";
import Swal from "sweetalert2";
import { onMounted, ref, Ref, watch } from "vue";
import { useRouter } from "vue-router";

interface Props {
  username: string;
}

const props = defineProps<Props>();

const router = useRouter();
const confirm = useConfirm();

const showAddRole = ref(false);
const userDetails: Ref<User | undefined> = ref();
const selectedRole: Ref<string> = ref("");
const roleOptions: Ref<string[]> = ref([]);
const mode: Ref<"Existing" | "New"> = ref("Existing");
const modeOptions: Ref<string[]> = ref(["Existing", "New"]);

watch(
  () => props.username,
  newValue => getUserDetails(newValue)
);

watch(mode, () => {
  selectedRole.value = "";
});

onMounted(async () => {
  if (props.username) await getUserDetails(props.username);
  else userDetails.value = undefined;
  roleOptions.value = await AdminService.getGroups();
});

async function getUserDetails(username: string) {
  userDetails.value = await AdminService.getUser(username);
}

async function addRoleToUser() {
  if (userDetails.value && selectedRole.value) {
    await AdminService.addRoleToUser(userDetails.value.username, selectedRole.value);
    await getUserDetails(userDetails.value.username);
    showAddRole.value = false;
  }
}

function confirmDeleteRole(username: string, role: string) {
  confirm.require({
    message: "Are you sure you want to remove this role?",
    header: "Remove role",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Remove",
      severity: "danger"
    },
    accept: async () => {
      await deleteRole(username, role);
      await getUserDetails(username);
    }
  });
}

async function deleteRole(username: string, role: string) {
  await AdminService.removeRoleFromUser(username, role);
}

function confirmResetPassword(username: string) {
  confirm.require({
    message: "Are you sure you want to reset this users password?",
    header: "Reset password",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Reset password",
      severity: "danger"
    },
    accept: async () => {
      await resetUserPassword(username);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password successfully reset"
      });
    }
  });
}

async function resetUserPassword(username: string) {
  await AdminService.resetUserPassword(username);
}

async function confirmDeleteUser(username: string) {
  confirm.require({
    message: "Are you sure you want to delete this user?",
    header: "Delete user",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Delete",
      severity: "danger"
    },
    accept: async () => {
      await deleteUser(username);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User successfully deleted"
      }).then(async () => {
        await router.push({ name: "CognitoListUsers" });
      });
    }
  });
}

async function deleteUser(username: string) {
  await AdminService.deleteUser(username);
}
</script>

<style scoped></style>
