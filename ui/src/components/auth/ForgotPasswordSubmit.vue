<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center recovery-card">
      <template #header>
        <i class="fa-solid fa-user icon-header" aria-hidden="true" />
      </template>
      <template #title> Account Recovery: <br /><br />Submit Password Reset Code </template>
      <template #content>
        <div class="p-fluid recovery-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText data-testid="forgot-password-submit-username" id="fieldUsername" type="text" v-model="username" :placeholder="registeredUsername" />
          </div>
          <div class="field">
            <label for="fieldCode">Confirmation code</label>
            <div class="flex flex-row align-items-center">
              <InputText data-testid="forgot-password-submit-code" id="fieldCode" type="password" v-model="code" />
              <i
                v-if="codeVerified"
                data-testid="forgot-password-submit-verified"
                class="pi pi-check-circle"
                style="color: #439446; font-size: 2em"
                aria-hidden="true"
              />
              <i
                v-if="!codeVerified && code !== ''"
                data-testid="forgot-password-submit-unverified"
                class="pi pi-times-circle"
                style="color: #e60017; font-size: 2em"
                aria-hidden="true"
              />
            </div>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <div class="field">
            <label for="fieldPassword1">New Password</label>
            <InputText
              data-testid="forgot-password-submit-password1"
              id="fieldPassword1"
              type="password"
              aria-describedby="password-help"
              v-model="newPassword1"
            />
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success">Password Strength: Strong</InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="success">Password Strength: Medium</InlineMessage>
            <InlineMessage v-if="passwordStrength === 'weak'" severity="warn">Password Strength: Weak</InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && newPassword1 !== ''" severity="error">Invalid Password</InlineMessage>
            <small id="password-help">
              Password min length 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special characters [!@#$%^&*].
            </small>
          </div>
          <div class="field">
            <label for="fieldPassword2">Confirm New Password</label>
            <InputText
              data-testid="forgot-password-submit-password2"
              id="fieldPassword2"
              type="password"
              v-model="newPassword2"
              v-on:blur="setShowPassword2Notice"
            />
            <InlineMessage v-if="showPassword2Notice" severity="error">Passwords do not match!</InlineMessage>
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="forgot-password-submit-reset" class="user-submit" type="submit" label="Reset Password" v-on:click.prevent="handleSubmit" />
          </div>
        </div>
      </template>
      <template #footer>
        <small>Request a new code <a id="password-submit-link" class="footer-link" @click="router.push({ name: 'ForgotPassword' })">here</a></small>
        <br />
        <br />
        <small>If you have forgotten your username, please contact an admin</small>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import { AuthService } from "@/services";
import { PasswordStrength } from "@im-library/enums";
import { verifyPasswordsMatch, checkPasswordStrength } from "@im-library/helpers/UserMethods";
import { SweetAlertResult } from "sweetalert2";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();
const registeredUsername = computed(() => store.state.registeredUsername);

let code = ref("");
let username = ref("");
let newPassword1 = ref("");
let newPassword2 = ref("");
let passwordStrength: Ref<PasswordStrength> = ref(PasswordStrength.fail);
let showPassword2Notice = ref(false);

const codeVerified = computed(() => verifyCode(code.value));
const passwordsMatch = computed(() => verifyPasswordsMatch(newPassword1.value, newPassword2.value));

watch(newPassword1, newValue => {
  passwordStrength.value = checkPasswordStrength(newValue);
});

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

function setShowPassword2Notice(): void {
  showPassword2Notice.value = passwordsMatch.value ? false : true;
}

function verifyCode(code: string): boolean {
  return /^(?=.{6,})/.test(code);
}

function handleSubmit(): void {
  if (codeVerified.value && username.value !== "" && passwordsMatch.value && passwordStrength.value !== PasswordStrength.fail) {
    AuthService.forgotPasswordSubmit(username.value, code.value, newPassword1.value).then(res => {
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password successfully reset",
          confirmButtonText: "Continue"
        }).then(() => {
          router.push({ name: "Login" });
        });
      } else if (res.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Code Expired",
          text: "Password reset code has expired. Please request a new code",
          showCancelButton: true,
          confirmButtonText: "Request new code"
        }).then((result: SweetAlertResult) => {
          if (result.isConfirmed) {
            router.push({ name: "ForgotPassword" });
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message + ". Check input data."
        });
      }
    });
  }
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
