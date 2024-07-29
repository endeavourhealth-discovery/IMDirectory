<template>
  <div class="flex align-items-baseline path-display-container" v-if="isArrayHasLength(path.where)">
    <span class="title"><strong>Path:&nbsp;</strong></span>
    <div v-if="path.path && path.typeOf">{{ path.path?.[0].name }} -> {{ path.typeOf?.name }} . {{ path.where?.[0]?.name }}</div>
    <div v-else-if="path.where?.[0]?.name">{{ toTitleCase(path.where?.[0]?.name) }}</div>
    <Button v-if="canClearPath" @click="emit('onClearPath')" class="builder-button" :severity="'danger'" icon="fa-solid fa-x" text v-tooltip="'Clear path'" />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { toTitleCase } from "@im-library/helpers/StringManipulators";
interface Props {
  path: Match;
  canClearPath?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  canClearPath: true
});
const emit = defineEmits({ onClearPath: () => true });
</script>

<style scoped>
.path-display-container {
  padding: 0.5rem;
}
</style>
