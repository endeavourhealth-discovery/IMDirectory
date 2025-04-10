<template>
  <div class="sql-container" v-html="highlightedSQL"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Prism from "prismjs";

interface Props {
  sql: string;
}

const props = defineProps<Props>();

const highlightedSQL = ref("");
watch(
  () => props.sql,
  newValue => {
    highlightSql(newValue);
  }
);

onMounted(() => {
  highlightSql(props.sql);
});

function highlightSql(sql: string) {
  highlightedSQL.value = Prism.highlight(sql, Prism.languages.sql, "sql");
}
</script>

<style scoped>
.sql-container {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
