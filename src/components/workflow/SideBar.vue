<template>
  <div id="workflow-sidebar">
    <Menu :model="items">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon"></span>
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon"></span>
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/userStore";
import { MenuItem } from "primevue/menuitem";
import { computed, onMounted, Ref, ref } from "vue";

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

const items: Ref<MenuItem[]> = ref([]);

onMounted(() => {
  setItems();
});

function setItems() {
  items.value = [
    {
      label: "My tasks",
      icon: "fa-duotone fa-user-check",
      command: async () => {
        await router.push({ name: "MyWorkflows", params: { taskType: "createdBy" } });
      }
    },
    {
      label: "My assigned tasks",
      icon: "fa-duotone fa-user-magnifying-glass",
      command: async () => await router.push({ name: "MyWorkflows", params: { taskType: "assignedTo" } })
    }
  ];
  if (isAdmin.value)
    items.value.push({
      label: "Unassigned tasks",
      icon: "fa-duotone fa-clipboard-question",
      command: async () => await router.push({ name: "MyWorkflows", params: { taskType: "unassigned" } })
    });
}
</script>

<style scoped>
#workflow-sidebar {
  flex: 0 0 auto;
  width: 30%;
  height: 100%;
  border-right: 1px solid var(--p-menu-border-color);
}
</style>
