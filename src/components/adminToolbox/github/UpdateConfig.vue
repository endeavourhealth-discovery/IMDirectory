<template>
  <div class="flex flex-1 items-center justify-center gap-2">
    <Button label="Update github config" @click="updateGithubConfig" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { AlertDialog } from "@endeavour/vue-library/components";
import { REPO } from "@endeavour/vue-library/enums";
import { useDialogStore } from "@endeavour/vue-library/stores";

import { GithubService } from "@/services";

const dialogStore = useDialogStore();
const loading = ref(false);

async function updateGithubConfig() {
  loading.value = true;
  await GithubService.updateGithubConfig(REPO.IM_DIRECTORY)
    .then(async () => {
      await dialogStore.open(AlertDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-check",
          title: "Success",
          text: "Github config successfully updated",
          confirmButtonText: "Close"
        }
      });
    })
    .catch(async err => {
      console.error(err);
      await dialogStore.open(AlertDialog, {
        props: { modal: true, style: { width: "30vw" } },
        data: {
          icon: "fa-regular fa-circle-xmark",
          title: "Error",
          text: "Failed to update github config. Check the console to see the error."
        }
      });
    });
  loading.value = false;
}
</script>

<style scoped></style>
