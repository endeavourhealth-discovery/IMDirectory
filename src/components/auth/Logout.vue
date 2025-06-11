<template>
  <div class="flex flex-row items-center">
    <Card class="justify-content-sm-around logout-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-arrow-right-from-bracket" class="icon-header" />
      </template>
      <template #title> Logout </template>
      <template #content>
        <div class="logout-form">
          <div class="field">
            <div class="p-text-left">Current User:</div>
          </div>
          <div class="field">
            <div v-if="currentUser" class="p-text-capitalize flex flex-row items-center">
              <img
                data-testid="logout-avatar-image"
                v-if="isLoggedIn"
                id="user-icon"
                class="avatar-icon"
                :src="`/avatars/${currentUser.avatar}`"
                alt="avatar icon"
                aria-haspopup="true"
                aria-controls="overlay_menu"
              />
              <p id="username-display">{{ currentUser.username }}</p>
            </div>
            <div v-if="!isLoggedIn" class="p-text-left p-text-capitalize">Guest</div>
          </div>
          <div class="flex flex-row justify-center">
            <Button data-testid="logout-submit" class="user-submit" label="Logout" @click="handleSubmit" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useRouter } from "vue-router";
import { CustomAlert } from "@/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { AuthService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const sharedStore = useSharedStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const authReturnPath = computed(() => authStore.authReturnPath);
const isPublicMode = computed(() => sharedStore.isPublicMode);

async function handleSubmit() {
  await Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "Confirm logout request",
    showCancelButton: true,
    confirmButtonText: "OK",
    reverseButtons: true
  }).then(async (result: SweetAlertResult) => {
    if (result.isConfirmed) {
      await AuthService.signOut().then(async (res: CustomAlert) => {
        if (res.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: res.message
          }).then(async () => {
            userStore.clearOptionalCookies();
            if (isPublicMode.value) {
              if (authReturnPath.value) {
                await router.push({ path: authReturnPath.value });
              } else {
                await router.push({ name: "LandingPage" });
              }
            } else {
              window.location.reload();
            }
          });
        } else {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message
          });
        }
      });
    }
  });
}
</script>

<style scoped>
.user-submit {
  width: fit-content !important;
}

.logout-form {
  max-width: 25em;
  min-width: 15em;
  display: flex;
  flex-flow: column nowrap;
}

.logout-card {
  padding: 0 2em;
}

.avatar-icon {
  width: 3rem;
  border: 1px solid lightgray;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}
</style>
