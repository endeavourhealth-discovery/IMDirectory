<template>
  <input v-model="value" :size="value?.length ? value.length : 5" />
</template>
<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";

interface Props {
  test: string;
}

const props = withDefaults(defineProps<Props>(), {});

const value: Ref<string> = ref("");

watch(
  () => props.test,
  () => {
    value.value = props.test;
  }
);

onMounted(() => {
  value.value = props.test;
});
</script>
