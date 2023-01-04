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
          />
          <InlineMessage v-if="!usernameVerified && focused.get('username') === false" severity="error">
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
            />
            <InlineMessage v-if="!emailIsNotRegistered && email1Verified" severity="error">Email address is already registered</InlineMessage>
            <i
              v-if="email1Verified && focused.get('email1') === false"
              data-testid="register-email1-verified"
              class="pi pi-check-circle email-check"
              aria-hidden="true"
            />
            <i
              v-if="!email1Verified && focused.get('email1') === false"
              data-testid="register-email1-unverified"
              class="pi pi-times-circle email-times"
              aria-hidden="true"
            />
          </div>
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
          />
          <InlineMessage v-if="!emailsMatch && focused.get('email2') === false" severity="error"> Email addresses do not match! </InlineMessage>
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
          />
          <InlineMessage v-if="!firstNameVerified && focused.get('firstName') === false" severity="error">
            First name contains unexpected characters. A-Z and hyphens only allowed e.g."Mary-Anne"
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
          />
          <InlineMessage v-if="!lastNameVerified && focused.get('lastName') === false" severity="error">
            Last name contains unexpected characters. A-Z, apostropies and hyphens only allowed e.g."O'Keith-Smith"
          </InlineMessage>
        </div>
        <div class="field">
          <label for="fieldPassword1">Password</label>
          <InputText data-testid="register-password1" id="fieldPassword1" type="password" maxlength="50" aria-describedby="password-help" v-model="password1" />
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
          <InputText
            id="fieldPassword2"
            data-testid="register-password2"
            type="password"
            maxlength="50"
            v-model="password2"
            @keyup="checkKey"
            @focus="updateFocused('password2', true)"
            @blur="updateFocused('password2', false)"
          />
          <InlineMessage v-if="!passwordsMatch && focused.get('password2') === false" severity="error"> Passwords do not match! </InlineMessage>
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
import { computed, defineComponent, Ref, ref, watch } from "vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { verifyEmailsMatch, verifyIsEmail, verifyIsName, verifyIsUsername, verifyPasswordsMatch, checkPasswordStrength } from "@im-library/helpers/UserMethods";
import { PasswordStrength } from "@im-library/enums";
import { Avatars } from "@im-library/constants";
import { User } from "@im-library/models";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const emit = defineEmits({
  userCreated: (payload: User) => true
});

const store = useStore();
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

const usernameVerified = computed(() => verifyIsUsername(username.value));
const email1Verified = computed(() => verifyIsEmail(email1.value));
const emailsMatch = computed(() => verifyEmailsMatch(email1.value, email2.value));
const firstNameVerified = computed(() => verifyIsName(firstName.value));
const lastNameVerified = computed(() => verifyIsName(lastName.value));
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
    emailIsNotRegistered.value
);

watch(email1, async newValue => {
  await verifyEmailIsNotRegistered(newValue);
});

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

async function handleSubmit(): Promise<void> {
  if (allVerified.value) {
    const user = new User(username.value, firstName.value, lastName.value, email1.value.toLowerCase(), password1.value, selectedAvatar.value, []);
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
              store.commit("updateRegisteredUsername", username.value);
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
  color: #439446;
  font-size: 2em;
}
.email-times {
  color: #e60017;
  font-size: 2em;
}
</style>
