<template>
  <i
    :class="[
      icon,
      size && 'fa-' + size,
      fixedWidth && 'fa-fw',
      rotation && 'fa-rotate-' + rotation,
      flip && 'fa-flip-' + flip,
      beat && 'fa-beat',
      fade && 'fa-fade',
      beatFade && 'fa-beat-fade',
      bounce ?? 'fa-bounce',
      shake && 'fa-shake',
      spin && 'fa-spin',
      spinReverse && 'fa-spin-reverse',
      spinPulse && 'fa-spin-pulse',
      border && 'fa-border',
      pull && 'fa-pull-' + pull,
      stack && 'fa-stack-' + stack + 'x',
      inverse && 'fa-inverse',
      swapOpacity && 'fa-swap-opacity'
    ]"
  />
</template>

<script setup lang="ts">
interface Props {
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
  stack?: 1 | 2;
  transform?: string;
  swapOpacity?: boolean;
  inverse?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  fixedWidth: false
});
</script>

<style scoped></style>
