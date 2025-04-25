<template>
  <div class="sidebar">
    <VueJsonPretty :data="editorEntityDisplay" :path="'res'" class="json" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import VueJsonPretty from "vue-json-pretty";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM } from "@/vocabulary";
import { cloneDeep } from "lodash-es";

const props = defineProps<{
  editorEntity: any;
}>();

const editorEntityDisplay = ref();

watch(
  () => cloneDeep(props.editorEntity),
  () => setEditorEntityDisplay()
);

onMounted(() => {
  setEditorEntityDisplay();
});

function setEditorEntityDisplay() {
  editorEntityDisplay.value = { ...props.editorEntity };
  if (isObjectHasKeys(editorEntityDisplay.value, [IM.DEFINITION]) && typeof editorEntityDisplay.value[IM.DEFINITION] === "string") {
    editorEntityDisplay.value[IM.DEFINITION] = JSON.parse(editorEntityDisplay.value[IM.DEFINITION]);
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-flow: column nowrap;
  overflow-y: hidden;
  padding-top: 0.75rem;
  gap: 0.5rem;
}

.json:deep(.vjs-value__string) {
  word-break: break-all;
}

.json:deep(.vjs-value) {
  font-size: 1rem;
}

.json:deep(.vjs-key) {
  font-size: 1rem;
}

.json {
  flex: 0 1 auto;
  width: 100%;
  overflow: auto;
  border: 1px var(--p-textarea-border-color) solid;
  border-radius: var(--p-textarea-border-radius);
}
</style>
