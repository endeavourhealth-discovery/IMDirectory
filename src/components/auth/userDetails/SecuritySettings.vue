<template>
  <div class="security-container">
    <div class="security-content">
      <h3>Two-factor authentication</h3>
      <p>Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p>
      <DataView :value="twoFactorMethods" data-key="label">
        <template #header> Two-factor methods </template>
        <template #list="slotProps">
          <div v-for="(item, index) in slotProps.items" class="col-span-12" v-bind:key="index">
            <div class="two-factor-row">
              <div class="mfa-row-details">
                <span>{{ item.label }}</span>
                <Tag :value="item.status ? 'Active' : 'Inactive'" :severity="item.status ? 'success' : 'warning'" rounded />
              </div>
              <Button v-if="item.status" severity="danger" label="Deactivate" @click="handleMfaDelete(item.key)" />
              <Button v-else label="Activate" @click="handleMfaActivate(item.key)" />
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
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);

const twoFactorMethods = ref([
  {
    label: "Authenticator app",
    details: "Use an authentication app or browser extension to get two-factor authentication codes when prompted.",
    icon: "fa-solid fa-mobile",
    status: getMfaStatus("TOTP"),
    key: "TOTP"
  }
]);

function handleMfaActivate(key: string) {
  if (key === "TOTP") {
    router.push({ name: "MFASetup" });
  }
}

function handleMfaDelete(key: string) {
  if (key === "TOTP") {
    router.push({ name: "MFADelete" });
  }
}

function getMfaStatus(mfaKey: string): boolean {
  return (
    typeof currentUser.value !== "undefined" &&
    isObjectHasKeys(currentUser.value, ["mfaStatus"]) &&
    isArrayHasLength(currentUser.value.mfaStatus) &&
    currentUser.value.mfaStatus.includes(mfaKey)
  );
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
