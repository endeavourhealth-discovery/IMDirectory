<template>
  <div>Logging in...</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { useUserStore } from "vue-library/stores";

import { useRoute, useRouter } from "vue-router";

import SecurityService from "@/services/SecurityService";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

interface Props {
  code: string;
  state: string;
}

const props = defineProps<Props>();

onMounted(async () => {
  const { user, state } = await SecurityService.login(props.code, props.state);
  if (user) userStore.updateCurrentUser(user);
  if (state) window.location.href = state;
  else await router.push("/directory");
});
</script>

<style scoped></style>
