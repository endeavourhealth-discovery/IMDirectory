<template>
  <div class="language-text">
    <div
      v-if="parsedLines.length"
      v-for="(line, lineIdx) in parsedLines"
      :key="lineIdx"
      :style="{ marginLeft: line.indent * 20 + 'px' }"
      class="line"
      v-tooltip.left="'Copy to clipboard'"
      v-clipboard:copy="copyToClipboard()"
      v-clipboard:success="onCopy"
      v-clipboard:error="onCopyError"
    >
      <span v-if="line.words && line.words.length > 0">
        <span
          v-for="(word, idx) in line.words"
          :key="idx"
          class="word"
          :class="{
            keyword: keywords.includes(word.toLowerCase()),
            operator: booleans.includes(word.toLowerCase()),
            alert: alerts.includes(word.toLowerCase())
          }"
          >{{ word }}
        </span>
      </span>
      <span v-else>&nbsp;</span>
      <span v-if="line.comment">// {{ line.comment }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { IMLLanguage } from "@/interfaces/AutoGen";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";

interface Props {
  iml: IMLLanguage;
}
interface Lines {
  words: string[];
  indent: number;
  comment?: string;
}

const props = defineProps<Props>();
const keywords = props.iml.keywords!;
const booleans = props.iml.booleans!;
const alerts = props.iml.alerts!;
const parsedLines: Ref<Lines[]> = ref([]);
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(ref(props.iml.text!));

function parseLines() {
  parsedLines.value = [];
  if (props.iml.text) {
    const lines = props.iml.text.split(/\r?\n/);
    let indentLevel = 0;
    let then = false;
    for (let line of lines) {
      let comment = undefined;
      const match = line.match(/^(.*?)(?<!https?:)\/\/(.*)$/);
      if (match) [, line, comment] = match;
      line = line.trim();
      if (line === ">>") {
        indentLevel++;
        continue;
      }
      if (line === "<<") {
        indentLevel--;
        continue;
      }
      const words = [];
      if (line.includes('"')) {
        words.push(line);
      } else {
        words.push(...line.split(/\s+/).filter(Boolean));
      }
      parsedLines.value.push({
        words,
        indent: indentLevel,
        comment: comment
      });
    }
  }
}

onMounted(() => init());
watch(
  () => props.iml,
  () => init()
);
function init() {
  parseLines();
}
</script>

<style scoped>
.keyword {
  color: #c678dd;
  font-weight: bold;
}
.word::after {
  content: " ";
}
.word {
  display: inline;
  white-space: normal;
  overflow-wrap: break-word; /* only break when needed, not mid-word */
  word-break: break-word; /* don't break inside words */
}

.operator {
  color: #7591bf;
}
.alert {
  color: darkmagenta;
}

.language-text {
  white-space: pre-wrap; /* preserve indentation and allow wrapping */
  overflow-wrap: break-word;
  word-break: normal;
}

.line {
  display: block;
  white-space: pre-wrap;
}
</style>
