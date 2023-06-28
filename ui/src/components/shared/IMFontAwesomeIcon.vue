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
import { useDirectoryStore } from "@/stores/directoryStore";
import { useSharedStore } from "@/stores/sharedStore";

interface Props {
  proIcon?: string;
  icon: string[] | string;
  size?: "2xs" | "xs" | "sm" | "lg" | "xl" | "2xl" | "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x";
  fixedWidth?: boolean;
  rotation?: "90" | "180" | "270" | 90 | 180 | 270;
  flip?: "horizontal" | "vertical" | "both";
  beat?: boolean;
  beatFade?: boolean;
  bounce?: boolean;
  fade?: boolean;
  shake?: boolean;
  spin?: boolean;
  spinReverse?: boolean;
  spinPulse?: boolean;
  border?: boolean;
  pull?: "left" | "right";
  transform?: string;
  mask?: string;
  swapOpacity?: boolean;
  inverse?: boolean;
  counter?: boolean;
  value?: number;
}
const props = withDefaults(defineProps<Props>(), {
  fixedWidth: false
});

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const getIcon = computed(() => (fontAwesomePro.value ? (props.proIcon ? props.proIcon : props.icon) : props.icon));
</script>

<style scoped></style>
