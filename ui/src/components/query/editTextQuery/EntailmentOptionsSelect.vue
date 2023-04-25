<template>
  <MultiSelect v-model="selectedOptions" :options="options" placeholder="Entailment options" :maxSelectedLabels="1" />
</template>

<script setup lang="ts">
import { PropType, Ref, ref } from "vue";
const props = defineProps({
  entailmentOptions: { type: Object as PropType<string[]>, required: true }
});
const selectedOptions: Ref<string[]> = ref([]);

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];
</script>

<style scoped></style>
