<template>
  <pre class="sql-container line-numbers">
    <code class="language-sql" >{{ sql }}</code>
  </pre>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-sql.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

interface Props {
  sql: string;
}

const props = defineProps<Props>();

watch(
  () => props.sql,
  () => {
    Prism.highlightAll();
  }
);

onMounted(() => {
  Prism.plugins.NormalizeWhitespace.setDefaults({
    "remove-trailing": false,
    "remove-indent": true,
    "left-trim": false,
    "right-trim": false
  });
  Prism.highlightAll();
});
</script>

<style scoped>
.sql-container {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
