<template>
  <div>Logging in...</div>
</template>

<script setup lang="ts">
import { Env } from "@/services";
import CasdoorService from "@/services/CasdoorService";
import { useUserStore } from "@/stores/userStore";
import { useCookies } from "@vueuse/integrations";
import axios from "axios";
import { useCasdoor } from "casdoor-vue-sdk";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { signin } = useCasdoor();
const userStore = useUserStore();
const cookies = useCookies(["locale"]);

interface Props {
  code: string;
}

const props = defineProps<Props>();

onMounted(async () => {
  console.log("here");
  const code = route.query.code;
  const state = route.query.state;
  if (code && state) {
    await CasdoorService.login(code as string, state as string);
    const user = cookies.get("casdoorUser");
    if (user) userStore.updateCurrentUser(user);
  }
  // await router.push({ name: "Directory" });
});
</script>

<style scoped></style>
