<template>
  <div id="cognito-list-users" class="flex-1 overflow-auto">
    <DataTable :value="users" :scrollable="true" scroll-height="flex" :autoLayout="true">
      <Column header="Username">
        <template #body="{ data }: any">
          {{ data }}
        </template>
      </Column>
      <Column>
        <template #body="{ data }: any">
          <div class="flex flex-row flex-nowrap items-center justify-center">
            <Button label="Details" @click="goToUserDetails(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import AdminService from "@/services/AdminService";
import { User } from "@/interfaces";
import { onMounted, Ref, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const users: Ref<string[]> = ref([]);

onMounted(async () => {
  users.value = await AdminService.getUsers();
});

async function goToUserDetails(username: string) {
  await router.push({ name: "CognitoUserDetails", params: { username: username } });
}
</script>

<style scoped></style>
