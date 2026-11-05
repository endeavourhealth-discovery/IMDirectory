<template>
  <Select v-model:model-value="selectedOption" optionValue="id" optionLabel="name" :options="options" placeholder="Entailment options" @change="onChange()" />
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import { Entail } from "@endeavour/vue-library/enums";
import type { Element } from "@endeavour/vue-library/models";

const props = defineProps<{
  entailmentObject: Element;
}>();

const emit = defineEmits<{
  updateEntailment: [payload: string];
}>();

const selectedOption: Ref<string> = ref("");

const options = [
  { id: "memberOf", name: "member of" },
  { id: "ancestorsOf", name: "ancestors of" },
  { id: "descendantsOrSelfOf", name: "descendants or self of" },
  { id: "descendantsOf", name: "descendants of" }
];

onMounted(() => {
  init();
});

function init() {
  const entail = props.entailmentObject.entails;
  switch (entail) {
    case Entail.ancestorsOf:
      selectedOption.value = "ancestorsOf";
      break;
    case Entail.descendantsOrSelfOf:
      selectedOption.value = "descendantsOrSelfOf";
      break;
    case Entail.descendantsOf:
      selectedOption.value = "descendantsOf";
      break;
    default:
      selectedOption.value = "memberOf";
  }
}

function onChange() {
  emit("updateEntailment", selectedOption.value);
}
</script>

<style scoped></style>
