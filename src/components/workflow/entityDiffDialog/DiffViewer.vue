<template>
  <table
    :class="[
      'json-diff-viewer',
      props.virtual && 'json-diff-viewer-virtual',
      props.syntaxHighlight && `json-diff-viewer-theme-${props.syntaxHighlight.theme || 'monokai'}`
    ]"
  >
    <colgroup class="measure-line">
      <col v-if="props.lineNumbers" :style="{ width: lineNumberWidth }" />
      <col />
      <col v-if="props.lineNumbers" :style="{ width: lineNumberWidth }" />
      <col />
    </colgroup>
    <tbody>
      <tr v-if="jsonsAreEqual && hideUnchangedLines" key="message-line" class="message-line">
        <td :colspan="4">{mergedTexts.noChangeDetected}</td>
      </tr>
      <Segment
        v-else-if="!props.virtual"
        v-for="(segment, index) in segments"
        :segment="segment"
        :index="index"
        :lines-left="linesLeft"
        :lines-right="linesRight"
        :render-start="0"
        :render-end="linesLeft.length"
        @expand-before="onExpandBefore"
        @expand-after="onExpandAfter"
        @expand-all="onExpandAll"
      ></Segment>
      <!-- v-else: render in virtual -->
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { provide, ref, computed } from "vue";

import Segment from "./Segment.vue";
import getSegments from "./utils/get-segment";
import { ViewerProps } from "./types";

const props = withDefaults(defineProps<ViewerProps>(), {
  texts: () => ({
    noChangeDetected: "No change detected"
  })
});
provide("viewerProps", props);

const linesLeft = computed(() => props.diff[0]);
const linesRight = computed(() => props.diff[1]);
const jsonsAreEqual = computed(
  () =>
    linesLeft.value.length === linesRight.value.length &&
    linesLeft.value.every(item => item.type === "equal") &&
    linesRight.value.every(item => item.type === "equal")
);
const lineNumberWidth = computed(() => (props.lineNumbers ? `calc(${String(linesLeft.value.length).length}ch + 16px)` : 0));
const hideUnchangedLines = computed(() => props.hideUnchangedLines ?? false);

const segments = ref(getSegments(linesLeft.value, linesRight.value, hideUnchangedLines.value, jsonsAreEqual.value));

const onExpandBefore = (segmentIndex: number, lines: number) => {
  const { start, end } = segments.value[segmentIndex];
  segments.value[segmentIndex].end = Math.max(end - lines, start);
  if (segmentIndex + 1 < segments.value.length - 1) {
    segments.value[segmentIndex + 1].start = Math.max(end - lines, start);
  }
};

const onExpandAfter = (segmentIndex: number, lines: number) => {
  const { start, end } = segments.value[segmentIndex];
  segments.value[segmentIndex].start = Math.min(start + lines, end);
  if (segmentIndex > 1) {
    segments.value[segmentIndex - 1].end = Math.min(start + lines, end);
  }
};

const onExpandAll = (segmentIndex: number) => {
  const { start, end } = segments.value[segmentIndex];
  segments.value[segmentIndex] = {
    start,
    end: start,
    isEqual: true
  };
  if (segmentIndex + 1 < segments.value.length - 1) {
    segments.value[segmentIndex + 1].start = start;
  } else {
    segments.value[segmentIndex - 1].end = end;
  }
};
</script>

<style>
.json-diff-viewer {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
}
.json-diff-viewer tr {
  vertical-align: top;
}
.json-diff-viewer tr .line-add {
  background: #a5d6a7;
}
.json-diff-viewer tr .line-remove {
  background: #ef9a9a;
}
.json-diff-viewer tr .line-modify {
  background: #ffe082;
}
.json-diff-viewer tr:hover td {
  position: relative;
}
.json-diff-viewer tr:hover td:before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
  content: "";
  pointer-events: none;
}
.json-diff-viewer tr.message-line {
  border-top: 1px solid;
  border-bottom: 1px solid;
  text-align: center;
}
.json-diff-viewer tr.message-line td {
  padding: 4px 0;
  font-size: 12px;
}
.json-diff-viewer tr.expand-line {
  text-align: center;
}
.json-diff-viewer tr.expand-line td {
  padding: 4px 0;
}
.json-diff-viewer tr.expand-line:hover td:before {
  background: transparent;
}
.json-diff-viewer tr.expand-line .has-lines-before {
  border-bottom: 1px solid;
}
.json-diff-viewer tr.expand-line .has-lines-after {
  border-top: 1px solid;
}
.json-diff-viewer tr.expand-line button {
  padding: 0;
  border: none;
  margin: 0 0.5em;
  background: transparent;
  color: #2196f3;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}
.json-diff-viewer tr.expand-line button:hover {
  text-decoration: underline;
}
.json-diff-viewer td {
  padding: 1px;
  font-size: 0;
}
.json-diff-viewer td.line-number {
  box-sizing: content-box;
  padding: 0 8px;
  border-right: 1px solid;
  font-family: monospace;
  font-size: 14px;
  text-align: right;
  user-select: none;
}
.json-diff-viewer pre {
  overflow: hidden;
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  white-space: pre-wrap;
  word-break: break-all;
}
.json-diff-viewer pre .inline-diff-add {
  background: rgba(0, 0, 0, 0.08);
  text-decoration: underline;
  word-break: break-all;
}
.json-diff-viewer pre .inline-diff-remove {
  background: rgba(0, 0, 0, 0.08);
  text-decoration: line-through;
  word-break: break-all;
}
.json-diff-viewer-virtual pre {
  overflow-x: auto;
  white-space: pre;
}
.json-diff-viewer-virtual pre::-webkit-scrollbar {
  display: none;
}
</style>
