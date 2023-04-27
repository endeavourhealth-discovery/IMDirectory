<template>
  <FontAwesomeIcon
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
  />
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useRootStore } from "@/stores/rootStore";

const props = defineProps({
  proIcon: { type: String, required: false },
  icon: { type: [Array, String] as PropType<string[] | string>, required: true },
  size: {
    type: String as PropType<"2xs" | "xs" | "sm" | "lg" | "xl" | "2xl" | "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x">,
    required: false,
    validator(value: string) {
      return ["2xs", "xs", "sm", "lg", "xl", "2xl", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"].includes(value);
    }
  },
  fixedWidth: { type: Boolean, required: false, default: false },
  rotation: {
    type: (String as PropType<"90" | "180" | "270" | undefined>) || (Number as PropType<90 | 180 | 270>),
    required: false,
    validator(value: string) {
      return [90, 180, 270, "90", "180", "270"].includes(value);
    }
  },
  flip: {
    type: String as PropType<"horizontal" | "vertical" | "both" | undefined>,
    required: false,
    validator(value: string) {
      return ["horizontal", "vertical", "both"].includes(value);
    }
  },
  beat: { type: Boolean, required: false },
  beatFade: { type: Boolean, required: false },
  bounce: { type: Boolean, required: false },
  fade: { type: Boolean, required: false },
  shake: { type: Boolean, required: false },
  spin: { type: Boolean, required: false },
  spinReverse: { type: Boolean, required: false },
  spinPulse: { type: Boolean, required: false },
  border: { type: Boolean, required: false },
  pull: {
    type: String as PropType<"left" | "right" | undefined>,
    required: false,
    validator(value: string) {
      return ["right", "left"].includes(value);
    }
  },
  transform: { type: String, required: false },
  mask: { type: String, required: false },
  swapOpacity: { type: Boolean, required: false },
  inverse: { type: Boolean, required: false },
  counter: { type: Boolean, required: false },
  value: { type: Number, required: false }
});

const rootStore = useRootStore();
const fontAwesomePro = computed(() => rootStore.fontAwesomePro);

const getIcon = computed(() => (fontAwesomePro.value ? (props.proIcon ? props.proIcon : props.icon) : props.icon));
</script>

<style scoped></style>
