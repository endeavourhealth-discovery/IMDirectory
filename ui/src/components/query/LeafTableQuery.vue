<template>
  <div class="leaf">
    <div v-for="property in Object.keys(value)">
      <div v-if="'@id' === property">{{ value[property] }}</div>
      <TableQueryIn v-else-if="'in' === property" :in-value="value[property]" />
      <div v-else>{{ property }}: {{ value[property] }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TableQueryIn from "./leafTableQuery/TableQueryIn.vue";

const props = defineProps({
  value: { type: Object, required: true }
});
</script>

<style scoped>
.leaf {
  display: flex;
  flex-flow: column;
  padding: 0.5em 1em;
}
</style>
