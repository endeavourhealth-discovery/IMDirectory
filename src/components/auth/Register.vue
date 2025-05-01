<template>
  <Card class="justify-content-sm-around register-card flex flex-col items-center">
    <template #header>
      <avatar-with-selector data-testid="register-avatar-select" :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
    </template>
    <template #title> Register </template>
    <template #content>
      <form @submit="onSubmit">
        <div class="register-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText
              data-testid="register-username"
              id="fieldUsername"
              type="text"
              maxlength="50"
              v-model="username"
              v-bind="usernameAttrs"
              @focus="updateFocused('username', true)"
              @blur="updateFocused('username', false)"
              :class="errors.username && username && !focused.get('username') && 'p-invalid'"
            />
            <Message v-if="errors.username" severity="error"> {{ errors.username }} </Message>
          </div>
          <div class="field">
            <label for="fieldEmail1">Email address</label>
            <div class="flex flex-row items-center">
              <InputText
                id="fieldEmail1"
                data-testid="register-email1"
                type="text"
                maxlength="50"
                v-model="email1"
                v-bind="email1Attrs"
                class="flex-auto"
                @focus="updateFocused('email1', true)"
                @blur="updateFocused('email1', false)"
                :class="!emailIsNotRegistered && !errors.email1 && !focused.get('email1') && 'p-invalid'"
              />
              <IMFontAwesomeIcon
                v-if="!errors.email1 && email1 && emailIsNotRegistered"
                icon="fa-regular fa-circle-check"
                class="email-check"
                data-testid="register-email1-verified"
              />
              <IMFontAwesomeIcon
                v-if="(errors.email1 && email1) || !emailIsNotRegistered"
                icon="fa-regular fa-circle-xmark"
                class="email-times"
                data-testid="register-email1-unverified"
              />
            </div>
            <Message v-if="!emailIsNotRegistered && email1 && !errors.email1" severity="error">Email address is already registered</Message>
            <Message v-if="emailIsNotRegistered && errors.email1" severity="error">{{ errors.email1 }}</Message>
          </div>
          <div class="field">
            <label for="fieldEmail2">Confirm email address</label>
            <InputText
              id="fieldEmail2"
              data-testid="register-email2"
              type="text"
              maxlength="50"
              v-model="email2"
              v-bind="email2Attrs"
              @focus="updateFocused('email2', true)"
              @blur="updateFocused('email2', false)"
              :class="errors.email2 && email2 && !focused.get('email2') && 'p-invalid'"
            />
            <Message v-if="errors.email2" severity="error"> {{ errors.email2 }} </Message>
          </div>
          <div class="field">
            <label for="fieldFirstName">First name</label>
            <InputText
              id="fieldFirstName"
              data-testid="register-firstname"
              type="text"
              maxlength="50"
              v-model="firstName"
              v-bind="firstNameAttrs"
              @focus="updateFocused('firstName', true)"
              @blur="updateFocused('firstName', false)"
              :class="errors.firstName && firstName && !focused.get('firstName') && 'p-invalid'"
            />
            <Message v-if="errors.firstName" severity="error"> {{ errors.firstName }} </Message>
          </div>
          <div class="field">
            <label for="fieldLastName">Last name</label>
            <InputText
              id="fieldLastName"
              data-testid="register-lastname"
              type="text"
              maxlength="50"
              v-model="lastName"
              v-bind="lastNameAttrs"
              @focus="updateFocused('lastName', true)"
              @blur="updateFocused('lastName', false)"
              :class="errors.lastName && lastName && !focused.get('lastName') && 'p-invalid'"
            />
            <Message v-if="errors.lastName" severity="error" class="error-message"> {{ errors.lastName }}</Message>
          </div>
          <PasswordInputs test-id="register-password-" @update:password="setNewPassword" @update:arePasswordsValid="setIsNewPasswordValid" />
          <div class="privacy-container">
            <label for="privacy"> I have read and accept the <Button link as="a" class="p-0" @click="openInNewTab('Privacy')">privacy policy </Button></label>
            <Checkbox v-model="privacyPolicyAccepted" :binary="true" />
          </div>
          <div class="flex flex-row justify-center">
            <Button :disabled="!allVerified" data-testid="register-submit" class="user-submit" label="Register" @click="onSubmit" />
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <span>
        Already have an account?
        <Button link as="router-link" id="login-link" class="footer-link p-0" to="/user/login">Login here</Button>
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
import { verifyIsEmail, verifyIsFirstName, verifyIsLastName, verifyIsUsername } from "@/helpers/UserMethods";
import { Avatars } from "@/constants";
import { useRouter } from "vue-router";
import { User } from "@/interfaces";
import { useAuthStore } from "@/stores/authStore";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";

const emit = defineEmits<{
  userCreated: [payload: User];
}>();

const authStore = useAuthStore();
const router = useRouter();

const isNewPasswordValid = ref(false);
const password = ref("");
const selectedAvatar = ref(Avatars[0]);
const focused: Ref<Map<string, boolean>> = ref(new Map());
const emailIsNotRegistered = ref(true);
const privacyPolicyAccepted = ref(false);
const allVerified = computed(() => isObjectHasKeys(errors) && isNewPasswordValid.value && emailIsNotRegistered.value && privacyPolicyAccepted.value);

const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .test("isUsernameVerified", 'Username contains unexpected characters. A-Z, 0-9 and hyphen/underscore(-_) only allowed e.g."John-Doe2"', () =>
      verifyIsUsername(username.value)
    ),
  firstName: yup
    .string()
    .required("First name is required")
    .test("isFirstNameVerified", 'First name contains unexpected characters. Letters, apostrophes, and hyphens only allowed e.g."Mary-Anne"', () =>
      verifyIsFirstName(firstName.value)
    ),
  lastName: yup
    .string()
    .required("Last name is required")
    .test("isLastNameValid", 'Last name must have a minimum of two letters and only contain letters, apostrophes, and hyphens e.g."O\'Keith-Smith"', () =>
      verifyIsLastName(lastName.value)
    ),
  email1: yup
    .string()
    .required("Email is required")
    .test("isEmailValid", "Email is not valid", () => verifyIsEmail(email1.value)),
  email2: yup
    .string()
    .required("Email is required")
    .oneOf([yup.ref("email1")], "Email addresses do not match")
});

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: schema
});

const [username, usernameAttrs]: any = defineField("username");
const [firstName, firstNameAttrs]: any = defineField("firstName");
const [lastName, lastNameAttrs]: any = defineField("lastName");
const [email1, email1Attrs]: any = defineField("email1");
const [email2, email2Attrs]: any = defineField("email2");

watch(
  () => cloneDeep(email1.value),
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
      username: username.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email1.value.toLowerCase(),
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
              authStore.updateRegisteredUsername(username.value.modelValue);
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
  username.value = "";
  email1.value = "";
  email2.value = "";
  firstName.value = "";
  lastName.value = "";
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

function openInNewTab(componentName: string) {
  const routeData = router.resolve({ name: componentName });
  window.open(routeData.href);
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
  display: flex;
  flex-flow: column nowrap;
  width: 28rem;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.footer-link:hover {
  cursor: pointer;
}
.email-check {
  color: var(--p-green-500);
  font-size: 2em;
}
.email-times {
  color: var(--p-red-500);
  font-size: 2em;
}

.privacy-container {
  padding-bottom: 0.5rem;
}

.input-with-button {
  display: flex;
  flex-flow: row nowrap;
}

.error-message {
  max-width: 32rem;
}
</style>
