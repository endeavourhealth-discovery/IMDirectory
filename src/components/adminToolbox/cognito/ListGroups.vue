<template>
  <div id="cognito-list-groups" class="flex-1 overflow-auto">
    <DataTable :value="groups" :scrollable="true" scroll-height="flex" :autoLayout="true">
      <Column header="Group">
        <template #body="{ data }: any">
          {{ data }}
        </template>
      </Column>
      <Column>
        <template #body="{ data }: any">
          <div class="flex flex-row flex-nowrap items-center justify-center">
            <Button label="Details" @click="showGroupMembers(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import AdminService from "@/services/AdminService";
import { onMounted, Ref, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const groups: Ref<string[]> = ref([]);

onMounted(async () => {
  groups.value = await AdminService.getGroups();
});

async function showGroupMembers(group: string) {
  await router.push({ name: "CognitoUsersInGroup", params: { group: group } });
}
</script>

<style scoped></style>
