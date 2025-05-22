<template>
  <div class="termcode-table-container">
    <DataTable class="p-datatable-sm term-code-table scrollbar" :value="terms" responsiveLayout="scroll" scrollHeight="flex">
      <template #empty> No terms found. </template>
      <Column field="term" header="Term"> </Column>
      <Column field="code" header="Code"></Column>
      <Column field="status.name" header="Status"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import setupTerms from "@/composables/setupTerms";
import { SearchTermCode } from "@/interfaces/AutoGen";
import { onMounted, Ref, watch } from "vue";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

watch(
  () => props.entityIri,
  newValue => {
    if (newValue) getTerms(newValue);
  }
);

const { terms, getTerms }: { terms: Ref<SearchTermCode[]>; getTerms: (iri: string) => void } = setupTerms();

onMounted(() => {
  getTerms(props.entityIri);
});
</script>
<style scoped>
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
