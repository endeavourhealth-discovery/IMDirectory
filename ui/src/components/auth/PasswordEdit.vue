<template>
  <div v-if="currentUser" class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center password-edit-card">
      <template #header>
        <img id="user-icon" class="avatar-icon" :src="`/avatars/${currentUser.avatar}`" alt="avatar icon" aria-haspopup="true" aria-controls="overlay_menu" />
      </template>
      <template #title> Change password </template>
      <template #content>
        <div class="p-fluid flex flex-column justify-content-start password-edit-form">
          <div v-if="currentUser.username" class="field">
            <label for="userName">Username</label>
            <InputText data-testid="password-edit-username" class="p-text-capitalize" id="username" type="text" :value="currentUser.username" disabled />
          </div>
          <div class="field">
            <label for="passwordOld">Current password</label>
            <div class="input-with-button">
              <InputText data-testid="password-edit-password-old" id="passwordOld" :type="showPasswordOld ? 'text' : 'password'" v-model="passwordOld" />
              <Button :icon="showPasswordOld ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" @click="toggleShowPasswordOld" text />
            </div>
          </div>
          <div class="field">
            <label for="passwordNew1">New password</label>
            <div class="input-with-button">
              <InputText data-testid="password-edit-password-new1" id="passwordNew1" :type="showPasswordNew1 ? 'text' : 'password'" v-model="passwordNew1" />
              <Button :icon="showPasswordNew1 ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" @click="toggleShowPasswordNew1" text />
            </div>
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success"> Password strength: Strong </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="success"> Password strength: Medium </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'weak'" severity="warn"> Password strength: Weak </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && passwordNew1 !== ''" severity="error"> Invalid password </InlineMessage>
            <small id="password-help">
              Password must be a minimum length of 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special
              characters [!@#$%^&*].
            </small>
          </div>
          <div class="field">
            <label for="passwordNew2">Confirm new password</label>
            <div class="input-with-button">
              <InputText
                data-testid="password-edit-password-new2"
                id="passwordNew2"
                :type="showPasswordNew2 ? 'text' : 'password'"
                v-model="passwordNew2"
                @blur="setShowPassword2Message"
                @keyup="checkKey"
              />
              <Button :icon="showPasswordNew2 ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" @click="toggleShowPasswordNew2" text />
            </div>
            <InlineMessage v-if="showPassword2Message" severity="error"> New passwords do not match! </InlineMessage>
          </div>
          <div class="flex flex-row justify-content-center">
            <Button
              v-if="setButtonDisabled()"
              data-testid="password-edit-submit-disabled"
              class="user-edit"
              type="submit"
              label="Change password"
              disabled
              @click="handleEditSubmit"
            />
            <Button v-else class="user-edit" data-testid="password-edit-submit" type="submit" label="Change password" @click="handleEditSubmit" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { AuthService } from "@/services";
import { PasswordStrength } from "@im-library/enums";
import { verifyPasswordsMatch, checkPasswordStrength } from "@im-library/helpers/UserMethods";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const authReturnPath = computed(() => authStore.authReturnPath);

const passwordOld = ref("");
const passwordNew1 = ref("");
const passwordNew2 = ref("");
const showPassword2Message = ref(false);
const showPasswordOld = ref(false);
const showPasswordNew1 = ref(false);
const showPasswordNew2 = ref(false);

const passwordsMatch = computed(() => verifyPasswordsMatch(passwordNew1.value, passwordNew2.value));
const passwordStrength: Ref<PasswordStrength> = computed(() => checkPasswordStrength(passwordNew1.value));
const passwordStrengthOld: Ref<PasswordStrength> = computed(() => checkPasswordStrength(passwordOld.value));
const passwordDifferentFromOriginal = computed(() => passwordOld.value !== passwordNew1.value);

function toggleShowPasswordOld() {
  showPasswordOld.value = !showPasswordOld.value;
}

function toggleShowPasswordNew1() {
  showPasswordNew1.value = !showPasswordNew1.value;
}

function toggleShowPasswordNew2() {
  showPasswordNew2.value = !showPasswordNew2.value;
}

function setShowPassword2Message(): void {
  showPassword2Message.value = !passwordsMatch.value;
}

function handleEditSubmit(): void {
  if (
    passwordsMatch.value &&
    passwordStrength.value !== PasswordStrength.fail &&
    passwordStrengthOld.value !== PasswordStrength.fail &&
    passwordDifferentFromOriginal.value
  ) {
    AuthService.changePassword(passwordOld.value, passwordNew1.value).then(res => {
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
  } else if (!passwordDifferentFromOriginal.value) {
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
}

function checkKey(event: any): void {
  if (event.keyCode === 13) {
    handleEditSubmit();
  }
}

function setButtonDisabled(): boolean {
  return !(passwordStrength.value !== PasswordStrength.fail && passwordsMatch.value && passwordOld.value !== "");
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
