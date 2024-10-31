<template>
  <div class="buttons-container">
    <Button v-if="show?.up" icon="fa-solid fa-chevron-up" class="p-button-rounded p-button-text" @click="moveUpClicked" />
    <Button v-if="show?.down" icon="fa-solid fa-chevron-down" class="p-button-rounded p-button-text" @click="moveDownClicked" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  position: number;
  show?: { up: boolean; down: boolean };
}

const props = withDefaults(defineProps<Props>(), {
  show: { up: true, down: true } as any
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
