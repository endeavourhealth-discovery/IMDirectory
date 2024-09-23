<template>
  <div class="flex flex-row items-center">
    <Card class="justify-content-sm-around recovery-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-user" class="icon-header" />
      </template>
      <template #title> Account Recovery: <br /><br />Password Reset </template>
      <template #content>
        <form class="recovery-form" @submit="onSubmit">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="forgot-password-username-input" id="fieldUsername" type="text" v-model="username" />
            <Message v-if="errors.username" severity="error">{{ errors.username }}</Message>
          </div>
          <div class="flex flex-row justify-center">
            <Button data-testid="forgot-password-user-submit" class="user-submit" label="Request Reset Code" v-on:click.prevent="onSubmit" />
          </div>
        </form>
      </template>
      <template #footer>
        <small>
          Already have a recovery code?
          <Button link as="a" id="password-submit-link" class="footer-link p-0 text-xs" @click="router.push({ name: 'ForgotPasswordSubmit' })"
            >Submit Code</Button
          >
        </small>
        <br />
        <br />
        <small>
          If you have forgotten your username,<br />
          please contact an admin
        </small>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AuthService } from "@/services";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import * as yup from "yup";
import { useForm } from "vee-validate";

const router = useRouter();
const authStore = useAuthStore();

const schema = yup.object({
  username: yup.string().required("Username is required")
});

const { errors, defineField, handleSubmit } = useForm({ validationSchema: schema });

const [username, usernameAttrs] = defineField("username");

const onSubmit = handleSubmit(async () => {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: "Reset password for account: " + username.value,
    showCancelButton: true,
    confirmButtonColor: "var(--p-primary-color)",
    confirmButtonText: "Reset Password"
  }).then((result: SweetAlertResult) => {
    if (result.isConfirmed) {
      AuthService.forgotPassword(username.value).then(res => {
        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Password has been reset for account: " + username.value + ". An email has been sent with a recovery code."
          }).then(() => {
            authStore.updateRegisteredUsername(username.value);
            if (res.nextStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") router.push({ name: "ForgotPasswordSubmit" });
            else router.push({ name: "Login" });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message + ". Check username is correct."
          });
        }
      });
    }
  });
});
</script>

<style scoped>
.recovery-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.recovery-form {
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
</style>
