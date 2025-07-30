<template>
  <div class="flex flex-row">
    <div class="menu-container">
      <TieredMenu :model="menuItems" />
    </div>
    <Card class="justify-content-sm-around user-edit-card flex flex-col items-center">
      <template #header>
        <h1>Edit my account</h1>
        <avatar-with-selector :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
      </template>
      <template #title> {{ menuItems[activeItem].label }}</template>
      <template #content>
        <div v-if="activeItem === 0" class="user-edit-form flex flex-col justify-start">
          <form @submit="onSubmit">
            <div class="field">
              <label for="username">Username</label>
              <InputText id="username" v-model="username" data-testid="user-edit-username" disabled type="text" />
              <small id="user-help">Username cannot currently be changed.</small>
            </div>
            <div class="field">
              <label for="firstName">First name</label>
              <InputText
                id="firstName"
                v-model="firstName"
                :class="(!firstName || errors.firstName) && 'p-invalid'"
                data-testid="user-edit-firstname"
                type="text"
                v-bind="firstNameAttrs"
                @blur="updateFocused('firstName', false)"
                @focus="updateFocused('firstName', true)"
              />
              <Message v-if="errors.firstName" severity="error"> {{ errors.firstName }}</Message>
            </div>
            <div class="field">
              <label for="lastName">Last name</label>
              <InputText
                id="lastName"
                v-model="lastName"
                :class="(!lastName || errors.lastName) && 'p-invalid'"
                data-testid="user-edit-lastname"
                type="text"
                v-bind="lastNameAttrs"
                @blur="updateFocused('lastName', false)"
                @focus="updateFocused('lastName', true)"
              />
              <Message v-if="errors.lastName" severity="error"> {{ errors.lastName }}</Message>
            </div>
            <div class="field">
              <label for="email1">Email address</label>
              <div class="flex flex-row items-center gap-4">
                <InputText
                  id="email1"
                  v-model="email1"
                  :class="(errors.email1 || !email1) && !focused.get('email1') && 'p-invalid'"
                  data-testid="user-edit-email1"
                  fluid
                  type="text"
                  v-bind="email1Attrs"
                  @blur="updateFocused('email1', false)"
                  @focus="updateFocused('email1', true)"
                />
                <IMFontAwesomeIcon v-if="!errors.email1 && emailIsNotRegistered" class="email-check" icon="fa-regular fa-circle-check" />
                <IMFontAwesomeIcon v-if="(errors.email1 && email1) || !emailIsNotRegistered" class="email-times" icon="fa-regular fa-circle-xmark" />
              </div>
              <Message v-if="!emailIsNotRegistered && email1 && !errors.email1" severity="error">Email address is already registered</Message>
              <Message v-if="emailIsNotRegistered && errors.email1" severity="error">{{ errors.email1 }}</Message>
            </div>
            <div class="field">
              <label for="email2">Confirm email address</label>
              <InputText
                id="email2"
                v-model="email2"
                :class="errors.email2 && !focused.get('email2') && 'p-invalid'"
                data-testid="user-edit-email2"
                fluid
                type="text"
                v-bind="email2Attrs"
                @blur="updateFocused('email2', false)"
                @focus="updateFocused('email2', true)"
              />
              <Message v-if="errors.email2" severity="error"> {{ errors.email2 }}</Message>
            </div>
            <PasswordInputs
              v-if="showPasswordEdit"
              old-password-required
              test-id="user-edit-password-"
              @update:oldPassword="setOldPassword"
              @update:password="setNewPassword"
              @update:arePasswordsValid="setIsNewPasswordValid"
            />
            <div class="flex flex-row items-center justify-between gap-4">
              <Button
                v-if="!showPasswordEdit"
                class="password-edit p-button-secondary"
                data-testid="user-edit-password-change-button"
                label="Change password"
                @click="editPasswordClicked(true)"
              />
              <Button
                v-else
                class="password-edit p-button-secondary"
                data-testid="user-edit-password-change-cancel-button"
                label="Cancel password edit"
                @click="editPasswordClicked(false)"
              />
              <Button class="form-reset p-button-warning" data-testid="user-edit-reset-changes-button" label="Reset changes" type="button" @click="resetForm" />
              <Button
                :disabled="buttonDisabled"
                :loading="loading"
                class="user-edit"
                data-testid="user-edit-update-button"
                label="Update account"
                @click="onSubmit"
              />
            </div>
          </form>
        </div>
        <SecuritySettings v-if="activeItem === 1" />
        <AuthRoles v-if="activeItem === 2" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from "vue";
import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";
import { AuthService } from "@/services";
import AvatarWithSelector from "./AvatarWithSelector.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import AuthRoles from "@/components/auth/userDetails/AuthRoles.vue";
import SecuritySettings from "@/components/auth/userDetails/SecuritySettings.vue";
import { Avatars } from "@/constants";
import { verifyIsEmail, verifyIsFirstName, verifyIsLastName } from "@/helpers/UserMethods";
import { useRouter } from "vue-router";
import { CustomAlert, User } from "@/interfaces";
import { useUserStore } from "@/stores/userStore";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

const router = useRouter();
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const passwordOld = ref("");
const password = ref("");
const isNewPasswordValid = ref(false);
const username = ref("");
const selectedAvatar = ref(Avatars[0]);
const showPasswordEdit = ref(false);
const focused: Ref<Map<string, boolean>> = ref(new Map());
const loading = ref(false);
const activeItem = ref(0);
const emailIsNotRegistered = ref(true);
const buttonDisabled = ref(true);
const menuItems = ref([
  {
    label: "Personal details",
    icon: "fa-solid fa-user",
    class: "details-tab",
    command: () => {
      activeItem.value = 0;
    }
  },
  {
    label: "Security",
    icon: "fa-solid fa-user-lock",
    class: "security-tab",
    command: () => {
      activeItem.value = 1;
    }
  },
  {
    label: "Authorisation roles",
    icon: "fa-solid fa-shield-halved",
    class: "roles-tab",
    command: () => {
      activeItem.value = 2;
    }
  }
]);

onMounted(() => {
  if (currentUser.value && isLoggedIn.value) {
    setFromCurrentUser();
  }
});

const { errors, defineField, handleSubmit, setValues } = useForm({
  validationSchema: yup.object({
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
  })
});

const [firstName, firstNameAttrs]: any = defineField("firstName");
const [lastName, lastNameAttrs]: any = defineField("lastName");
const [email1, email1Attrs]: any = defineField("email1");
const [email2, email2Attrs]: any = defineField("email2");

watch([firstName, lastName, email1, email2], async () => {
  await setButtonDisabled();
});

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function editPasswordClicked(result: boolean): void {
  showPasswordEdit.value = result;
}

function setOldPassword(oldPassword: string) {
  passwordOld.value = oldPassword;
}

function setNewPassword(newPassword: string) {
  password.value = newPassword;
}

function setIsNewPasswordValid(isValid: boolean) {
  isNewPasswordValid.value = isValid;
}

function swalert(icon: SweetAlertIcon, title: string, text: string) {
  return Swal.fire({
    icon: icon,
    title: title,
    text: text
  });
}

async function handleFieldsVerified(handlePasswordChange: boolean) {
  loading.value = true;
  const updatedUser = {
    id: currentUser.value?.id,
    username: username.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email1.value,
    password: "",
    avatar: selectedAvatar.value,
    roles: [],
    mfaStatus: []
  } as User;

  await AuthService.updateUser(updatedUser).then(async res => {
    if (res.status === 200) {
      if (!handlePasswordChange) {
        await swalert("success", "Success", "Account details updated successfully.").then(async () => {
          userStore.updateCurrentUser(res.user);
          await userStore.getAllFromUserDatabase();
          await router.push({ name: "UserDetails" });
        });
      } else {
        await submitPasswordChange(res);
      }
    } else if (res.status === 403 && res.message === "Confirm with email code") {
      await handleEmailChange();
    } else {
      await swalert("error", "Error", res.message);
    }
  });
  loading.value = false;
}

async function handleEmailChange() {
  await Swal.fire({
    title: "Verify your changes",
    text: "Enter the 6-digit code sent to you by no-reply@verificationemail.com.",
    input: "text",
    showCancelButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: (value: string) => {
      if (!value) return "Please enter the 6-digit code";
      else return null;
    }
  }).then(async (result: SweetAlertResult) => {
    if (result.value) {
      await AuthService.verifyEmail(result.value).then(async res => {
        if (res.status === 200) {
          await swalert("success", "Success", "Account details updated successfully.").then(async () => {
            await router.push({ name: "UserDetails" });
          });
        } else {
          await swalert("error", "Error", "Email verification failed, but user details updated successfully. " + res.message).then(() => {
            setFromCurrentUser();
          });
        }
      });
    } else {
      await swalert("error", "Error", "Email verification failed, but user details updated successfully. ").then(() => {
        setFromCurrentUser();
      });
    }
  });
}

async function submitPasswordChange(res: CustomAlert) {
  await AuthService.changePassword(passwordOld.value, password.value).then(async res2 => {
    if (res2.status === 200) await swalert("success", "Success", "User details and password successfully updated.");
    else await swalert("error", "Error", "Password update failed, but user details updated successfully. " + res2.message);
    userStore.updateCurrentUser(res.user);
    await userStore.getAllFromUserDatabase();
    await router.push({ name: "UserDetails" });
  });
}

const onSubmit = handleSubmit(async () => {
  if ((await userFieldsVerified()) && isNewPasswordValid.value) {
    await handleFieldsVerified(true);
  } else if (showPasswordEdit.value) {
    const message = "Password cannot be updated. Please check all fields are valid.";
    await swalert("error", "Error", message);
  } else if (!checkForChanges()) {
    await swalert("warning", "Nothing to update", "Your account details have not been updated.");
  } else if (await userFieldsVerified()) {
    await handleFieldsVerified(false);
  } else {
    await swalert("error", "Error", "Error with user form");
  }
});

async function userFieldsVerified(): Promise<boolean> {
  if (currentUser.value?.email != email1.value) {
    await verifyEmailIsNotRegistered(email1.value);
  } else emailIsNotRegistered.value = true;
  return !isObjectHasKeys(errors.value) && emailIsNotRegistered.value;
}

async function verifyEmailIsNotRegistered(email: string) {
  if (email && !errors.value.email1) emailIsNotRegistered.value = !(await AuthService.isEmailRegistered(email));
  else emailIsNotRegistered.value = true;
}

async function resetForm() {
  await Swal.fire({
    icon: "warning",
    title: "Warning",
    text: "Are you sure that you want to reset changes to this form? Any changes you have made will be lost.",
    showCancelButton: true,
    confirmButtonText: "Reset changes",
    reverseButtons: true
  }).then((result: SweetAlertResult) => {
    if (result.isConfirmed) {
      setFromCurrentUser();
    }
  });
}

function setFromCurrentUser() {
  if (currentUser.value) {
    username.value = currentUser.value?.username;
    selectedAvatar.value = currentUser.value.avatar;
    setValues({
      firstName: currentUser.value.firstName,
      lastName: currentUser.value.lastName,
      email1: currentUser.value.email,
      email2: currentUser.value.email
    });
  }
}

function updateAvatar(newValue: string): void {
  selectedAvatar.value = newValue;
}

async function setButtonDisabled(): Promise<void> {
  if ((await userFieldsVerified()) && !showPasswordEdit.value && checkForChanges()) {
    buttonDisabled.value = false;
  } else if (!((await userFieldsVerified()) && isNewPasswordValid.value)) {
    buttonDisabled.value = true;
  }
}

function checkForChanges(): boolean {
  return !(
    currentUser.value?.firstName === firstName.value &&
    currentUser.value?.lastName === lastName.value &&
    currentUser.value?.email === email1.value &&
    currentUser.value?.avatar === selectedAvatar.value
  );
}
</script>

<style scoped>
.user-edit,
.password-edit,
.form-reset {
  width: fit-content !important;
}

.form-reset {
  margin: 10px 0px;
}

.user-edit-form {
  max-width: 32em;
  display: flex;
  flex-flow: column nowrap;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.user-edit-card {
  padding: 1.25em 2em 0 2em;
}

.email-check {
  color: var(--p-green-500);
  font-size: 2em;
}

.email-times {
  color: var(--p-red-500);
  font-size: 2em;
}

.input-with-button {
  display: flex;
  flex-flow: row nowrap;
}
</style>
