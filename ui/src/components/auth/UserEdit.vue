<template>
  <div class="flex flex-row">
    <div class="menu-container"><TieredMenu :model="menuItems" /></div>
    <Card class="flex flex-column justify-content-sm-around align-items-center user-edit-card">
      <template #header>
        <h1>Edit my account</h1>
        <avatar-with-selector :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
      </template>
      <template #title> {{ menuItems[activeItem].label }} </template>
      <template #content>
        <div v-if="activeItem === 0" class="p-fluid flex flex-column justify-content-start user-edit-form">
          <div class="field">
            <label for="username">Username</label>
            <InputText data-testid="user-edit-username" id="username" type="text" v-model="username" disabled />
            <small id="user-help">Username cannot currently be changed.</small>
          </div>
          <div class="field">
            <label for="firstName">First name</label>
            <InputText
              data-testid="user-edit-username"
              id="firstName"
              type="text"
              v-model="firstName"
              @focus="updateFocused('firstName', true)"
              @blur="updateFocused('firstName', false)"
              :class="(!firstName || !firstNameVerified) && 'p-invalid'"
            />
            <InlineMessage v-if="!firstNameVerified && firstName && !focused.get('firstName')" severity="error">
              First name contains unexpected characters. Letters, apostrophes, and hyphens only allowed e.g."Mary-Anne".
            </InlineMessage>
            <InlineMessage v-if="!firstName" severity="error"> First name is required. </InlineMessage>
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <InputText
              data-testid="user-edit-lastname"
              id="lastName"
              type="text"
              v-model="lastName"
              @focus="updateFocused('lastName', true)"
              @blur="updateFocused('lastName', false)"
              :class="(!lastName || !lastNameVerified) && 'p-invalid'"
            />
            <InlineMessage v-if="!lastNameVerified && lastName && !focused.get('lastName')" severity="error">
              Last name must have a minimum of two letters and only contain letters, apostrophes, and hyphens e.g."O'Keith-Smith".
            </InlineMessage>
            <InlineMessage v-if="!lastName" severity="error"> Last name is required. </InlineMessage>
          </div>
          <div class="field">
            <label for="email1">Email address</label>
            <div class="flex flex-row align-items-center">
              <InputText
                data-testid="user-edit-email1"
                id="email1"
                type="text"
                v-model="email1"
                @focus="updateFocused('email1', true)"
                @blur="updateFocused('email1', false)"
                :class="(!email1Verified || !email1) && !focused.get('email1') && 'p-invalid'"
              />
              <IMFontAwesomeIcon v-if="email1Verified" icon="fa-regular fa-circle-check" class="email-check" />
              <IMFontAwesomeIcon v-if="!email1Verified && email1" icon="fa-regular fa-circle-xmark" class="email-times" />
            </div>
            <InlineMessage v-if="!email1" severity="error"> Email is required. </InlineMessage>
          </div>
          <div class="field">
            <label for="email2">Confirm email address</label>
            <InputText
              data-testid="user-edit-email2"
              id="email2"
              type="text"
              v-model="email2"
              @focus="updateFocused('email2', true)"
              @blur="updateFocused('email2', false)"
              :class="!emailsMatch && !focused.get('email2') && 'p-invalid'"
            />
            <InlineMessage v-if="!emailsMatch && !focused.get('email2')" severity="error"> Email addresses do not match! </InlineMessage>
          </div>
          <div v-if="showPasswordEdit" class="field">
            <label for="passwordOld">Current password</label>
            <InputText data-testid="user-edit-password-old" id="passwordOld" type="password" v-model="passwordOld" />
          </div>
          <div v-if="showPasswordEdit" class="field">
            <label for="passwordNew1">New password</label>
            <InputText
              data-testid="user-edit-password-new1"
              id="passwordNew1"
              type="password"
              v-model="passwordNew1"
              :class="passwordStrength === 'fail' && !focused.get('passwordNew1') && 'p-invalid'"
            />
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success"> Password strength: Strong </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="success"> Password strength: Medium </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'weak'" severity="warn"> Password strength: Weak </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && passwordNew1 !== ''" severity="error"> Invalid password </InlineMessage>
            <small id="password-help">
              Password must be a minimum length of 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special
              characters [!@#$%^&*].
            </small>
          </div>
          <div v-if="showPasswordEdit" class="field">
            <label for="passwordNew2">Confirm new password</label>
            <InputText
              data-testid="user-edit-password-new2"
              id="passwordNew2"
              type="password"
              v-model="passwordNew2"
              @focus="updateFocused('password2', true)"
              @blur="updateFocused('password2', false)"
              :class="!passwordsMatch && passwordNew2 && !focused.get('passwordNew2') && 'p-invalid'"
            />
            <InlineMessage v-if="!passwordsMatch && focused.get('password2') === false" severity="error"> New passwords do not match </InlineMessage>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <Button
              data-testid="user-edit-password-change-button"
              v-if="!showPasswordEdit"
              class="password-edit p-button-secondary"
              type="submit"
              label="Change password"
              @click="editPasswordClicked(true)"
            />
            <Button
              data-testid="user-edit-password-change-cancel-button"
              v-else
              class="password-edit p-button-secondary"
              type="submit"
              label="Cancel password edit"
              @click="editPasswordClicked(false)"
            />
            <Button data-testid="user-edit-reset-changes-button" class="form-reset p-button-warning" type="button" label="Reset changes" @click="resetForm" />
            <Button
              data-testid="user-edit-update-disabled-button"
              v-if="setButtonDisabled()"
              class="user-edit"
              type="submit"
              label="Update account"
              disabled
              @click="handleEditSubmit"
            />
            <Button
              data-testid="user-edit-update-button"
              v-else
              class="user-edit"
              type="submit"
              label="Update account"
              @click="handleEditSubmit"
              :loading="loading"
            />
          </div>
        </div>
        <SecuritySettings v-if="activeItem === 1" />
        <AuthRoles v-if="activeItem === 2" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";
import { AuthService } from "@/services";
import AvatarWithSelector from "./AvatarWithSelector.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import AuthRoles from "@/components/auth/userDetails/AuthRoles.vue";
import SecuritySettings from "@/components/auth/userDetails/SecuritySettings.vue";
import { Avatars } from "@im-library/constants";
import { PasswordStrength } from "@im-library/enums";
import {
  verifyEmailsMatch,
  verifyIsEmail,
  verifyIsFirstName,
  verifyIsLastName,
  verifyPasswordsMatch,
  checkPasswordStrength
} from "@im-library/helpers/UserMethods";
import { useRouter } from "vue-router";
import { CustomAlert, User } from "@im-library/interfaces";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const username = ref("");
const firstName = ref("");
const lastName = ref("");
const email1 = ref("");
const email2 = ref("");
const passwordOld = ref("");
const passwordNew1 = ref("");
const passwordNew2 = ref("");
const selectedAvatar = ref(Avatars[0]);
const showPasswordEdit = ref(false);
const focused: Ref<Map<string, boolean>> = ref(new Map());
const loading = ref(false);
const activeItem = ref(0);
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

const email1Verified = computed(() => verifyIsEmail(email1.value));
const emailsMatch = computed(() => verifyEmailsMatch(email1.value, email2.value));
const passwordStrengthOld = computed(() => checkPasswordStrength(passwordOld.value));
const passwordStrength = computed(() => checkPasswordStrength(passwordNew1.value));
const passwordsMatch = computed(() => verifyPasswordsMatch(passwordNew1.value, passwordNew2.value));
const firstNameVerified = computed(() => verifyIsFirstName(firstName.value));
const lastNameVerified = computed(() => verifyIsLastName(lastName.value));

onMounted(() => {
  if (currentUser.value && isLoggedIn.value) {
    setFromCurrentUser();
  }
});

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function editPasswordClicked(result: boolean): void {
  if (result === false) {
    passwordOld.value = "";
    passwordNew1.value = "";
    passwordNew2.value = "";
  }
  showPasswordEdit.value = result;
}

function swalert(icon: SweetAlertIcon, title: string, text: string) {
  return Swal.fire({
    icon: icon,
    title: title,
    text: text
  });
}

function handleFieldsVerified(handlePasswordChange: boolean) {
  loading.value = true;
  const oldEmail = currentUser.value.email;
  const updatedUser = {
    id: currentUser.value.id,
    username: username.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email1.value,
    password: "",
    avatar: selectedAvatar.value,
    roles: [],
    mfaStatus: []
  } as User;

  AuthService.updateUser(updatedUser).then(res => {
    if (res.status === 200) {
      if (!handlePasswordChange) {
        if (oldEmail !== res.user?.email) {
          handleEmailChange(res);
        } else {
          swalert("success", "Success", "Account details updated successfully.").then(async () => {
            userStore.updateCurrentUser(res.user);
            await userStore.getAllFromUserDatabase();
            router.push({ name: "UserDetails" });
          });
        }
      } else {
        submitPasswordChange(res);
      }
    } else {
      swalert("error", "Error", res.message);
    }
  });
  loading.value = false;
}

function handleEmailChange(res: CustomAlert) {
  Swal.fire({
    title: "Verify your changes",
    text: "Enter the 6-digit code sent to you by no-reply@verificationemail.com.",
    input: "text",
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: (value: string) => {
      if (!value) return "Please enter the 6-digit code";
      else return null;
    }
  }).then((result: SweetAlertResult) => {
    if (result.value) {
      AuthService.verifyEmail(result.value).then(res => {
        if (res.status === 200) {
          swalert("success", "Success", "Account details updated successfully.").then(async () => {
            userStore.updateCurrentUser(res.user);
            await userStore.getAllFromUserDatabase();
            router.push({ name: "UserDetails" });
          });
        } else {
          swalert("error", "Error", "Email verification failed, but user details updated successfully. " + res.message);
        }
      });
    } else {
      swalert("error", "Error", "Email verification failed, but user details updated successfully. ");
    }
  });
}

function submitPasswordChange(res: CustomAlert) {
  AuthService.changePassword(passwordOld.value, passwordNew1.value).then(async res2 => {
    res2.status === 200
      ? swalert("success", "Success", "User details and password successfully updated.")
      : swalert("error", "Error", "Password update failed, but user details updated successfully. " + res2.message);
    userStore.updateCurrentUser(res.user);
    await userStore.getAllFromUserDatabase();
    router.push({ name: "UserDetails" });
  });
}

function handleEditSubmit(): void {
  if (userFieldsVerified() && passwordFieldsVerified()) {
    handleFieldsVerified(true);
  } else if (showPasswordEdit.value) {
    const message = !passwordDifferentFromOriginal()
      ? "New password can not be the same as the current password."
      : "Authentication failed. Please check your current password.";
    swalert("error", "Error", message);
  } else if (!checkForChanges()) {
    swalert("warning", "Nothing to update", "Your account details have not been updated.");
  } else if (userFieldsVerified()) {
    handleFieldsVerified(false);
  } else {
    swalert("error", "Error", "Error with user form");
  }
}

function userFieldsVerified(): boolean {
  if (email1Verified.value && emailsMatch.value && firstNameVerified.value && lastNameVerified.effect && selectedAvatar.value) {
    return true;
  } else {
    return false;
  }
}

function passwordFieldsVerified(): boolean {
  if (
    showPasswordEdit.value &&
    passwordsMatch.value &&
    passwordStrength.value !== PasswordStrength.fail &&
    passwordStrengthOld.value !== PasswordStrength.fail &&
    passwordDifferentFromOriginal()
  ) {
    return true;
  } else {
    return false;
  }
}

function passwordDifferentFromOriginal(): boolean {
  return passwordOld.value !== passwordNew1.value;
}

function resetForm(): void {
  Swal.fire({
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
  username.value = currentUser.value.username;
  firstName.value = currentUser.value.firstName;
  lastName.value = currentUser.value.lastName;
  email1.value = currentUser.value.email;
  email2.value = currentUser.value.email;
  selectedAvatar.value = currentUser.value.avatar;
}

function updateAvatar(newValue: string): void {
  selectedAvatar.value = newValue;
}

function setButtonDisabled(): boolean {
  if (userFieldsVerified() && !showPasswordEdit.value && checkForChanges()) {
    return false;
  } else if (userFieldsVerified() && passwordFieldsVerified()) {
    return false;
  } else {
    return true;
  }
}

function checkForChanges(): boolean {
  if (
    currentUser.value.firstName === firstName.value &&
    currentUser.value.lastName === lastName.value &&
    currentUser.value.email === email1.value &&
    currentUser.value.avatar === selectedAvatar.value
  ) {
    return false;
  } else {
    return true;
  }
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
}

.user-edit-card {
  padding: 0 2em;
}
.email-check {
  color: var(--green-500);
  font-size: 2em;
}
.email-times {
  color: var(--red-500);
  font-size: 2em;
}
</style>
