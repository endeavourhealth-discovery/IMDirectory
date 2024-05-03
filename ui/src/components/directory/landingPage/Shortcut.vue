<template>
  <div class="shortcut">
    <a :href="url" class="shortcut-container">
      <IMFontAwesomeIcon v-if="isArray(icon) || icon.startsWith('fa-')" class="shortcut-icon" :icon="icon" size="4x" :style="'color:' + color" />
      <img v-else :src="icon" alt="link-image" class="shortcut-image" />
      <p class="label">{{ label }}</p>
    </a>
  </div>
</template>

<script setup lang="ts">
import { isArray } from "lodash";
interface Props {
  icon: string | string[];
  label: string;
  url: string;
  color: string;
}
const props = defineProps<Props>();
</script>

<style scoped>
.shortcut-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.shortcut-image {
  height: 4rem;
}
</style>
