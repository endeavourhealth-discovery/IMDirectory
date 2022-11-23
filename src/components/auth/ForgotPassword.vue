<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center recovery-card">
      <template #header>
        <i class="fa-solid fa-user icon-header" aria-hidden="true"></i>
      </template>
      <template #title> Account Recovery: <br /><br />Password Reset </template>
      <template #content>
        <div class="p-fluid recovery-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="forgot-password-username-input" id="fieldUsername" type="text" v-model="username" />
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="forgot-password-user-submit" class="user-submit" type="submit" label="Request Reset Code" v-on:click.prevent="handleSubmit" />
          </div>
        </div>
      </template>
      <template #footer>
        <small>
          Already have a recovery code?
          <a id="password-submit-link" class="footer-link" @click="router.push({ name: 'ForgotPasswordSubmit' })">Submit Code</a>
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
import { ref } from "vue";
import { AuthService } from "@/im_library/services";
import { SweetAlertResult } from "sweetalert2";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

let username = ref("");

function handleSubmit(): void {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: "Reset password for account: " + username.value,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
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
            store.commit("updateRegisteredUsername", username.value);
            router.push({ name: "ForgotPasswordSubmit" });
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
}
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
}

.footer-link:hover {
  cursor: pointer;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}
</style>
