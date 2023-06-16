<template>
  <MultiSelect v-model="editOptions" :options="options" placeholder="Entailment options" :maxSelectedLabels="1" @change="onChange()" />
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Ref, onMounted, ref } from "vue";

interface Props {
  entailmentOptions: string[];
}

const props = defineProps<Props>();

const editOptions: Ref<string[]> = ref([]);

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];

onMounted(() => {
  if (isArrayHasLength(props.entailmentOptions)) {
    for (const option of props.entailmentOptions) {
      editOptions.value.push(option);
    }
  } else {
    editOptions.value.push("descendantsOrSelfOf");
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
