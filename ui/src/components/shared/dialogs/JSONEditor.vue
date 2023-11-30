<template>
  <div class="card flex flex-column justify-content-center json-value-wrapper">
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
import { onMounted, ref, watch } from "vue";

const emit = defineEmits({
  "update:data": payload => true
});

interface Props {
  data: string;
}
const props = defineProps<Props>();
const definition = ref("");
const errorMessage = ref("");

watch(
  () => definition.value,
  () => {
    try {
      errorMessage.value = "";
      const match = JSON.parse(definition.value);
      emit("update:data", match);
    } catch (error: any) {
      errorMessage.value = error?.message ?? "Error with parsing the definition.";
    }
  }
);

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
