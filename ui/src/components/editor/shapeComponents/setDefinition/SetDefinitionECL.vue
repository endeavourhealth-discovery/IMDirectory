<template>
  <div id="query-search-container">
    <div class="text-copy-container">
      <Textarea
        v-model="queryString"
        id="query-string-container"
        placeholder="Enter ECL text here..."
        :class="eclError ? 'p-invalid' : ''"
        data-testid="query-string"
      />
    </div>
    <Button
      icon="fa-solid fa-copy"
      label="Copy to clipboard"
      v-clipboard:copy="copyToClipboard()"
      v-clipboard:success="onCopy"
      v-clipboard:error="onCopyError"
      data-testid="copy-to-clipboard-button"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

const emit = defineEmits({
  updateECL: (_payload: string) => true
});

const props = defineProps({
  ecl: { type: String, required: true }
});

onMounted(() => {
  queryString.value = props.ecl;
});

const toast = useToast();
const queryString = ref("");
const eclError = ref(false);

watch(queryString, () => {
  eclError.value = false;
  emit("updateECL", queryString.value);
});

function copyToClipboard(): string {
  return queryString.value;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.success, "Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.error, "Value copied to clipboard"));
}
</script>

<style scoped>
#query-search-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#query-builder-container {
  width: 100%;
  flex-grow: 100;
  overflow: auto;
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

#next-option-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
}

#query-string-container {
  width: 50rem;
  height: 20rem;
  overflow: auto;
  flex-grow: 100;
}

.info {
  align-self: flex-start;
  margin: 0 0 0.5rem 0;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

.results-container {
  width: 100%;
  flex: 0 1 auto;
  overflow: auto;
}

.text-copy-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0 1rem 0;
}
</style>
