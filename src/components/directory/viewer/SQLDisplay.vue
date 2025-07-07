<template>
  <pre v-if="sql" class="sql-container line-numbers language-sql">
      <code class="language-sql" >{{ sql }}</code>
    </pre>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-sql.js";
import "prismjs/plugins/line-numbers/prism-line-numbers";

// Prism.manual = true;

Prism.plugins.NormalizeWhitespace.setDefaults({
  "remove-trailing": false,
  "remove-indent": true,
  "left-trim": false,
  "right-trim": false
});

interface Props {
  sql: string;
}

const props = defineProps<Props>();

watch(
  () => props.sql,
  () => {
    requestAnimationFrame(() => {
      Prism.highlightAll();
    });
  },
  { immediate: true }
);
</script>

<style scoped>
@import "prismjs/plugins/line-numbers/prism-line-numbers.css";
.sql-container {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
