<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center confirm-card">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-key" class="icon-header" />
      </template>
      <template #title> Confirmation Code </template>
      <template #content>
        <div class="p-fluid code-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="confirm-code-username-input" id="fieldUsername" type="text" v-model="username" :placeholder="username" />
          </div>
          <div class="field">
            <label for="fieldCode">Confirmation code</label>
            <div class="flex flex-row align-items-center">
              <InputText data-testid="confirm-code-input" id="fieldCode" type="password" v-model="code" />
              <IMFontAwesomeIcon v-if="codeVerified" icon="fa-regular fa-circle-check" class="password-check" />
              <IMFontAwesomeIcon v-if="!codeVerified && code" icon="fa-regular fa-circle-xmark" class="password-times" />
            </div>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="confirm-code-submit-button" class="user-submit" type="submit" label="Submit" @click="handleSubmit" />
          </div>
        </div>
      </template>
      <template #footer>
        <small
          >Not received a code? <br /><Button
            class="p-button-sm code-request"
            severity="secondary"
            type="submit"
            data-testid="confirm-code-not-received-button"
            label="Request a new code"
            v-on:click.prevent="showDialog = true"
        /></small>
      </template>
    </Card>
  </div>
  <Dialog v-model:visible="showDialog" header="Request new code" :modal="true" :style="{ width: '40vw' }">
    <div class="dialog-container">
      <div class="flex flex-column">
        <label for="dialog-username">Enter your username</label>
        <InputText id="dialog-username" type="text" v-model="username" :class="usernameInvalid && 'invalid'" />
        <small v-if="usernameInvalid" class="validate-error">Username is required.</small>
      </div>
    </div>
    <template #footer>
      <Button data-testid="confirm-code-resend-code-button" type="submit" label="Request a new code" @click="requestCode" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { AuthService, UserService } from "@/services";
import { computed, onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const router = useRouter();

const registeredUsername = computed(() => authStore.registeredUsername);

let code = ref("");
let username = ref("");
let showDialog = ref(false);

const codeVerified = computed(() => verifyCode(code.value));

const usernameInvalid = computed(() => {
  return !username.value;
});

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

function verifyCode(code: string) {
  return /^.{6,}$/.test(code) && code.length <= 6;
}

function handleSubmit() {
  if (codeVerified.value && !usernameInvalid.value) {
    AuthService.confirmRegister(username.value, code.value)
      .then(res => {
        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.message,
            confirmButtonText: "Login"
          }).then(() => {
            authStore.updateRegisteredUsername(username.value);
            router.push({ name: "Login" });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message
          });
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Auth Service Error"
        });
      });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Invalid Credentials",
      text: "Username or Confirmation Code incorrect."
    });
  }
}

function requestCode() {
  if (!usernameInvalid.value) {
    showDialog.value = false;
    AuthService.resendConfirmationCode(username.value)
      .then(async res => {
        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Code has been resent to email for: " + username.value
          });
        } else if (res.message === "User is already confirmed.") {
          await UserService.updateEmailVerified(true).then(() =>
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Account has successfully been verified",
              confirmButtonText: "Login"
            }).then(() => {
              authStore.updateRegisteredUsername(username.value);
              router.push({ name: "Login" });
            })
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Code resending failed. Please check your username is correct."
          });
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Internal application error"
        });
      });
  } else if (showDialog.value === false) {
    showDialog.value = true;
  }
}
</script>

<style scoped>
.confirm-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.code-form {
  max-width: 25em;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}

.password-check {
  color: var(--green-500);
  font-size: 2em;
}

.password-times {
  color: var(--red-500);
  font-size: 2em;
}

.invalid {
  border-color: var(--red-400);
}

.validate-error {
  color: var(--red-400);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>
