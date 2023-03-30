<template>
  <div v-if="show" class="text-html-with-label-container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <div class="text-html-container" v-html="convertedText" :id="id" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: String, required: false },
  size: { type: String, default: "100%" },
  id: { type: String, default: "text-html-with-label" },
  show: { type: Boolean, required: true }
});

const convertedText = ref("");

onMounted(() => {
  init();
});

function init() {
  if (!props.data) {
    convertedText.value = "None";
    return;
  }
  let text = props.data;
  if (text.startsWith("<p>")) {
    text = text.slice(3);
  }
  if (props.data.endsWith("<p>")) {
    text = text.slice(0, -3);
  }
  text = text.replace(/<p>/g, "</p><p class='" + props.id + "-p'>");
  text = text.replace(/\\n/g, "</p><p class='" + props.id + "-p'>");
  convertedText.value = "<p class='" + props.id + "-p'>" + text + "</p>";
}
</script>

<style scoped>
.text-html-with-label-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  padding: 0.25rem 0.5rem 0 0;
}

.label {
  padding-right: 0.5rem;
}

.text-html-with-label-container ::v-deep(p) {
  margin: 0 0 0 0;
}
</style>
