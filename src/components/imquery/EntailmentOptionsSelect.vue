<template>
  <Select v-model:model-value="selectedOption" optionValue="id" optionLabel="name" :options="options" placeholder="Entailment options" @change="onChange()" />
</template>

<script setup lang="ts">
import { Entailment } from "@/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";

interface Props {
  entailmentObject: Entailment;
}

const props = defineProps<Props>();
const selectedOption: Ref<string> = ref("");
const emit = defineEmits({ updateEntailment: (_payload: string) => true });

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
  if (props.entailmentObject?.ancestorsOf) selectedOption.value = "ancestorsOf";
  else if (props.entailmentObject?.descendantsOrSelfOf) selectedOption.value = "descendantsOrSelfOf";
  else if (props.entailmentObject?.descendantsOf) selectedOption.value = "descendantsOf";
  else selectedOption.value = "memberOf";
}

function onChange() {
  emit("updateEntailment", selectedOption.value);
}
</script>

<style scoped></style>
