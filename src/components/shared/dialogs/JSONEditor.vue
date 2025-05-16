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

const modelData = defineModel<Match>("data");

const definition = ref("");
const errorMessage = ref("");

watch(definition, () => {
  try {
    errorMessage.value = "";
    const updatedMatch = JSON.parse(definition.value);
    if (!isEqual(modelData.value, updatedMatch)) modelData.value = updatedMatch;
  } catch (error: any) {
    errorMessage.value = error?.message ?? "Error, invalid json.";
  }
});

onMounted(() => {
  definition.value = JSON.stringify(modelData.value, undefined, 4);
});
</script>

<style scoped>
.definition-value {
  width: 100%;
  height: 33rem;
  overflow: auto;
}

.json-value-wrapper {
  width: 100%;
}
</style>
