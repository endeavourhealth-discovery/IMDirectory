<template>
  <div class="card json-value-wrapper flex flex-col justify-center">
    <Textarea
      id="value"
      class="definition-value"
      v-model="definition"
      :class="{ 'p-invalid': errorMessage }"
      rows="4"
      cols="30"
      aria-describedby="text-error"
    />
    <small id="text-error" class="p-error">{{ errorMessage || "&nbsp;" }}</small>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@/interfaces/AutoGen";
import { isEqual } from "lodash-es";
import { onMounted, ref, watch } from "vue";

const emit = defineEmits<{
  "update:data": [json: any];
}>();

interface Props {
  data: Match;
}
const props = defineProps<Props>();
const definition = ref("");
const errorMessage = ref("");

watch(definition, () => {
  try {
    errorMessage.value = "";
    const updatedMatch = JSON.parse(definition.value);
    if (!isEqual(props.data, updatedMatch)) emit("update:data", updatedMatch);
  } catch (error: any) {
    errorMessage.value = error?.message ?? "Error, invalid json.";
  }
});

onMounted(() => {
  definition.value = JSON.stringify(props.data, undefined, 4);
});
</script>

<style scoped>
.definition-value {
  width: 100%;
  height: 33rem;
  overflow: auto;
}

.json-value-form {
  width: 100%;
}

.json-value-wrapper {
  width: 100%;
}
</style>
