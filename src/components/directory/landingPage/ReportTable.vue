<template>
  <div :id="id" class="dashcard-container report-table">
    <Card class="dashcard dash-table">
      <template #title>
        <span v-if="name">{{ name }}</span>
      </template>
      <template #subtitle>
        <span v-if="description">{{ description }}</span>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading-container" v-if="loading">
          <ProgressSpinner />
        </div>
        <DataTable v-else-if="isCorrectInputData" :value="tableData" class="p-datatable-sm" :scrollable="true" scrollHeight="350px">
          <template #header> Ontology data </template>
          <Column field="label" header="Label"></Column>
          <Column field="count" header="Total"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, Ref } from "vue";
import { DataTypeCheckers } from "@/im_library/helpers";
import { IM, RDFS } from "@/im_library/vocabulary";
const { isObjectHasKeys } = DataTypeCheckers;

const props = defineProps({
  name: { type: String, required: false },
  description: { type: String, required: false },
  inputData: { type: Array as PropType<any[]>, required: true },
  id: { type: String, required: true }
});

const tableData: Ref<{ count: number; label: string }[]> = ref([]);
const loading = ref(false);

const isCorrectInputData = computed(() =>
  props.inputData.every(item => !!(isObjectHasKeys(item, [RDFS.LABEL, IM.HAS_VALUE]) || isObjectHasKeys(item, ["count", "label"])))
);

onMounted(() => getReportTableData());

function getReportTableData(): void {
  if (!isCorrectInputData.value) return;
  loading.value = true;
  for (const entry of props.inputData) {
    if (isObjectHasKeys(entry, [RDFS.LABEL, IM.HAS_VALUE])) {
      tableData.value.push({
        label: entry[RDFS.LABEL],
        count: +entry[IM.HAS_VALUE]
      });
    }
    if (isObjectHasKeys(entry, ["label", "count"])) {
      tableData.value.push({
        label: entry.label,
        count: +entry.count
      });
    }
  }
  loading.value = false;
}
</script>

<style scoped>
.dashcard-container {
  height: fit-content;
  width: 50%;
}
.dashcard {
  width: 100%;
  box-shadow: none;
  border-radius: none;
}
.loading-container {
  width: 100%;
}
</style>
