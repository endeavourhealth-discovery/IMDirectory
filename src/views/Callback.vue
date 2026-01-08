<template>
  <div>Logging in...</div>
</template>

<script setup lang="ts">
import { User } from "@/interfaces";
import { Env } from "@/services";
import CasdoorService from "@/services/CasdoorService";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import { useCasdoor } from "casdoor-vue-sdk";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { signin } = useCasdoor();
const userStore = useUserStore();

interface Props {
  code: string;
  state: string;
}

const props = defineProps<Props>();

onMounted(async () => {
  await CasdoorService.login(props.code, props.state);
  const user: User = await CasdoorService.getUser();
  if (user) userStore.updateCurrentUser(user);
  await router.push({ name: "Directory" });
});
</script>

<style scoped></style>
