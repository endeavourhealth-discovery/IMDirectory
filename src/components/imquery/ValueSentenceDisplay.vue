<template>
  <span v-for="(part, i) in valueSentence" :key="i">
    <template v-if="part.type === 'text'">
      {{ part.value }}
    </template>
    <template v-else-if="part.type === 'field'">
      {{ part.value }}
    </template>
    <template v-else-if="part.type === 'parameter'">
      {{ part.value }}
    </template>

    <template v-else-if="part.type === 'nodeRef'">
      <span class="node-ref">
        {{ part.value }}
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { SentencePart } from "@/helpers/QueryEditorMethods";

interface Props {
  valueSentence: SentencePart[];
}
const props = defineProps<Props>();
</script>

<style scoped>
.field {
  padding-right: 0.2rem;
}
.node-ref {
  padding-right: 0.2rem;
  font-style: italic;
}
</style>
