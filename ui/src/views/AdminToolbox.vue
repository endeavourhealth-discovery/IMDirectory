<template>
  <div id="admin-toolbox" class="flex h-full w-full flex-col overflow-auto">
    <TopBar>
      <template #content>
        <div class="flex h-full w-full flex-row flex-nowrap items-center">
          <span class="title"><strong>Admin toolbox</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="toolbox-container" class="flex flex-1 flex-row items-center justify-center">
      <Button label="Update github config" @click="updateGithubConfig" :loading="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GithubService } from "@/services";
import TopBar from "@/components/shared/TopBar.vue";
import { ref } from "vue";
import Swal from "sweetalert2";

const loading = ref(false);

async function updateGithubConfig() {
  loading.value = true;
  await GithubService.updateGithubConfig();
  Swal.fire({
    icon: "success",
    title: "Success",
    text: "Github config successfully updated",
    confirmButtonText: "Close"
  });
  loading.value = false;
}
</script>

<style scoped></style>
