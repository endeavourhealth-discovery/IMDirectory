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
            <InputText
              data-testid="forgot-password-submit-password1"
              id="fieldPassword1"
              type="password"
              aria-describedby="password-help"
              v-model="newPassword1"
              @focus="updateFocused('password1', true)"
              @blur="updateFocused('password1', false)"
              :class="passwordStrength === 'fail' && newPassword1 && !focused.get('password1') && 'p-invalid'"
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
              @focus="updateFocused('password2', true)"
              @blur="updateFocused('password2', false)"
              :class="!passwordsMatch && newPassword2 && !focused.get('password2') && 'p-invalid'"
            />
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
import { SweetAlertResult } from "sweetalert2";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/rootStore";

const router = useRouter();
const rootStore = useRootStore();
const registeredUsername = computed(() => rootStore.registeredUsername);

let code = ref("");
let username = ref("");
let newPassword1 = ref("");
let newPassword2 = ref("");
let passwordStrength: Ref<PasswordStrength> = ref(PasswordStrength.fail);
let focused: Ref<Map<string, boolean>> = ref(new Map());

const codeVerified = computed(() => verifyCode(code.value));
const passwordsMatch = computed(() => verifyPasswordsMatch(newPassword1.value, newPassword2.value));
const allVerified = computed(() => codeVerified.value && passwordStrength.value !== PasswordStrength.fail && passwordsMatch.value && username.value !== "");

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
