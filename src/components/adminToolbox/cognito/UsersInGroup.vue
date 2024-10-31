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
            <Button label="Details" />
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

interface Props {
  group: string;
}

const props = defineProps<Props>();

const router = useRouter();

const users: Ref<string[]> = ref([]);

onMounted(async () => {
  if (props.group) users.value = await AdminService.getUsersInGroup(props.group);
});
</script>

<style scoped></style>
