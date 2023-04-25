<template>
  <Textarea v-model="jsonString" @update:model-value="onChange" class="json-string" :class="errorMessage ? 'p-invalid' : ''" @keydown="onFormat" />
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType, Ref } from "vue";
const props = defineProps({
  jsonObject: { type: Object as PropType<any>, required: true }
});
const jsonString: Ref<string> = ref("");
const errorMessage: Ref<string> = ref("");

onMounted(() => {
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
  color: var(--red-800);
}

.json-string {
  width: 100%;
  height: 20rem;
}
</style>
