<template>
  <Textarea v-model="jsonString" @update:model-value="onChange" :class="errorMessage ? 'json-string p-invalid' : 'json-string'" @keydown="onFormat" />
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType } from "vue";
const props = defineProps({
  jsonObject: { type: Object as PropType<any>, required: true }
});
const jsonString = ref("");
const errorMessage = ref("");

onMounted(async () => {
  jsonString.value = JSON.stringify(props.jsonObject.data, null, 2);
});

function getParsedOrError() {
  try {
    return JSON.parse(jsonString.value);
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
}

function onFormat(event: KeyboardEvent) {
  if (event.code === "AltLeft") {
    jsonString.value = JSON.stringify(props.jsonObject.data, null, 2);
  }
}

function onChange() {
  const messageOrData = getParsedOrError();
  if (typeof messageOrData === "string") {
    errorMessage.value = messageOrData;
  } else {
    props.jsonObject.data = messageOrData;
    errorMessage.value = "";
  }
}
</script>

<style scoped>
.error-message {
  color: red;
}

.json-string {
  width: 100%;
  height: 20rem;
}
</style>
