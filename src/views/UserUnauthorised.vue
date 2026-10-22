<template>
  <div id="access-denied-container">
    <IMFontAwesomeIcon icon="fa-solid fa-ban" class="error-icon" size="10x" />
    <h1 class="error-code">Account Unauthorised</h1>
    <p class="error-text">
      <span>The current user account is not authorised for this application.</span> <br />
      <span>Please logout below and login with an authorised account.</span>
    </p>
    <div class="button-container">
      <Button label="Logout" :loading="clicked" :disabled="!hasSession || clicked" @click="logout()" icon="fa-solid fa-fw fa-arrow-right-from-bracket" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import { isObjectHasKeys } from "@endeavour/vue-library/helpers";

import { User } from "oidc-client-ts";
import { useRouter } from "vue-router";

import { AuthService, SecurityService } from "@/services";

interface Props {
  requiredAccess?: string;
  accessType?: string;
}

defineProps<Props>();
const router = useRouter();
const hasSession = ref(false);
const clicked = ref(false);

const validUser = ref(false);

onMounted(async () => {
  clicked.value = false;
  try {
    hasSession.value = await AuthService.getUser();
  } catch {
    hasSession.value = false;
  }
  try {
    const user = await SecurityService.getUser(true);
    validUser.value = isObjectHasKeys(user, ["id"]);
  } catch {
    validUser.value = false;
  }
  if (!hasSession.value || validUser.value) await router.push("/directory");
});

async function logout() {
  clicked.value = true;
  await AuthService.logout();
}
</script>

<style scoped>
#access-denied-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.error-icon {
  color: var(--p-red-500);
}

.error-code {
  color: var(--p-text-color);
  font-size: 3rem;
  margin: 1.5rem 0 0.5rem 0;
}

.error-header {
  color: var(--p-text-color);
  margin: 0.5rem;
}

.error-text {
  margin: 1rem;
  text-align: center;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 1rem;
}
</style>
