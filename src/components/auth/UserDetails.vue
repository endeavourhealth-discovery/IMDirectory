<template>
  <div class="flex flex-row">
    <div class="menu-container"><TieredMenu :model="menuItems" /></div>
    <Card v-if="currentUser" class="justify-content-sm-around user-details-card flex flex-col items-center">
      <template #header>
        <h1>My account</h1>
        <img data-testid="user-details-avatar" id="selected-avatar" :src="`/avatars/${currentUser.avatar}`" alt="avatar icon" />
      </template>
      <template #title> {{ menuItems[activeItem].label }} </template>
      <template #content>
        <div v-if="activeItem === 0" class="user-details-form flex flex-col justify-start">
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
          <div class="flex flex-row justify-center">
            <Button data-testid="user-details-submit" class="user-edit" label="Edit" @click="handleEditClicked" />
          </div>
        </div>
        <SecuritySettings v-if="activeItem === 1" />
        <AuthRoles v-if="activeItem === 2" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import AuthRoles from "@/components/auth/userDetails/AuthRoles.vue";
import SecuritySettings from "@/components/auth/userDetails/SecuritySettings.vue";

const router = useRouter();
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
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

function handleEditClicked(): void {
  router.push({ name: "UserEdit" });
}
</script>

<style scoped>
.user-edit {
  width: fit-content !important;
}

.user-details-form {
  width: 32em;
  display: flex;
  flex-flow: column nowrap;
}

.field {
  display: flex;
  flex-flow: column nowrap;
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
