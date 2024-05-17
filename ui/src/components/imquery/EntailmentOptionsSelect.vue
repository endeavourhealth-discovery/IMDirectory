<template>
  <Dropdown v-model:model-value="editOptions" optionValue="id" optionLabel="name" :options="options" placeholder="Entailment options" @change="onChange()" />
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Entailment } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";

interface Props {
  entailmentObject: Entailment;
}

const props = defineProps<Props>();

const editOptions: Ref<string> = ref("descendantsOrSelfOf");

const options = [
  { id: "memberOf", name: "member of" },
  { id: "ancestorsOf", name: "ancestors of" },
  { id: "descendantsOrSelfOf", name: "descendants or self of" },
  { id: "descendantsOf", name: "descendants of" }
];

onMounted(() => {
  if (isObjectHasKeys(props.entailmentObject)) {
    editOptions.value = "descendantsOrSelfOf";
    if (props.entailmentObject.ancestorsOf) editOptions.value = "ancestorsOf";
    else if (props.entailmentObject.descendantsOrSelfOf) editOptions.value = "descendantsOrSelfOf";
    else if (props.entailmentObject.descendantsOf) editOptions.value = "descendantsOf";
  }
});

function onChange() {
  for (const option of options) {
    if (isObjectHasKeys(props.entailmentObject, [option.id])) delete (props.entailmentObject as any)[option.id];
  }

  (props.entailmentObject as any)[editOptions.value] = true;
}
</script>

<style scoped></style>
