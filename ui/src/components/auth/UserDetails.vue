<template>
  <div class="flex flex-row">
    <div class="menu-container"><TieredMenu :model="menuItems" /></div>
    <Card class="flex flex-column justify-content-sm-around align-items-center user-details-card">
      <template #header>
        <h1>My account</h1>
        <img data-testid="user-details-avatar" id="selected-avatar" :src="getUrl(currentUser.avatar)" alt="avatar icon" />
      </template>
      <template #title> {{ menuItems[activeItem].label }} </template>
      <template #content>
        <div v-if="activeItem === 0" class="p-fluid flex flex-column justify-content-start user-details-form">
          <div class="field">
            <label for="username">Username</label>
            <InputText data-testid="user-details-username" id="username" type="text" :value="currentUser.username" disabled />
          </div>
          <div class="field">
            <label for="firstName">First name</label>
            <InputText data-testid="user-details-firstname" id="firstName" type="text" :value="currentUser.firstName" disabled />
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <InputText data-testid="user-details-lastname" id="lastName" type="text" :value="currentUser.lastName" disabled />
          </div>
          <div class="field">
            <label for="email">Email address</label>
            <InputText data-testid="user-details-email" id="email" type="text" :value="currentUser.email" disabled />
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="user-details-submit" class="user-edit" type="submit" label="Edit" @click="handleEditClicked" />
          </div>
        </div>
        <div v-if="activeItem === 1" class="security-container">
          <div class="security-content">
            <h3>Two-factor authentication</h3>
            <p>Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p>
            <DataView :value="twoFactorMethods" data-key="label">
              <template #header> Two-factor methods </template>
              <template #list="{ data }: any">
                <div class="col-12">
                  <div class="two-factor-row">
                    <div class="mfa-row-details">
                      <span>{{ data.label }}</span>
                      <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'warning'" rounded />
                    </div>
                    <Button v-if="data.status" label="Deactivate" @click="handleMfaDelete(data.key)" />
                    <Button v-else label="Activate" @click="handleMfaActivate(data.key)" />
                  </div>
                </div>
              </template>
            </DataView>
          </div>
        </div>
        <div v-if="activeItem === 2" class="roles-container">
          <div class="roles-content">
            <p>Authorisation roles active for your account</p>
            <DataTable
              :value="
                currentUser.roles.map((role:string) => {
                  return { role: role };
                })
              "
            >
              <Column field="role" header="Role" />
            </DataTable>
            <Button label="Request role" @click="handleEditRole" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { AuthService } from "@/services";

const router = useRouter();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const activeItem = ref(0);
const menuItems = ref([
  {
    label: "Personal details",
    icon: "fa-solid fa-user",
    class: "details-tab",
    command: () => {
      activeItem.value = 0;
    }
  },
  {
    label: "Security",
    icon: "fa-solid fa-user-lock",
    class: "security-tab",
    command: () => {
      activeItem.value = 1;
    }
  },
  {
    label: "Authorisation roles",
    icon: "fa-solid fa-shield-halved",
    class: "roles-tab",
    command: () => {
      activeItem.value = 2;
    }
  }
]);
const twoFactorMethods = ref([
  {
    label: "Authenticator app",
    details: "Use an authentication app or browser extension to get two-factor authentication codes when prompted.",
    icon: "fa-solid fa-mobile",
    status: getMfaStatus("SOFTWARE_TOKEN_MFA"),
    key: "SOFTWARE_TOKEN_MFA"
  }
]);

async function handleMfaActivate(key: string) {
  if (key === "SOFTWARE_TOKEN_MFA") {
    const result = await AuthService.getCurrentAuthenticatedUser();
    if (result.status === 200) {
      const qrcode = await AuthService.getMfaToken(result.userRaw);
      router.push({ name: "MFASetup", params: { QRCode: qrcode, user: result.userRaw } });
    }
  }
}

function handleMfaDelete(key: string) {
  if (key === "SOFTWARE_TOKEN_MFA") {
    router.push({ name: "" });
  }
}

function getMfaStatus(mfaKey: string): boolean {
  return isObjectHasKeys(currentUser.value, ["mfaStatus"]) && isArrayHasLength(currentUser.value.mfaStatus) && currentUser.value.mfaStatus.includes(mfaKey);
}

function handleEditClicked(): void {
  router.push({ name: "UserEdit" });
}

function getUrl(item: string): string {
  const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
  return url.href;
}

function handleEditRole() {
  router.push({ name: "" });
}
</script>

<style scoped>
.user-edit {
  width: fit-content !important;
}

.user-details-form {
  width: 32em;
}

.security-container {
  width: 32rem;
}

.roles-container {
  width: 32rem;
}

.roles-content {
  padding: 1rem;
}

.user-details-card {
  padding: 0 2em;
}

#selected-avatar {
  margin: 1.5rem;
  width: 10rem;
  border: 1px solid lightgray;
  border-radius: 50%;
}

.two-factor-row {
  display: flex;
  flex-flow: row nowrap;
  padding: 0.5rem;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.mfa-row-details {
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
}
</style>
