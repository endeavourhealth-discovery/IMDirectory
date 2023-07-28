<template>
  <div id="mfa-login">
    <Card class="flex flex-column justify-content-sm-around align-items-center mfa-login-card">
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
            <InputText id="mfa-code" v-model="code" v-on:keyup.enter="handleSubmitMFA" />
            <small id="mfa-code-help">Enter the code from your authenticator app</small>
            <small v-if="!isValidCode" class="invalid-text">Code should be a 6 digit number e.g. 123456</small>
          </div>
          <Button :disabled="!isValidCode" :loading="loading" label="Submit" @click="handleSubmitMFA" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, h, computed } from "vue";
import _ from "lodash";
import { useDialog } from "primevue/usedialog";
import Button from "primevue/button";
import MFAHelp from "@/components/shared/dynamicDialogs/MFAHelp.vue";
import Swal from "sweetalert2";
import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { Avatars } from "@im-library/constants";

const router = useRouter();
const helpDialog = useDialog();
const userStore = useUserStore();
const authStore = useAuthStore();

const isValidCode = computed(() => /[0-9]{6}/.test(code.value));
const authReturnUrl = computed(() => authStore.authReturnUrl);
const awsUser = computed(() => userStore.awsUser);

const code = ref("");
const loading = ref(false);

onMounted(() => {
  if (!awsUser.value) router.push({ name: "Login" });
});

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
        return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
      }
    }
  });
}

async function handleSubmitMFA() {
  if (isValidCode.value) {
    loading.value = true;
    await AuthService.mfaSignIn(awsUser.value, code.value)
      .then(async res => {
        if (res.status === 200 && res.user) {
          const loggedInUser = res.user;
          // check if avatar exists and replace lagacy images with default avatar on signin
          const result = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
          if (!result) {
            loggedInUser.avatar = Avatars[0];
          }
          userStore.updateCurrentUser(loggedInUser);
          userStore.updateAwsUser(res.userRaw);
          await userStore.getAllFromUserDatabase();
          authStore.updateRegisteredUsername("");
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Login successful"
          }).then(() => {
            userStore.clearOptionalCookies();
            if (authReturnUrl.value) {
              window.location.href = authReturnUrl.value;
            } else {
              router.push({ name: "LandingPage" });
            }
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
  color: var(--red-500);
}
</style>
