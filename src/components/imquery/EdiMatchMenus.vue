<template>
  <div>
    <Button
      class="p-button-square p-button-outlined edit-button"
      severity="info"
      :label="label"
      @click="toggleMenu"
      ref="editMenuTrigger"
      :style="{ padding: '2px 6px', lineHeight: '2' }"
    />
    <Menu ref="menu" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  icon: string;
  label: string;
  menuItems: Array<any>;
}>();
const menu = ref();
const toggleMenu = (event: MouseEvent) => {
  menu.value?.toggle(event);
};
</script>
