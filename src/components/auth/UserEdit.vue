<template>
  <div v-if="isLoggedIn" class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center user-edit-card">
      <template #header>
        <avatar-with-selector :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
      </template>
      <template #title> Edit my account </template>
      <template #content>
        <div class="p-fluid flex flex-column justify-content-start user-edit-form">
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
            />
            <InlineMessage v-if="!firstNameVerified && focused.get('firstName') === false" severity="error">
              First name contains unexpected characters. A-Z and hyphens only allowed e.g."Mary-Anne".
            </InlineMessage>
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
            />
            <InlineMessage v-if="!lastNameVerified && focused.get('lastName') === false" severity="error">
              Last name contains unexpected characters. A-Z, apostropies and hyphens only allowed e.g."O'Keith-Smith".
            </InlineMessage>
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
              />
              <i v-if="email1Verified && focused.get('email1') === false" class="pi pi-check-circle email-check" aria-hidden="true" />
              <i v-if="!email1Verified && focused.get('email1') === false" class="pi pi-times-circle email-times" aria-hidden="true" />
            </div>
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
            />
            <InlineMessage v-if="!emailsMatch && focused.get('email2') === false" severity="error"> Email addresses do not match! </InlineMessage>
          </div>
          <div v-if="showPasswordEdit" class="field">
            <label for="passwordOld">Current password</label>
            <InputText data-testid="user-edit-password-old" id="passwordOld" type="password" v-model="passwordOld" />
          </div>
          <div v-if="showPasswordEdit" class="field">
            <label for="passwordNew1">New password</label>
            <InputText data-testid="user-edit-password-new1" id="passwordNew1" type="password" v-model="passwordNew1" />
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
            <Button data-testid="user-edit-update-button" v-else class="user-edit" type="submit" label="Update account" @click="handleEditSubmit" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, Ref } from "vue";
import { mapState, useStore } from "vuex";
import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";
import { AuthService } from "@/im_library/services";
import AvatarWithSelector from "./AvatarWithSelector.vue";
import { Avatars } from "@/im_library/constants";
import { PasswordStrength } from "@/im_library/enums";
import { verifyEmailsMatch, verifyIsEmail, verifyIsName, verifyPasswordsMatch, checkPasswordStrength } from "@/im_library/helpers/modules/UserMethods";
import { User } from "@/im_library/models";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();
const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);

let username = ref("");
let firstName = ref("");
let lastName = ref("");
let email1 = ref("");
let email2 = ref("");
let passwordOld = ref("");
let passwordNew1 = ref("");
let passwordNew2 = ref("");
let selectedAvatar = ref(Avatars[0]);
let avatarOptions = [...Avatars];
let showPasswordEdit = ref(false);
let focused: Ref<Map<string, boolean>> = ref(new Map());

const email1Verified = computed(() => verifyIsEmail(email1.value));
const emailsMatch = computed(() => verifyEmailsMatch(email1.value, email2.value));
const passwordStrengthOld = computed(() => checkPasswordStrength(passwordOld.value));
const passwordStrength = computed(() => checkPasswordStrength(passwordNew1.value));
const passwordsMatch = computed(() => verifyPasswordsMatch(passwordNew1.value, passwordNew2.value));
const firstNameVerified = computed(() => verifyIsName(firstName.value));
const lastNameVerified = computed(() => verifyIsName(lastName.value));

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
  const oldEmail = currentUser.value.email;
  const updatedUser = new User(username.value, firstName.value, lastName.value, email1.value, "", selectedAvatar.value, []);
  updatedUser.setId(currentUser.value.id);
  AuthService.updateUser(updatedUser).then(res => {
    if (res.status === 200) {
      if (!handlePasswordChange) {
        if (oldEmail !== res.user?.email) {
          Swal.fire({
            title: "Verify your changes",
            text: "Enter the 6-digit code sent to you by no-reply@verificationemail.com.",
            input: "text",
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value: boolean) => {
              if (!value) return "Please enter the 6-digit code";
              else return null;
            }
          }).then((result: SweetAlertResult) => {
            if (result.value) {
              AuthService.verifyEmail(result.value).then(res => {
                if (res.status === 200) {
                  swalert("success", "Success", "Account details updated successfully.").then(() => {
                    store.commit("updateCurrentUser", res.user);
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
        } else {
          swalert("success", "Success", "Account details updated successfully.").then(() => {
            store.commit("updateCurrentUser", res.user);
            router.push({ name: "UserDetails" });
          });
        }
      } else {
        AuthService.changePassword(passwordOld.value, passwordNew1.value).then(res2 => {
          res2.status === 200
            ? swalert("success", "Success", "User details and password successfully updated.")
            : swalert("error", "Error", "Password update failed, but user details updated successfully. " + res2.message);
          store.commit("updateCurrentUser", res.user);
          router.push({ name: "UserDetails" });
        });
      }
    } else {
      swalert("error", "Error", res.message);
    }
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
  return passwordOld.value !== passwordNew1.value ? true : false;
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
  color: #439446;
  font-size: 2em;
}
.email-times {
  color: #e60017;
  font-size: 2em;
}
</style>
