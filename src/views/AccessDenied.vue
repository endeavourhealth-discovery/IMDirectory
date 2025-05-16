<template>
  <div id="access-denied-container">
    <IMFontAwesomeIcon icon="fa-solid fa-ban" class="error-icon" size="10x" />
    <h1 class="error-code">403</h1>
    <h2 class="error-header">Access Denied / Forbidden</h2>
    <p class="error-text">
      <span>The page or resource you were trying to reach is forbidden.</span> <br />
      <span v-if="requiredAccess"
        >Missing <span v-if="accessType">{{ accessType }}</span> <Tag :value="requiredAccess" severity="warn" :rounded="true" /> permissions required to access
        this resource.</span
      >
      <br />
      <span>Please contact an admin to request access to this resource.</span>
    </p>
    <div class="button-container">
      <Button label="Back" @click="goBack" icon="fa-solid fa-arrow-left" />
      <Button label="Home" @click="goHome" icon="fa-solid fa-home" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
interface Props {
  requiredAccess?: string;
  accessType?: string;
}

defineProps<Props>();
const router = useRouter();

function goBack() {
  router.go(-2);
}

function goHome() {
  router.push({ name: "Directory" });
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
  font-size: 6rem;
  margin: 1.5rem 0 0.5rem 0;
}

.error-header {
  color: var(--p-text-color);
  margin: 0.5rem;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
}
</style>
