<template>
  <div class="flex align-items-baseline">
    <Button v-if="canClearPath" @click="emit('onClearPath')" class="builder-button" :severity="'danger'" icon="fa-solid fa-x" text />
    <div v-if="path.path">{{ path.path?.[0].name }} -> {{ path.typeOf?.name }} . {{ path.where?.[0]?.name }}</div>
    <div v-else>{{ path.where?.[0]?.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import { onMounted, watch } from "vue";
interface Props {
  path: Match;
  canClearPath?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  canClearPath: true
});
const emit = defineEmits({ onClearPath: () => true });
</script>

<style scoped></style>
