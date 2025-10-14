<template>
  <div class="language-text">
    <div v-for="(line, lineIdx) in parsedLines" :key="lineIdx" :style="{ marginLeft: line.indent * 20 + 'px' }" class="line">
      <span v-for="(word, idx) in line.words" :key="idx" class="word" :class="{ keyword: keywords.includes(word.toLowerCase()) }" :title="info[word] || ''">
        {{ word }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref } from "vue";
import { IMLLanguage } from "@/interfaces/AutoGen";

interface Props {
  iml: IMLLanguage;
}
interface Lines {
  words: string[];
  indent: number;
}

const props = defineProps<Props>();
const text = props.iml.text!;
const info = props.iml.info!;
const keywords = props.iml.keywords!;
const parsedLines = computed<Lines[]>(() => {
  const result: Lines[] = [];
  if (props.iml.text) {
    const lines = props.iml.text.split(/\r?\n/);
    let indentLevel = 0;
    for (let line of lines) {
      line = line.trim();
      const words = line.split(/\s+/).filter(Boolean);
      if (line.endsWith("(")) {
        indentLevel++;
      }

      result.push({
        words,
        indent: indentLevel
      });

      if (line.trim().endsWith(")")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    }
  }

  return result;
});
</script>

<style scoped>
.keyword {
  color: #c678dd; /* purple for keywords */
  font-weight: bold;
}
.word {
  margin-right: 0.5rem;
  cursor: help;
}
</style>
