<template>
  <div v-if="currentUser" class="flex flex-row items-center">
    <Card class="justify-content-sm-around password-edit-card flex flex-col items-center">
      <template #header>
        <img id="user-icon" :src="`/avatars/${currentUser.avatar}`" alt="avatar icon" aria-controls="overlay_menu" aria-haspopup="true" class="avatar-icon" />
      </template>
      <template #title> Change password</template>
      <template #content>
        <form class="password-edit-form flex flex-col justify-start" @submit="onSubmit">
          <div v-if="currentUser.username" class="field">
            <label for="userName">Username</label>
            <InputText id="username" :value="currentUser.username" class="p-text-capitalize" data-testid="password-edit-username" disabled type="text" />
          </div>
          <PasswordInputs
            old-password-required
            test-id="password-edit-password-"
            @update:oldPassword="setOldPassword"
            @update:password="setNewPassword"
            @update:arePasswordsValid="setIsNewPasswordValid"
          />
          <div class="mt-2 flex flex-row justify-center">
            <Button :disabled="buttonDisabled" class="user-edit" data-testid="password-edit-submit" label="Change password" @click="onSubmit" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
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
  padding: 1.25rem 2em 0 2em;
}

.user-edit {
  min-width: fit-content !important;
}

.password-edit-form {
  display: flex;
  flex-flow: column nowrap;
  min-width: 20rem;
}

.field {
  display: flex;
  flex-flow: column nowrap;
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
