<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center login-card">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-users" class="icon-header" />
      </template>
      <template #title> Login </template>
      <template #content>
        <div class="p-fluid login-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="login-username" id="fieldUsername" type="text" v-model="username" :placeholder="username" />
          </div>
          <div class="field">
            <label for="fieldPassword">Password</label>
            <InputText data-testid="login-password" id="fieldPassword" type="password" v-model="password" @keyup="checkKey" />
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="login-submit" class="user-submit" type="submit" label="Login" @click="handleSubmit" :loading="loading" />
          </div>
        </div>
      </template>
      <template #footer>
        <small>Don't have an account yet? <a id="register-link" class="footer-link" @click="router.push({ name: 'Register' })">Register here</a></small>
        <br />
        <br />
        <small>Already received a confirmation code? <a id="code-link" class="footer-link" @click="router.push({ name: 'ConfirmCode' })">Add it here</a></small>
        <br />
        <br />
        <small>
          Forgot your password or username? <br /><a id="recover-link" class="footer-link" @click="router.push({ name: 'ForgotPassword' })"> Recover account</a>
        </small>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { AuthService } from "@/services";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { Avatars } from "@im-library/constants";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { CustomAlert } from "@im-library/interfaces";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const registeredUsername = computed(() => authStore.registeredUsername);
const authReturnPath = computed(() => authStore.authReturnPath);

const username = ref("");
const password = ref("");
const loading = ref(false);

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

async function handle200(res: CustomAlert) {
  const loggedInUser = res.user;
  if (loggedInUser) {
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
      text: "Login successful",
      footer: `<p style="color: var(--red-500)">Increase your account security with 2-factor authentication. Visit your account details page security tab to enable this feature.</p>`
    }).then(() => {
      userStore.clearOptionalCookies();
      if (authReturnPath.value) {
        router.push({ path: authReturnPath.value });
      } else {
        router.push({ name: "LandingPage" });
      }
    });
  }
}

function handle401(res: CustomAlert) {
  Swal.fire({
    icon: "warning",
    title: "User Unconfirmed",
    text: "Account has not been confirmed. Please confirm account to continue.",
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: "Confirm Account"
  }).then((result: SweetAlertResult) => {
    if (result.isConfirmed) {
      if (res.user) {
        const loggedInUser = res.user;
        const result = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
        if (!result) {
          loggedInUser.avatar = Avatars[0];
        }
        userStore.updateCurrentUser(loggedInUser);
        userStore.updateAwsUser(res.userRaw);
      }
      authStore.updateRegisteredUsername(username.value);
      router.push({ name: "ConfirmCode" });
    }
  });
}

function handle403(res: CustomAlert) {
  if (res.message === "NEW_PASSWORD_REQUIRED") {
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
  } else if (res.message === "MFA_SETUP") {
    userStore.updateAwsUser(res.userRaw);
    Swal.fire({
      icon: "info",
      title: "Redirecting to 2-factor authentication setup...",
      text: "A request for 2-factor authentication was made. We will redirect you to the 2-factor authentication setup page shortly.",
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      showCloseButton: true
    }).then(() => {
      router.push({ name: "MFASetup" });
    });
  } else if (res.message === "SOFTWARE_TOKEN_MFA") {
    userStore.updateAwsUser(res.userRaw);
    router.push({ name: "MFALogin" });
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

async function handleSubmit(): Promise<void> {
  loading.value = true;
  await AuthService.signIn(username.value, password.value)
    .then(async res => {
      if (res.status === 200) {
        await handle200(res);
      } else if (res.status === 401) {
        handle401(res);
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

function checkKey(event: any): void {
  if (event.keyCode === 13) {
    handleSubmit();
  }
}
</script>

<style scoped>
.login-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.login-form {
  max-width: 25em;
}

.footer-link:hover {
  cursor: pointer;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}
</style>
