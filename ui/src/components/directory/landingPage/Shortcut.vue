<template>
  <div v-if="visible" class="shortcut">
    <Button v-if="url" link as="a" :href="url" :target="newTab ? '_blank' : ''" class="shortcut-container">
      <IMFontAwesomeIcon
        v-if="isArray(icon) || icon.startsWith('fa-')"
        class="shortcut-icon"
        :icon="icon"
        :size="size + 'x'"
        :style="'color:' + color + ';width: ' + (size + 1) + 'rem'"
      />
      <img v-else :src="icon" alt="link-image" class="shortcut-image" :style="'height:' + size + 'rem;width:' + (size + 1) + 'rem'" />
      <p class="label" :style="'width:' + (size + 1) + 'rem'">{{ label }}</p>
    </Button>
    <Button v-if="command" link as="a" class="shortcut-container command-shortcut" @click="command()">
      <IMFontAwesomeIcon
        v-if="isArray(icon) || icon.startsWith('fa-')"
        class="shortcut-icon"
        :icon="icon"
        :size="size + 'x'"
        :style="'color:' + color + ';width:' + (size + 1) + 'rem'"
      />
      <img v-else :src="icon" alt="link-image" class="shortcut-image" :style="'height:' + size + 'rem;' + 'width:' + (size + 1) + 'rem'" />
      <p v-tooltip.bottom="{ value: label }" class="label" :style="'width:' + (size + 2) + 'rem'">{{ label }}</p>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { isArray } from "lodash-es";
interface Props {
  icon: string | string[];
  label: string;
  url?: string;
  command?: Function;
  color: string;
  size: number;
  newTab?: boolean;
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  newTab: false,
  visible: true
});
</script>

<style scoped>
.shortcut-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.shortcut-icon {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.label {
  text-overflow: ellipsis;
  text-align: center;
  overflow: hidden;
}
</style>
