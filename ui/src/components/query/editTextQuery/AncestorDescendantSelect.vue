<template>
  <MultiSelect v-model="selectedOptions" :options="options" placeholder="Ancestors or self options" :maxSelectedLabels="1" />
</template>

<script setup lang="ts">
import { onMounted, watch, ref, Ref } from "vue";
// const props = defineProps({
//   propValue: { type: String, required: true }
// });

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];
const selectedOptions: Ref<string[]> = ref([]);

// watch(
//   () => props.propValue,
//   async newValue => {}
// );

// onMounted(async () => {});
</script>

<style scoped></style>
