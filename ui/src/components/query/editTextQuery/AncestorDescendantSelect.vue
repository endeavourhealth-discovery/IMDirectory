<template>
  <MultiSelect v-model="selectedOptions" :options="options" placeholder="Ancestors or self options" :maxSelectedLabels="1" />
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { onMounted, watch, ref, Ref, PropType } from "vue";
const props = defineProps({
  selected: { type: Object as PropType<string[]>, required: true }
});

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];
const selectedOptions: Ref<string[]> = ref([]);

onMounted(async () => {
  if (isArrayHasLength(props.selected)) selectedOptions.value = [...props.selected];
});
</script>

<style scoped></style>
