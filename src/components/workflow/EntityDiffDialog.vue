<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Entity diff'" :style="{ width: '75vw' }">
    <DiffViewer v-bind="viewerCommonProps" />
    <template #footer>
      <Button label="Close" @click="visible = false" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref } from "vue";
import Differ, { DiffResult } from "json-diff-kit/dist/differ";
import DiffViewer from "./entityDiffDialog/DiffViewer.vue";
import { InlineDiffOptions, ViewerProps } from "json-diff-kit";

interface Props {
  originalEntity: any;
  draftEntity: any;
}

const props = defineProps<Props>();

const visible = defineModel("showDialog", { type: Boolean, default: false });

const differ = new Differ({
  detectCircular: false,
  maxDepth: Infinity,
  showModifications: true,
  arrayDiffMethod: "lcs",
  ignoreCase: false,
  recursiveEqual: true
});

const before1 = ref({
  a: 1,
  b: 2,
  d: [1, 5, 4],
  e: ["1", 2, { f: 3, g: null, h: [5], i: [] }, 9],
  m: [],
  q: "JSON diff can't be possible",
  r: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  s: 1024
});
const after1 = ref({
  b: 2,
  c: 3,
  d: [1, 3, 4, 6],
  e: ["1", 2, 3, { f: 4, g: false, i: [7, 8] }, 10],
  j: { k: 11, l: 12 },
  m: [{ n: 1, o: 2 }, { p: 3 }],
  q: "JSON diff is possible!",
  r: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed quasi architecto beatae incididunt ut labore et dolore magna aliqua.",
  s: "1024"
});

const diff1: ComputedRef<readonly [DiffResult[], DiffResult[]]> = computed(() => differ.diff(before1.value, after1.value));

const viewerCommonProps: ViewerProps = {
  indent: 2,
  lineNumbers: true,
  highlightInlineDiff: true,
  inlineDiffOptions: {
    mode: "word",
    wordSeparator: " "
  },
  hideUnchangedLines: true,
  syntaxHighlight: { theme: "monokai" },
  diff: diff1.value
  // virtual: false,
};
</script>

<style scoped></style>
