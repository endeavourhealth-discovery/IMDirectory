<template>
  <div class="termcode-table-container">
    <DataTable class="p-datatable-sm term-code-table scrollbar" :value="terms" responsiveLayout="scroll" scrollHeight="flex">
      <template #empty> No terms found. </template>
      <Column field="name" header="Name"> </Column>
      <Column field="code" header="Code"></Column>
      <Column field="status.name" header="Status"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { PropType } from "vue";

interface Props {
  terms: { name: string; code: string; status: TTIriRef }[];
}

const props = defineProps<Props>();
</script>
<style scoped>
.term-code.table {
  height: 100%;
  width: 100%;
}
.termcode-table-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.scrollbar {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
