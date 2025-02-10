<template>
  <div class="battery-bar">
    <div
      v-for="(index, segement) in Array.from(Array(segments).keys())"
      class="bar-segment"
      :style="{ backgroundColor: isFilled(index) ? color : 'lightgray' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  segments?: number;
  color?: string;
  highestValue: number;
  currentValue: number;
}
const props = withDefaults(defineProps<Props>(), {
  segments: 6,
  color: "var(--p-green-500)"
});

function isFilled(index: number) {
  return props.currentValue !== 0 && (100 / props.segments) * index <= (props.currentValue / props.highestValue) * 100;
}
</script>

<style lang="scss">
.battery-bar {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  height: 0.5rem;
}
.bar-segment {
  width: 100%;
  background-color: lightgray;
  margin-right: 2px;
  height: 100%;
  border: 0 3px;
}
.bar-segment:first-child {
  border-top-left-radius: 50vh;
  border-bottom-left-radius: 50vh;
}
.bar-segment:last-child {
  border-top-right-radius: 50vh;
  border-bottom-right-radius: 50vh;
}
</style>
