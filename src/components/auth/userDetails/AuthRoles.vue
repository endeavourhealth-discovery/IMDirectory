<template>
  <div class="roles-container">
    <div class="roles-content">
      <p>Authorisation roles active for your account</p>
      <DataTable
        id="roles-table"
        v-if="currentUser"
        :value="
          currentUser.roles.map((role: string) => {
            return { role: role };
          })
        "
      >
        <template #empty> No roles </template>
        <Column field="role" header="Role" />
      </DataTable>
      <!-- <Button label="Request role" @click="handleEditRole" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();

const currentUser = computed(() => userStore.currentUser);
</script>

<style scoped>
.roles-container {
  width: 32rem;
}

.roles-content {
  padding: 1rem;
}
</style>
