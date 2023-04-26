<template>
  <div class="flex flex-row align-items-center">
    <Card class="flex flex-column justify-content-sm-around align-items-center user-details-card">
      <template #header>
        <img data-testid="user-details-avatar" id="selected-avatar" :src="getUrl(currentUser.avatar)" alt="avatar icon" />
      </template>
      <template #title> My account details </template>
      <template #content>
        <div v-if="isLoggedIn" class="p-fluid flex flex-column justify-content-start user-details-form">
          <div class="field">
            <label for="username">Username</label>
            <InputText data-testid="user-details-username" id="username" type="text" :value="currentUser.username" disabled />
          </div>
          <div class="field">
            <label for="firstName">First name</label>
            <InputText data-testid="user-details-firstname" id="firstName" type="text" :value="currentUser.firstName" disabled />
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <InputText data-testid="user-details-lastname" id="lastName" type="text" :value="currentUser.lastName" disabled />
          </div>
          <div class="field">
            <label for="email">Email address</label>
            <InputText data-testid="user-details-email" id="email" type="text" :value="currentUser.email" disabled />
          </div>
          <div class="flex flex-row justify-content-center">
            <Button data-testid="user-details-submit" class="user-edit" type="submit" label="Edit" @click="handleEditClicked" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/rootStore";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const rootStore = useRootStore();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

function handleEditClicked(): void {
  router.push({ name: "UserEdit" });
}

function getUrl(item: string): string {
  const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
  return url.href;
}
</script>

<style scoped>
.user-edit {
  width: fit-content !important;
}

.user-details-form {
  width: 32em;
}

.user-details-card {
  padding: 0 2em;
}

#selected-avatar {
  margin: 1.5rem;
  width: 10rem;
  border: 1px solid lightgray;
  border-radius: 50%;
}
</style>
