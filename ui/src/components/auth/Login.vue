<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center login-card">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-users" class="icon-header" />
      </template>
      <template #title> Login </template>
      <template #content>
        <form class="login-form" @submit="onSubmit">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="login-username" id="fieldUsername" type="text" v-model="username" :placeholder="username" />
            <Message v-if="errors.username" severity="error">{{ errors.username }}</Message>
          </div>
          <div class="field">
            <label for="fieldPassword">Password</label>
            <Password
              v-model="password"
              :feedback="false"
              toggleMask
              id="fieldPassword"
              :pt="{
                'pc-input': { root: { 'data-testid': 'login-password' } }
              }"
            />
            <Message v-if="errors.password" severity="error">{{ errors.password }}</Message>
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="login-submit" class="user-submit" type="submit" label="Login" @click="onSubmit" :loading="loading" />
          </div>
        </form>
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
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { CustomAlert } from "@im-library/interfaces";
import Password from "primevue/password";
import _ from "lodash-es";
import * as yup from "yup";
import { useForm } from "vee-validate";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const registeredUsername = computed(() => authStore.registeredUsername);
const authReturnPath = computed(() => authStore.authReturnPath);

const loading = ref(false);

const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required")
});

const { errors, defineField, handleSubmit } = useForm({ validationSchema: schema });

const [username] = defineField("username");
const [password] = defineField("password");

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

async function handle200(res: CustomAlert) {
  authStore.updateRegisteredUsername("");
  Swal.fire({
    icon: "success",
    title: "Success",
    text: "Login successful",
    footer: `<p style="color: var(--p-red-500)">Increase your account security with 2-factor authentication. Visit your account details page security tab to enable this feature.</p>`
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
        authStore.updateRegisteredUsername(username.value);
        router.push({ name: "ConfirmCode" });
      }
    });
  } else if (res.message === "NEW_PASSWORD_REQUIRED" || res.nextStep === "RESET_PASSWORD" || res.nextStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
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
  } else if (res.nextStep === "CONTINUE_SIGN_IN_WITH_TOTP_SETUP") {
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
  } else if (res.nextStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
    router.push({ name: "MFALogin" });
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

const onSubmit = async function handleSubmit(): Promise<void> {
  loading.value = true;
  await AuthService.signIn(username.value, password.value)
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
};
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
  display: flex;
  flex-flow: column nowrap;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.footer-link:hover {
  cursor: pointer;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}

.text-with-button {
  display: flex;
  flex-flow: row nowrap;
}
</style>
