<template>
  <MultiSelect v-model="editOptions" :options="options" placeholder="Entailment options" :maxSelectedLabels="1" @change="onChange()" />
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { PropType, Ref, onMounted, ref } from "vue";
const props = defineProps({
  entailmentOptions: { type: Object as PropType<string[]>, required: true }
});
const editOptions: Ref<string[]> = ref([]);

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];

onMounted(() => {
  if (isArrayHasLength(props.entailmentOptions))
    for (const option of props.entailmentOptions) {
      editOptions.value.push(option);
    }
});

function onChange() {
  props.entailmentOptions.length = 0;
  for (const selectedOption of editOptions.value) {
    props.entailmentOptions.push(selectedOption);
  }
}
</script>

<style scoped></style>
