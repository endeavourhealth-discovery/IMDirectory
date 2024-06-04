<template>
  <Card class="flex flex-column justify-content-sm-around align-items-center register-card">
    <template #header>
      <avatar-with-selector data-testid="register-avatar-select" :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
    </template>
    <template #title> Register </template>
    <template #content>
      <form @submit="onSubmit">
        <div class="p-fluid register-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText
              data-testid="register-username"
              id="fieldUsername"
              type="text"
              maxlength="50"
              v-bind="username"
              @focus="updateFocused('username', true)"
              @blur="updateFocused('username', false)"
              :class="errors.username && username.modelValue && !focused.get('username') && 'p-invalid'"
            />
            <InlineMessage v-if="errors.username" severity="error"> {{ errors.username }} </InlineMessage>
          </div>
          <div class="field">
            <label for="fieldEmail1">Email address</label>
            <div class="flex flex-row align-items-center">
              <InputText
                id="fieldEmail1"
                data-testid="register-email1"
                type="text"
                maxlength="50"
                v-bind="email1"
                @focus="updateFocused('email1', true)"
                @blur="updateFocused('email1', false)"
                :class="!emailIsNotRegistered && !errors.email1 && !focused.get('email1') && 'p-invalid'"
              />
              <IMFontAwesomeIcon
                v-if="!errors.email1 && email1.modelValue && emailIsNotRegistered"
                icon="fa-regular fa-circle-check"
                class="email-check"
                data-testid="register-email1-verified"
              />
              <IMFontAwesomeIcon
                v-if="(errors.email1 && email1.modelValue) || !emailIsNotRegistered"
                icon="fa-regular fa-circle-xmark"
                class="email-times"
                data-testid="register-email1-unverified"
              />
            </div>
            <InlineMessage v-if="!emailIsNotRegistered && email1.modelValue && !errors.email1" severity="error"
              >Email address is already registered</InlineMessage
            >
            <InlineMessage v-if="emailIsNotRegistered && errors.email1" severity="error">{{ errors.email1 }}</InlineMessage>
          </div>
          <div class="field">
            <label for="fieldEmail2">Confirm email address</label>
            <InputText
              id="fieldEmail2"
              data-testid="register-email2"
              type="text"
              maxlength="50"
              v-bind="email2"
              @focus="updateFocused('email2', true)"
              @blur="updateFocused('email2', false)"
              :class="errors.email2 && email2.modelValue && !focused.get('email2') && 'p-invalid'"
            />
            <InlineMessage v-if="errors.email2" severity="error"> {{ errors.email2 }} </InlineMessage>
          </div>
          <div class="field">
            <label for="fieldFirstName">First name</label>
            <InputText
              id="fieldFirstName"
              data-testid="register-firstname"
              type="text"
              maxlength="50"
              v-bind="firstName"
              @focus="updateFocused('firstName', true)"
              @blur="updateFocused('firstName', false)"
              :class="errors.firstName && firstName.modelValue && !focused.get('firstName') && 'p-invalid'"
            />
            <InlineMessage v-if="errors.firstName" severity="error"> {{ errors.firstName }} </InlineMessage>
          </div>
          <div class="field">
            <label for="fieldLastName">Last name</label>
            <InputText
              id="fieldLastName"
              data-testid="register-lastname"
              type="text"
              maxlength="50"
              v-bind="lastName"
              @focus="updateFocused('lastName', true)"
              @blur="updateFocused('lastName', false)"
              :class="errors.lastName && lastName.modelValue && !focused.get('lastName') && 'p-invalid'"
            />
            <InlineMessage v-if="errors.lastName" severity="error"> {{ errors.lastName }}</InlineMessage>
          </div>
          <PasswordInputs test-id="register-password-" @update:password="setNewPassword" @update:arePasswordsValid="setIsNewPasswordValid" />
          <div class="privacy-container">
            <label for="privacy"> I have read and accept the <router-link to="/privacy">privacy policy </router-link></label>
            <Checkbox v-model="privacyPolicyAccepted" :binary="true" />
          </div>
          <div class="flex flex-row justify-content-center">
            <Button :disabled="!allVerified" data-testid="register-submit" class="user-submit" type="submit" label="Register" @click="onSubmit" />
          </div>
        </div>
      </form>
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
import { verifyIsEmail, verifyIsFirstName, verifyIsLastName, verifyIsUsername } from "@im-library/helpers/UserMethods";
import { Avatars } from "@im-library/constants";
import { useRouter } from "vue-router";
import { User } from "@im-library/interfaces";
import { useAuthStore } from "@/stores/authStore";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import _ from "lodash";

const emit = defineEmits({
  userCreated: (_payload: User) => true
});

const authStore = useAuthStore();
const router = useRouter();

const isNewPasswordValid = ref(false);
const password = ref("");
const selectedAvatar = ref(Avatars[0]);
const focused: Ref<Map<string, boolean>> = ref(new Map());
const emailIsNotRegistered = ref(true);
const privacyPolicyAccepted = ref(false);
const allVerified = computed(() => isObjectHasKeys(errors) && isNewPasswordValid.value && emailIsNotRegistered.value && privacyPolicyAccepted.value);

const schema: any = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .test("isUsernameVerified", 'Username contains unexpected characters. A-Z, 0-9 and hyphen/underscore(-_) only allowed e.g."John-Doe2"', () =>
      verifyIsUsername(username.value.modelValue)
    ),
  firstName: yup
    .string()
    .required("First name is required")
    .test("isFirstNameVerified", 'First name contains unexpected characters. Letters, apostrophes, and hyphens only allowed e.g."Mary-Anne"', () =>
      verifyIsFirstName(firstName.value.modelValue)
    ),
  lastName: yup
    .string()
    .required("Last name is required")
    .test("isLastNameValid", 'Last name must have a minimum of two letters and only contain letters, apostrophes, and hyphens e.g."O\'Keith-Smith"', () =>
      verifyIsLastName(lastName.value.modelValue)
    ),
  email1: yup
    .string()
    .required("Email is required")
    .test("isEmailValid", "Email is not valid", () => verifyIsEmail(email1.value.modelValue)),
  email2: yup
    .string()
    .required("Email is required")
    .oneOf([yup.ref("email1")], "Email addresses do not match")
});

const { errors, defineComponentBinds, handleSubmit, setValues } = useForm({
  validationSchema: schema
});

const username: any = defineComponentBinds("username");
const firstName: any = defineComponentBinds("firstName");
const lastName: any = defineComponentBinds("lastName");
const email1: any = defineComponentBinds("email1");
const email2: any = defineComponentBinds("email2");

watch(
  () => _.cloneDeep(email1.value.modelValue),
  async newValue => {
    await verifyEmailIsNotRegistered(newValue);
  }
);

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function setNewPassword(newPassword: string) {
  password.value = newPassword;
}

function setIsNewPasswordValid(isValid: boolean) {
  isNewPasswordValid.value = isValid;
}

const onSubmit = handleSubmit(async () => {
  if (allVerified.value) {
    const user = {
      id: "",
      username: username.value.modelValue,
      firstName: firstName.value.modelValue,
      lastName: lastName.value.modelValue,
      email: email1.value.modelValue.toLowerCase(),
      password: password.value,
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
});

function clearForm(): void {
  username.value.modelValue = "";
  email1.value.modelValue = "";
  email2.value.modelValue = "";
  firstName.value.modelValue = "";
  lastName.value.modelValue = "";
  password.value = "";
  selectedAvatar.value = Avatars[0];
}

function updateAvatar(newValue: string): void {
  selectedAvatar.value = newValue;
}

async function verifyEmailIsNotRegistered(email: string): Promise<void> {
  if (email && !errors.value.email1) emailIsNotRegistered.value = !(await AuthService.isEmailRegistered(email));
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
