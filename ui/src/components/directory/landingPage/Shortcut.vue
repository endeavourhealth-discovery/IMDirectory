<template>
  <div class="shortcut">
    <a v-if="url" :href="url" class="shortcut-container">
      <IMFontAwesomeIcon v-if="isArray(icon) || icon.startsWith('fa-')" class="shortcut-icon" :icon="icon" :size="size + 'x'" :style="'color:' + color" />
      <img v-else :src="icon" alt="link-image" class="shortcut-image" :style="'height:' + size + 'rem'" />
      <p class="label">{{ label }}</p>
    </a>
    <div v-if="command" class="shortcut-container command-shortcut" @click="command()">
      <IMFontAwesomeIcon v-if="isArray(icon) || icon.startsWith('fa-')" class="shortcut-icon" :icon="icon" :size="size + 'x'" :style="'color:' + color" />
      <img v-else :src="icon" alt="link-image" class="shortcut-image" :style="'height:' + size + 'rem'" />
      <p class="label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArray } from "lodash";
interface Props {
  icon: string | string[];
  label: string;
  url?: string;
  command?: Function;
  color: string;
  size: number;
}
const props = defineProps<Props>();
</script>

<style scoped>
.shortcut-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.command-shortcut {
  text-decoration: none;
  color: #2196f3;
  cursor: pointer;
}
</style>
