<template>
  <font-awesome-icon
    :icon="getIcon"
    :size="size"
    :fixedWidth="fixedWidth"
    :rotation="rotation"
    :flip="flip"
    :beat="beat"
    :beat-fade="beatFade"
    :bounce="bounce"
    :fade="fade"
    :shake="shake"
    :spin="spin || spinReverse || spinPulse"
    :spin-reverse="spinReverse"
    :spin-pulse="spinPulse"
    :border="border"
    :pull="pull"
    :transform="transform"
    :mask="mask"
    :swap-opacity="swapOpacity"
    :inverse="inverse"
    :counter="counter"
    :value="value"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  proIcon: { type: String, required: true },
  freeIcon: { type: String, required: true },
  size: { type: String, required: false },
  fixedWidth: { type: Boolean, required: false, default: false },
  rotation: { type: String, required: false },
  flip: { type: String, required: false },
  beat: { type: Boolean, required: false },
  beatFade: { type: Boolean, required: false },
  bounce: { type: Boolean, required: false },
  fade: { type: Boolean, required: false },
  shake: { type: Boolean, required: false },
  spin: { type: Boolean, required: false },
  spinReverse: { type: Boolean, required: false },
  spinPulse: { type: Boolean, required: false },
  border: { type: Boolean, required: false },
  pull: { type: String, required: false },
  transform: { type: String, required: false },
  mask: { type: String, required: false },
  swapOpacity: { type: Boolean, required: false },
  inverse: { type: Boolean, required: false },
  counter: { type: Boolean, required: false },
  value: { type: Number, required: false }
});

const store = useStore();
const fontAwesomePro = computed(() => store.state.fontAwesomePro);

const getIcon = computed(() => (fontAwesomePro ? props.proIcon : props.freeIcon));
</script>

<style scoped></style>
