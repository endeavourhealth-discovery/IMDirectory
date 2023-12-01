<template>
  <div class="security-container">
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
              <Button v-if="data.status" severity="danger" label="Deactivate" @click="handleMfaDelete(data.key)" />
              <Button v-else label="Activate" @click="handleMfaActivate(data.key)" />
            </div>
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);

const twoFactorMethods = ref([
  {
    label: "Authenticator app",
    details: "Use an authentication app or browser extension to get two-factor authentication codes when prompted.",
    icon: "fa-solid fa-mobile",
    status: getMfaStatus("SOFTWARE_TOKEN_MFA"),
    key: "SOFTWARE_TOKEN_MFA"
  }
]);

function handleMfaActivate(key: string) {
  if (key === "SOFTWARE_TOKEN_MFA") {
    router.push({ name: "MFASetup" });
  }
}

function handleMfaDelete(key: string) {
  if (key === "SOFTWARE_TOKEN_MFA") {
    router.push({ name: "MFADelete" });
  }
}

function getMfaStatus(mfaKey: string): boolean {
  return isObjectHasKeys(currentUser.value, ["mfaStatus"]) && isArrayHasLength(currentUser.value.mfaStatus) && currentUser.value.mfaStatus.includes(mfaKey);
}
</script>

<style scoped>
.security-container {
  width: 32rem;
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
