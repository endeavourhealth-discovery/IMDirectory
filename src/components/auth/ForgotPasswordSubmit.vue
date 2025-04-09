<template>
  <div class="flex flex-row items-center">
    <Card class="justify-content-sm-around recovery-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-user" class="icon-header" />
      </template>
      <template #title> Account Recovery: <br /><br />Submit Password Reset Code </template>
      <template #content>
        <form @submit="onSubmit" class="recovery-form flex flex-col justify-start">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText
              data-testid="forgot-password-submit-username"
              id="fieldUsername"
              type="text"
              v-model="username"
              v-bind="usernameAttrs"
              :placeholder="registeredUsername"
              @focus="updateFocused('username', true)"
              @blur="updateFocused('username', false)"
              :class="!username && focused.get('username') === false && 'p-invalid'"
            />
            <Message v-if="errors.username" severity="info"> {{ errors.username }} </Message>
          </div>
          <div class="field">
            <label for="fieldCode">Confirmation code</label>
            <div class="flex flex-row justify-center">
              <InputOtp
                data-testid="forgot-password-submit-code"
                id="fieldCode"
                :length="6"
                v-model="code"
                v-bind="codeAttrs"
                @focus="updateFocused('code', true)"
                @blur="updateFocused('code', false)"
                :class="!codeVerified && code && !focused.get('code') && 'p-invalid'"
                :pt="{ pcInputText: { root: { 'data-testid': 'otp-input' } } }"
              />
            </div>
            <Message v-if="errors.code" severity="error">{{ errors.code }}</Message>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <PasswordInputs test-id="forgot-password-submit-" @update:password="setNewPassword" @update:arePasswordsValid="setIsNewPasswordValid" />
          <div class="flex flex-row justify-center">
            <Button
              :disabled="!allVerified"
              data-testid="forgot-password-submit-reset"
              class="user-submit"
              label="Reset Password"
              v-on:click.prevent="onSubmit"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <small
          >Request a new code
          <Button link as="a" id="password-submit-link" class="footer-link p-0 text-xs" @click="router.push({ name: 'ForgotPassword' })">here</Button></small
        >
        <br />
        <br />
        <small>If you have forgotten your username, please contact an admin</small>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref } from "vue";
import { AuthService } from "@/services";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";
import * as yup from "yup";
import { useForm } from "vee-validate";

const router = useRouter();
const authStore = useAuthStore();
const registeredUsername = computed(() => authStore.registeredUsername);

const focused: Ref<Map<string, boolean>> = ref(new Map());

const { handleSubmit, errors, setValues, defineField } = useForm({
  validationSchema: yup.object({
    code: yup.string().required().length(6),
    username: yup.string().required("Username is required")
  })
});

const [code, codeAttrs]: any = defineField("code");
const [username, usernameAttrs]: any = defineField("username");

const password = ref("");
const isNewPasswordValid = ref(false);

const codeVerified = computed(() => verifyCode(code.value));
const allVerified = computed(() => codeVerified.value && isNewPasswordValid.value && username.value);

onMounted(() => {
  if (registeredUsername.value) {
    setValues({
      username: registeredUsername.value
    });
  }
});

function setNewPassword(newPassword: string) {
  password.value = newPassword;
}

function setIsNewPasswordValid(isValid: boolean) {
  isNewPasswordValid.value = isValid;
}

function verifyCode(code: string): boolean {
  if (code) return /^.{6,}$/.test(code) && code.length <= 6;
  else return false;
}

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

const onSubmit = handleSubmit(async () => {
  if (allVerified.value) {
    AuthService.forgotPasswordSubmit(username.value, code.value, password.value).then(res => {
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
}

.footer-link:hover {
  cursor: pointer;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}
.field {
  display: flex;
  flex-flow: column nowrap;
}
</style>
