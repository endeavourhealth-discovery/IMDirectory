<template>
  <MultiSelect v-model="editOptions" :options="options" placeholder="Entailment options" :maxSelectedLabels="1" @change="onChange()" />
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Entailment } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";

interface Props {
  entailmentObject: Entailment;
}

const props = defineProps<Props>();

const editOptions: Ref<string[]> = ref(["descendantsOrSelfOf"]);

const options = ["ancestorsOf", "descendantsOrSelfOf", "descendantsOf"];

onMounted(() => {
  if (isObjectHasKeys(props.entailmentObject)) {
    editOptions.value = [];
    if (props.entailmentObject.ancestorsOf) editOptions.value.push("ancestorsOf");
    else if (props.entailmentObject.descendantsOrSelfOf) editOptions.value.push("descendantsOrSelfOf");
    else if (props.entailmentObject.descendantsOf) editOptions.value.push("descendantsOf");
  }
});

function onChange() {
  for (const option of options) {
    if (isObjectHasKeys(props.entailmentObject, [option])) delete (props.entailmentObject as any)[option];
  }
  for (const selectedOption of editOptions.value) {
    (props.entailmentObject as any)[selectedOption] = true;
  }
}
</script>

<style scoped></style>
