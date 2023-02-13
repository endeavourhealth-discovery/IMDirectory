<template>
  <div class="buttons-container">
    <Button v-if="show.up" icon="pi pi-chevron-up" class="p-button-rounded p-button-text" @click="moveUpClicked" />
    <Button v-if="show.down" icon="pi pi-chevron-down" class="p-button-rounded p-button-text" @click="moveDownClicked" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import _ from "lodash";

const props = defineProps({
  position: { type: Number, required: true },
  show: { type: Object as PropType<{ up: boolean; down: boolean }>, default: { up: true, down: true } }
});

const emit = defineEmits({
  moveUpClicked: () => true,
  moveDownClicked: () => true
});

function moveUpClicked(event: any) {
  emit("moveUpClicked");
}

function moveDownClicked() {
  emit("moveDownClicked");
}
</script>

<style scoped>
.buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.5rem;
}
</style>
