<template>
  <div v-if="currentUser" class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center password-edit-card">
      <template #header>
        <img id="user-icon" class="avatar-icon" :src="getUrl(currentUser.avatar)" alt="avatar icon" aria-haspopup="true" aria-controls="overlay_menu" />
      </template>
      <template #title> Change password </template>
      <template #content>
        <form @submit="onSubmit" class="p-fluid flex flex-column justify-content-start password-edit-form">
          <div v-if="currentUser.username" class="field">
            <label for="userName">Username</label>
            <InputText data-testid="password-edit-username" class="p-text-capitalize" id="username" type="text" :value="currentUser.username" disabled />
          </div>
          <div class="field">
            <label for="passwordOld">Current password</label>
            <div class="input-with-button">
              <Password
                v-bind="passwordOld"
                :feedback="false"
                toggleMask
                :input-props="{ 'data-testid': 'password-edit-password-old', autofocus: true }"
                data-testid="password-edit-password-old-container"
                id="passwordOld"
              />
            </div>
          </div>
          <div class="field">
            <label for="passwordNew1">New password</label>
            <div class="input-with-button">
              <Password
                v-bind="passwordNew1"
                toggleMask
                :input-props="{ 'data-testid': 'password-edit-password-new1' }"
                data-testid="password-edit-password-new1-container"
                id="passwordNew1"
                :overlayVisible="true"
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
            </div>
            <InlineMessage v-if="errors.passwordNew1 && passwordNew1.modelValue !== ''" severity="info"> {{ errors.passwordNew1 }} </InlineMessage>
          </div>
          <div class="field">
            <label for="passwordNew2">Confirm new password</label>
            <div class="input-with-button">
              <Password
                v-bind="passwordNew2"
                toggleMask
                :feedback="false"
                :input-props="{ 'data-testid': 'password-edit-password-new2' }"
                data-testid="password-edit-password-new2-container"
                id="passwordNew2"
              />
            </div>
            <InlineMessage v-if="!isMatchingPassword() && passwordNew2.modelValue" severity="error"> {{ errors.passwordNew2 }}</InlineMessage>
          </div>
          <div class="flex flex-row justify-content-center">
            <Button
              v-if="setButtonDisabled()"
              data-testid="password-edit-submit-disabled"
              class="user-edit"
              type="submit"
              label="Change password"
              disabled
              @click="onSubmit"
            />
            <Button v-else class="user-edit" data-testid="password-edit-submit" type="submit" label="Change password" @click="onSubmit" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, watch } from "vue";
import { AuthService } from "@/services";
import { PasswordStrength } from "@im-library/enums";
import { checkPasswordStrength, verifyPasswordsMatch } from "@im-library/helpers/UserMethods";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import Password from "primevue/password";
import * as yup from "yup";
import { useForm } from "vee-validate";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const authReturnPath = computed(() => authStore.authReturnPath);

const schema = yup.object({
  passwordOld: yup.string().required(),
  passwordNew1: yup
    .string()
    .required()
    .test("isValidPassword", "Password too weak", async () => isValidPassword()),
  passwordNew2: yup
    .string()
    .required()
    .test("isMatchingPassword", "Passwords do not match", async () => isMatchingPassword())
});

const { defineComponentBinds, handleSubmit, resetForm, errors, setFieldValue } = useForm({
  validationSchema: schema
});

const passwordOld = defineComponentBinds("passwordOld");
const passwordNew1 = defineComponentBinds("passwordNew1");
const passwordNew2 = defineComponentBinds("passwordNew2");

const onSubmit = handleSubmit(async () => {
  if (isMatchingPassword() && isValidPassword() && passwordOld.value.modelValue !== passwordNew1.value.modelValue) {
    AuthService.changePassword(passwordOld.value.modelValue, passwordNew1.value.modelValue).then(res => {
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password successfully updated"
        }).then(() => {
          if (authReturnPath.value) {
            router.push({ path: authReturnPath.value });
          } else {
            router.push({ name: "UserDetails" });
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message
        });
      }
    });
  } else if (passwordOld.value.modelValue === passwordNew1.value.modelValue) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "New password can not be the same as the current password."
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error updating password. Authentication error or new passwords do not match."
    });
  }
});

function getUrl(item: string): string {
  const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
  return url.href;
}

function hasCurrentPassword() {
  return !!passwordOld.value.modelValue;
}

function isValidPassword() {
  let isValid = false;
  if (
    checkPasswordStrength(passwordNew1.value.modelValue) === PasswordStrength.medium ||
    checkPasswordStrength(passwordNew1.value.modelValue) === PasswordStrength.strong
  ) {
    isValid = true;
  }
  return isValid;
}

function isMatchingPassword(): boolean {
  let isValid = false;
  if (verifyPasswordsMatch(passwordNew1.value.modelValue, passwordNew2.value.modelValue)) {
    isValid = true;
  }
  return isValid;
}

function setButtonDisabled(): boolean {
  return !(isValidPassword() && isMatchingPassword() && !errors.value.passwordOld);
}
</script>

<style scoped>
.password-edit-card {
  padding: 0 2em;
}

.user-edit {
  width: fit-content !important;
}

.password-edit-form {
  max-width: 32em;
}

.avatar-icon {
  margin-block-start: 0.5rem;
  width: 10rem;
  border: 1px solid lightgray;
  border-radius: 50%;
}

.input-with-button {
  display: flex;
  flex-flow: row nowrap;
}
</style>
