<template>
  <Card class="flex flex-column justify-content-sm-around align-items-center register-card">
    <template #header>
      <avatar-with-selector data-testid="register-avatar-select" :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
    </template>
    <template #title> Register </template>
    <template #content>
      <div class="p-fluid register-form">
        <div class="field">
          <label for="fieldUsername">Username</label>
          <InputText
            data-testid="register-username"
            id="fieldUsername"
            type="text"
            maxlength="50"
            v-model="username"
            @focus="updateFocused('username', true)"
            @blur="updateFocused('username', false)"
            :class="!usernameVerified && username && !focused.get('username') && 'p-invalid'"
          />
          <InlineMessage v-if="!usernameVerified && username" severity="error">
            Username contains unexpected characters. A-Z, 0-9 and hyphen/underscore(-_) only allowed e.g."John-Doe2"
          </InlineMessage>
        </div>
        <div class="field">
          <label for="fieldEmail1">Email address</label>
          <div class="flex flex-row align-items-center">
            <InputText
              id="fieldEmail1"
              data-testid="register-email1"
              type="text"
              maxlength="50"
              v-model="email1"
              @focus="updateFocused('email1', true)"
              @blur="updateFocused('email1', false)"
              :class="!emailIsNotRegistered && email1Verified && !focused.get('email1') && 'p-invalid'"
            />
            <IMFontAwesomeIcon
              v-if="email1Verified && emailIsNotRegistered"
              icon="fa-regular fa-circle-check"
              class="email-check"
              data-testid="register-email1-verified"
            />
            <IMFontAwesomeIcon
              v-if="(!email1Verified && email1) || !emailIsNotRegistered"
              icon="fa-regular fa-circle-xmark"
              class="email-times"
              data-testid="register-email1-unverified"
            />
          </div>
          <InlineMessage v-if="!emailIsNotRegistered && email1 && email1Verified" severity="error">Email address is already registered</InlineMessage>
        </div>
        <div class="field">
          <label for="fieldEmail2">Confirm email address</label>
          <InputText
            id="fieldEmail2"
            data-testid="register-email2"
            type="text"
            maxlength="50"
            v-model="email2"
            @focus="updateFocused('email2', true)"
            @blur="updateFocused('email2', false)"
            :class="!emailsMatch && email2 && !focused.get('email2') && 'p-invalid'"
          />
          <InlineMessage v-if="!emailsMatch && email2 && !focused.get('email2')" severity="error"> Email addresses do not match! </InlineMessage>
        </div>
        <div class="field">
          <label for="fieldFirstName">First name</label>
          <InputText
            id="fieldFirstName"
            data-testid="register-firstname"
            type="text"
            maxlength="50"
            v-model="firstName"
            @focus="updateFocused('firstName', true)"
            @blur="updateFocused('firstName', false)"
            :class="!firstNameVerified && firstName && !focused.get('firstName') && 'p-invalid'"
          />
          <InlineMessage v-if="!firstNameVerified && firstName" severity="error">
            First name contains unexpected characters. Letters, apostrophes, and hyphens only allowed e.g."Mary-Anne".
          </InlineMessage>
        </div>
        <div class="field">
          <label for="fieldLastName">Last name</label>
          <InputText
            id="fieldLastName"
            data-testid="register-lastname"
            type="text"
            maxlength="50"
            v-model="lastName"
            @focus="updateFocused('lastName', true)"
            @blur="updateFocused('lastName', false)"
            :class="!lastNameVerified && lastName && !focused.get('lastName') && 'p-invalid'"
          />
          <InlineMessage v-if="!lastNameVerified && lastName" severity="error">
            Last name must have a minimum of two letters and only contain letters, apostrophes, and hyphens e.g."O'Keith-Smith".
          </InlineMessage>
        </div>
        <div class="field">
          <label for="fieldPassword1">Password</label>
          <div class="input-with-button">
            <InputText
              data-testid="register-password1"
              id="fieldPassword1"
              :type="showPassword1 ? 'text' : 'password'"
              maxlength="50"
              aria-describedby="password-help"
              v-model="password1"
              :class="passwordStrength === 'fail' && password1 && !focused.get('password1') && 'p-invalid'"
            />
            <Button :icon="showPassword1 ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" @click="toggleShowPassword1" text />
          </div>
          <InlineMessage v-if="passwordStrength === 'strong'" severity="success"> Password strength: Strong </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'medium'" severity="success"> Password strength: Medium </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'weak'" severity="warn"> Password strength: Weak </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'fail' && password1 !== ''" severity="error"> Invalid password </InlineMessage>
          <small id="password-help">
            Password must be a minimum length of 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special characters
            [!@#$%^&*].
          </small>
        </div>
        <div class="field">
          <label for="fieldPassword2">Confirm password</label>
          <div class="input-with-button">
            <InputText
              id="fieldPassword2"
              data-testid="register-password2"
              :type="showPassword2 ? 'text' : 'password'"
              maxlength="50"
              v-model="password2"
              @keyup="checkKey"
              @focus="updateFocused('password2', true)"
              @blur="updateFocused('password2', false)"
              :class="!passwordsMatch && password2 && !focused.get('password2') && 'p-invalid'"
            />
            <Button :icon="showPassword2 ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" @click="toggleShowPassword2" text />
          </div>
          <InlineMessage v-if="!passwordsMatch && password2 && !focused.get('password2')" severity="error"> Passwords do not match! </InlineMessage>
        </div>
        <div class="privacy-container">
          <label for="privacy"> I have read and accept the <router-link to="/privacy">privacy policy </router-link></label>
          <Checkbox v-model="privacyPolicyAccepted" :binary="true" />
        </div>
        <div class="flex flex-row justify-content-center">
          <Button
            data-testid="register-submit-disabled"
            v-if="!allVerified"
            class="user-submit"
            type="submit"
            label="Register"
            disabled
            @click="handleSubmit"
          />
          <Button data-testid="register-submit" v-else class="user-submit" type="submit" label="Register" @click="handleSubmit" />
        </div>
      </div>
    </template>
    <template #footer>
      <span>
        Already have an account?
        <a id="login-link" class="footer-link" @click="$router.push({ name: 'Login' })">Login here</a>
      </span>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { AuthService } from "@/services";
import AvatarWithSelector from "./AvatarWithSelector.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { computed, Ref, ref, watch } from "vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import {
  verifyEmailsMatch,
  verifyIsEmail,
  verifyIsFirstName,
  verifyIsLastName,
  verifyIsUsername,
  checkPasswordStrength
} from "@im-library/helpers/UserMethods";
import { PasswordStrength } from "@im-library/enums";
import { Avatars } from "@im-library/constants";
import { useRouter } from "vue-router";
import { User } from "@im-library/interfaces";
import { useAuthStore } from "@/stores/authStore";

const emit = defineEmits({
  userCreated: (payload: User) => true
});

const authStore = useAuthStore();
const router = useRouter();

const username = ref("");
const email1 = ref("");
const email2 = ref("");
const firstName = ref("");
const lastName = ref("");
const password1 = ref("");
const password2 = ref("");
const selectedAvatar = ref(Avatars[0]);
const focused: Ref<Map<string, boolean>> = ref(new Map());
const emailIsNotRegistered = ref(true);
const privacyPolicyAccepted = ref(false);
const showPassword1 = ref(false);
const showPassword2 = ref(false);

const usernameVerified = computed(() => verifyIsUsername(username.value));
const email1Verified = computed(() => verifyIsEmail(email1.value));
const emailsMatch = computed(() => verifyEmailsMatch(email1.value, email2.value));
const firstNameVerified = computed(() => verifyIsFirstName(firstName.value));
const lastNameVerified = computed(() => verifyIsLastName(lastName.value));
const passwordStrength = computed(() => checkPasswordStrength(password1.value));
const passwordsMatch = computed(() => verifyEmailsMatch(password1.value, password2.value));
const allVerified = computed(
  () =>
    usernameVerified.value &&
    email1Verified.value &&
    emailsMatch.value &&
    firstNameVerified.value &&
    lastNameVerified.value &&
    passwordStrength.value !== PasswordStrength.fail &&
    passwordsMatch.value &&
    emailIsNotRegistered.value &&
    privacyPolicyAccepted.value
);

watch(email1, async newValue => {
  await verifyEmailIsNotRegistered(newValue);
});

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function toggleShowPassword1() {
  showPassword1.value = !showPassword1.value;
}

function toggleShowPassword2() {
  showPassword2.value = !showPassword2.value;
}

async function handleSubmit(): Promise<void> {
  if (allVerified.value) {
    const user = {
      id: "",
      username: username.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email1.value.toLowerCase(),
      password: password1.value,
      avatar: selectedAvatar.value,
      roles: [],
      mfaStatus: []
    } as User;
    AuthService.register(user)
      .then(res => {
        if (res.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.message,
            showCancelButton: true,
            confirmButtonText: "Continue"
          }).then((result: SweetAlertResult) => {
            emit("userCreated", user);
            if (result.isConfirmed) {
              authStore.updateRegisteredUsername(username.value);
              router.push({ name: "ConfirmCode" });
            } else {
              clearForm();
            }
          });
        } else if (res.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Username already taken. Please pick another username",
            confirmButtonText: "Close"
          });
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
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "User creation failed. Check input data.",
      confirmButtonText: "Close"
    });
  }
}

function clearForm(): void {
  username.value = "";
  email1.value = "";
  email2.value = "";
  firstName.value = "";
  lastName.value = "";
  password1.value = "";
  password2.value = "";
  selectedAvatar.value = Avatars[0];
}

function updateAvatar(newValue: string): void {
  selectedAvatar.value = newValue;
}

function checkKey(event: any): void {
  if (event.keyCode === 13) {
    handleSubmit();
  }
}

async function verifyEmailIsNotRegistered(email: string): Promise<void> {
  if (email && email1Verified.value) emailIsNotRegistered.value = !(await AuthService.isEmailRegistered(email));
  else emailIsNotRegistered.value = true;
}
</script>

<style scoped>
.user-submit {
  width: fit-content !important;
}

#password-help {
  overflow-wrap: break-word;
}

.register-card {
  padding: 0 2em;
}

.register-form {
  max-width: 32em;
}

.footer-link:hover {
  cursor: pointer;
}
.email-check {
  color: var(--green-500);
  font-size: 2em;
}
.email-times {
  color: var(--red-500);
  font-size: 2em;
}

.privacy-container {
  padding-bottom: 0.5rem;
}

.input-with-button {
  display: flex;
  flex-flow: row nowrap;
}
</style>
