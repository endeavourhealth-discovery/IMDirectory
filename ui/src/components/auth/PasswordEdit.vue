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
          <PasswordInputs
            test-id="password-edit-password-"
            old-password-required
            @update:oldPassword="setOldPassword"
            @update:password="setNewPassword"
            @update:arePasswordsValid="setIsNewPasswordValid"
          />
          <div class="flex flex-row justify-content-center">
            <Button data-testid="password-edit-submit" class="user-edit" type="submit" label="Change password" :disabled="buttonDisabled" @click="onSubmit" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { AuthService } from "@/services";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useForm } from "vee-validate";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const authReturnPath = computed(() => authStore.authReturnPath);
const buttonDisabled = computed(() => setButtonDisabled());

const password = ref("");
const passwordOld = ref("");
const isNewPasswordValid = ref(false);

const { handleSubmit } = useForm({});

function getUrl(item: string): string {
  const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
  return url.href;
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

function setButtonDisabled(): boolean {
  return !isNewPasswordValid.value;
}

const onSubmit = handleSubmit(async () => {
  if (isNewPasswordValid.value) {
    AuthService.changePassword(passwordOld.value, password.value).then(res => {
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
  } else if (passwordOld.value === password.value) {
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
