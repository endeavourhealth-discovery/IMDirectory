<template>
  <div id="mfa-delete">
    <Card class="justify-content-sm-around mfa-delete-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-shield-slash" class="icon-header" />
      </template>
      <template #title>Disable 2-factor authentication</template>
      <template #content>
        <div class="mfa-delete-content">
          <p>Disabling 2-factor authentication will reduce your account security</p>
          <div class="buttons-container">
            <Button icon="fa-solid fa-circle-question" rounded severity="secondary" v-tooltip="'Need some help?'" @click="showHelpDialog" />
          </div>
          <p>Are you sure you want to continue disabling this security feature?</p>
          <div class="buttons-container">
            <Button label="Cancel" severity="secondary" @click="handleCancel" />
            <Button severity="danger" :loading="loading" label="Disable" @click="handleDisableMfa" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { useDialog } from "primevue/usedialog";
import Button from "primevue/button";
import MFAHelp from "@/components/shared/dynamicDialogs/MFAHelp.vue";
import Swal from "sweetalert2";
import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

const router = useRouter();
const helpDialog = useDialog();
const userStore = useUserStore();

const loading = ref(false);

function showHelpDialog() {
  const dialogProps = {
    style: { width: "80vw,height:80vh" },
    closable: true,
    maximizable: true,
    modal: true,
    contentStyle: { flex: "1 1 auto", display: "flex" },
    dismissableMask: true,
    autoZIndex: false
  };
  const dialogRef = helpDialog.open(MFAHelp, {
    props: dialogProps,
    templates: {
      footer: () => {
        return [h(Button, { label: "Close", icon: "fa-solid fa-xmark", onClick: () => dialogRef.close() })];
      }
    }
  });
}

async function handleDisableMfa() {
  loading.value = true;
  await AuthService.setMfaPreference("NOMFA");
  Swal.fire({
    icon: "success",
    title: "Success",
    text: "2-factor authentication successfully disabled"
  }).then(() => {
    router.push({ name: "UserDetails" });
  });
  loading.value = false;
}

function handleCancel() {
  router.push({ name: "UserDetails" });
}
</script>

<style scoped>
#mfa-delete {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
}
.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}

.mfa-delete-card {
  padding: 0 2em;
}

.mfa-delete-content {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 30rem;
}

.code-input {
  display: flex;
  flex-flow: column nowrap;
}

.invalid-text {
  color: var(--p-red-500);
}

.buttons-container {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.5rem;
}
</style>
