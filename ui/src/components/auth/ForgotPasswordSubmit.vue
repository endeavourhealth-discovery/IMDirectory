<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center recovery-card">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-user" class="icon-header" />
      </template>
      <template #title> Account Recovery: <br /><br />Submit Password Reset Code </template>
      <template #content>
        <div class="p-fluid recovery-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText
              data-testid="forgot-password-submit-username"
              id="fieldUsername"
              type="text"
              v-model="username"
              :placeholder="registeredUsername"
              @focus="updateFocused('username', true)"
              @blur="updateFocused('username', false)"
              :class="!username && focused.get('username') === false && 'p-invalid'"
            />
          </div>
          <div class="field">
            <label for="fieldCode">Confirmation code</label>
            <div class="flex flex-row align-items-center">
              <InputText
                data-testid="forgot-password-submit-code"
                id="fieldCode"
                type="password"
                v-model="code"
                @focus="updateFocused('code', true)"
                @blur="updateFocused('code', false)"
                :class="!codeVerified && code && !focused.get('code') && 'p-invalid'"
              />
              <IMFontAwesomeIcon
                v-if="codeVerified"
                icon="fa-regular fa-circle-check"
                style="color: var(--green-500); font-size: 2em"
                data-testid="forgot-password-submit-verified"
              />
              <IMFontAwesomeIcon
                v-if="!codeVerified && code"
                icon="fa-regular fa-circle-xmark"
                style="color: var(--red-500); font-size: 2em"
                data-testid="forgot-password-submit-unverified"
              />
            </div>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <div class="field">
            <label for="fieldPassword1">New Password</label>
            <Password
              v-model="newPassword1"
              toggleMask
              data-testid="forgot-password-submit-password1"
              id="fieldPassword1"
              strong-regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
              medium-regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"
            >
              <template #header>
                <h6>Pick a password</h6>
              </template>
              <template #footer>
                <hr />
                <p class="mt-2">Password should contain:</p>
                <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                  <li>At least one lowercase</li>
                  <li>At least one uppercase</li>
                  <li>At least one numeric</li>
                  <li>Special characters such as !@#$%^&*</li>
                  <li>Minimum 8 characters</li>
                </ul>
              </template>
            </Password>
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success"> Password strength: Strong </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="warn"> Password strength: Medium </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && newPassword1 !== ''" severity="error"> Password strength: Weak </InlineMessage>
          </div>
          <div class="field">
            <label for="fieldPassword2">Confirm New Password</label>
            <Password v-model="newPassword2" toggleMask :feedback="false" data-testid="forgot-password-submit-password2" id="fieldPassword2" />
            <InlineMessage v-if="!passwordsMatch && newPassword2 && !focused.get('password2') && 'p-invalid'" severity="error"
              >Passwords do not match!</InlineMessage
            >
          </div>
          <div class="flex flex-row justify-content-center">
            <Button
              :disabled="!allVerified"
              data-testid="forgot-password-submit-reset"
              class="user-submit"
              type="submit"
              label="Reset Password"
              v-on:click.prevent="handleSubmit"
            />
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
import { computed, onMounted, Ref, ref, watch } from "vue";
import { AuthService } from "@/services";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { PasswordStrength } from "@im-library/enums";
import { verifyPasswordsMatch, checkPasswordStrength } from "@im-library/helpers/UserMethods";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Password from "primevue/password";

const router = useRouter();
const authStore = useAuthStore();
const registeredUsername = computed(() => authStore.registeredUsername);

let code = ref("");
let username = ref("");
let newPassword1 = ref("");
let newPassword2 = ref("");
let passwordStrength: Ref<PasswordStrength> = ref(PasswordStrength.fail);
let focused: Ref<Map<string, boolean>> = ref(new Map());

const codeVerified = computed(() => verifyCode(code.value));
const passwordsMatch = computed(() => verifyPasswordsMatch(newPassword1.value, newPassword2.value));
const allVerified = computed(
  () =>
    codeVerified.value &&
    (passwordStrength.value === PasswordStrength.medium || passwordStrength.value === PasswordStrength.strong) &&
    passwordsMatch.value &&
    username.value !== ""
);

watch(newPassword1, newValue => {
  passwordStrength.value = checkPasswordStrength(newValue);
});

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

function verifyCode(code: string): boolean {
  return /^.{6,}$/.test(code) && code.length <= 6;
}

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function handleSubmit(): void {
  if (allVerified.value) {
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
