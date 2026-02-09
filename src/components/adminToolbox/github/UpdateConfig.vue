<template>
  <div class="flex flex-1 items-center justify-center gap-2">
    <Button label="Update github config" @click="updateGithubConfig" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { GithubService } from "@/services";
import Swal from "sweetalert2";
import { ref } from "vue";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";
import { useDialogStore } from "@/stores/dialogStore";

const dialogStore = useDialogStore();
const loading = ref(false);

async function updateGithubConfig() {
  loading.value = true;
  await GithubService.updateGithubConfig()
    .then(async () => {
      await dialogStore.open(GenericDialog, {
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
      await dialogStore.open(GenericDialog, {
        props: { modal: true, style: { width: "30vw" } },
        data: {
          icon: "error",
          title: "Error",
          text: "Failed to update github config. Check the console to see the error."
        }
      });
    });
  loading.value = false;
}
</script>

<style scoped></style>
