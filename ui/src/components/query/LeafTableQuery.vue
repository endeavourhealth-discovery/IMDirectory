<template>
  <div class="leaf">
    <div v-for="property in Object.keys(value)">
      <TableQueryIri
        v-if="'@id' === property || '@set' === property || '@type' === property"
        :value="value"
        :property="property"
        :edit-mode="editModeSet.has(property)"
        @on-edit="edit"
      />
      <TableQueryIn v-else-if="'in' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
      <TableQueryRange v-else-if="'range' === property" :range-value="value[property]" />
      <TableQueryDefault v-else-if="'name' !== property" :value="value" :property="property" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import TableQueryDefault from "./leafTableQuery/TableQueryDefault.vue";
import TableQueryIn from "./leafTableQuery/TableQueryIn.vue";
import TableQueryIri from "./leafTableQuery/TableQueryIri.vue";
import TableQueryRange from "./leafTableQuery/TableQueryRange.vue";

const props = defineProps({
  value: { type: Object, required: true }
});

const editModeSet: Ref<Set<string>> = ref(new Set());

function edit(property: string) {
  if (!editModeSet.value.has(property)) editModeSet.value.add(property);
  else editModeSet.value.delete(property);
}
</script>

<style scoped>
.leaf {
  display: flex;
  flex-flow: column;
  padding: 0.5em 1em;
}
</style>
