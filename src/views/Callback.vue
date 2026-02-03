<template>
  <div>Logging in...</div>
</template>

<script setup lang="ts">
import { User } from "@/interfaces";
import { Env } from "@/services";
import SecurityService from "@/services/SecurityService";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

interface Props {
  code: string;
  state: string;
}

const props = defineProps<Props>();

onMounted(async () => {
  const {user,state} = await SecurityService.login(props.code, props.state);
  if (user) userStore.updateCurrentUser(user);
  if (state) window.location.href = state
  else await router.push({ name: "Directory" });
});
</script>

<style scoped></style>
