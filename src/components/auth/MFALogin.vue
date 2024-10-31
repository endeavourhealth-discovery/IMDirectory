<template>
  <div id="mfa-login">
    <Card class="justify-content-sm-around mfa-login-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-shield-halved" class="icon-header" />
      </template>
      <template #title>2-factor authentication</template>
      <template #content>
        <div class="mfa-login-content">
          <p>Enter the code from your authenticator app to continue.</p>
          <Button icon="fa-solid fa-circle-question" rounded severity="secondary" v-tooltip="'Need some help?'" @click="showHelpDialog" />
          <div class="code-input">
            <label for="mfa-code">Code</label>
            <InputText id="mfa-code" v-model="code" v-on:keyup.enter="handleSubmitMFA" autofocus />
            <small id="mfa-code-help">Enter the code from your authenticator app</small>
            <small v-if="!isValidCode" class="invalid-text">Code should be a 6 digit number e.g. 123456</small>
          </div>
          <Button :disabled="!isValidCode" :loading="loading" label="Submit" @click="handleSubmitMFA" class="submit-button" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from "vue";
import { useDialog } from "primevue/usedialog";
import Button from "primevue/button";
import MFAHelp from "@/components/shared/dynamicDialogs/MFAHelp.vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { CustomAlert } from "@/interfaces";

const router = useRouter();
const helpDialog = useDialog();
const userStore = useUserStore();
const authStore = useAuthStore();

const isValidCode = computed(() => /\d{6}/.test(code.value));
const authReturnPath = computed(() => authStore.authReturnPath);
const currentUser = computed(() => userStore.currentUser);

const code = ref("");
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

async function handle200(res: CustomAlert) {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: "Login successful"
  }).then(() => {
    userStore.clearOptionalCookies();
    if (authReturnPath.value) {
      router.push({ path: authReturnPath.value });
    } else {
      router.push({ name: "LandingPage" });
    }
  });
}

function handle403(res: CustomAlert) {
  if (res.nextStep === "CONFIRM_SIGN_UP") {
    Swal.fire({
      icon: "warning",
      title: "User Unconfirmed",
      text: "Account has not been confirmed. Please confirm account to continue.",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Confirm Account"
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        router.push({ name: "ConfirmCode" });
      }
    });
  }
  if (res.nextStep === "RESET_PASSWORD" || res.nextStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD") {
    Swal.fire({
      icon: "warning",
      title: "New password required",
      text: "Account requires a password change. Your account may be using a temporary password, your password may have expired, or admins may have requested a password reset for security reasons.",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: "Reset password"
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        router.push({ name: "ForgotPassword" });
      }
    });
  } else if (res.message) {
    console.error(res.error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: res.message,
      confirmButtonText: "Close"
    });
  } else {
    console.error(res.error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Authentication error",
      confirmButtonText: "Close"
    });
  }
}

async function handleSubmitMFA() {
  if (isValidCode.value) {
    loading.value = true;
    await AuthService.mfaSignIn(code.value)
      .then(async res => {
        if (res.status === 200) {
          await handle200(res);
        } else if (res.status === 403) {
          handle403(res);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message,
            confirmButtonText: "Close"
          });
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Authentication error",
          confirmButtonText: "Close"
        });
      });
    loading.value = false;
  }
}
</script>

<style scoped>
#mfa-login {
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

.mfa-login-card {
  padding: 0 2em;
}

.mfa-login-content {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  max-width: 30rem;
}

.code-input {
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;
}

.invalid-text {
  color: var(--p-red-500);
}

.submit-button {
  margin-top: 0.5rem;
}
</style>
