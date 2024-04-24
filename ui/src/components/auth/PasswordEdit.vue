<template>
  <div v-if="currentUser" class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center password-edit-card">
      <template #header>
        <img id="user-icon" class="avatar-icon" :src="getUrl(currentUser.avatar)" alt="avatar icon" aria-haspopup="true" aria-controls="overlay_menu" />
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
              <Password
                v-model="passwordOld"
                :feedback="false"
                toggleMask
                :input-props="{ 'data-testid': 'password-edit-password-old' }"
                data-testid="password-edit-password-old-container"
                id="passwordOld"
              />
            </div>
          </div>
          <div class="field">
            <label for="passwordNew1">New password</label>
            <div class="input-with-button">
              <Password
                v-model="passwordNew1"
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
                  <p class="mt-2">Password <span :style="'font-weight: bold;'"> must </span>contain:</p>
                  <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                    <li>At least one lowercase</li>
                    <li>At least one uppercase</li>
                    <li>At least one numeric</li>
                    <li>Minimum 8 characters</li>
                  </ul>
                </template>
              </Password>
            </div>
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success"> Password strength: Strong </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="warn"> Password strength: Medium </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && passwordNew1 !== ''" severity="error"> Password strength: Weak </InlineMessage>
          </div>
          <div class="field">
            <label for="passwordNew2">Confirm new password</label>
            <div class="input-with-button">
              <Password
                v-model="passwordNew2"
                toggleMask
                :feedback="false"
                :input-props="{ 'data-testid': 'password-edit-password-new2' }"
                data-testid="password-edit-password-new2-container"
                id="passwordNew2"
              />
            </div>
            <InlineMessage v-if="!passwordsMatch && passwordNew2 !== ''" severity="error"> New passwords do not match! </InlineMessage>
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
import Password from "primevue/password";

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
    passwordStrength.value === PasswordStrength.strong &&
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

function getUrl(item: string): string {
  const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
  return url.href;
}

function checkKey(event: any): void {
  if (event.keyCode === 13) {
    handleEditSubmit();
  }
}

function setButtonDisabled(): boolean {
  return !(passwordStrength.value === PasswordStrength.strong && passwordsMatch.value && passwordOld.value !== "");
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
