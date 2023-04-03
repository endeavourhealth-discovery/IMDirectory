<template>
  <div :id="id" class="dashcard-container report-table">
    <div class="dashcard">
      <span v-if="name" class="title">{{ name }}</span>
      <span v-if="description" class="description">{{ description }}</span>
      <div class="content">
        <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading-container" v-if="loading">
          <ProgressSpinner />
        </div>
        <DataTable v-else-if="isCorrectInputData" :value="tableData" class="p-datatable-sm" :scrollable="true" scrollHeight="350px">
          <template #header> Ontology data </template>
          <Column field="label" header="Label"></Column>
          <Column field="count" header="Total"></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, Ref } from "vue";
import { DataTypeCheckers } from "@im-library/helpers";
import { IM, RDFS } from "@im-library/vocabulary";
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
  height: 100%;
  width: calc(50% - 0.5rem);
}
.dashcard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.description {
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.content {
  flex: 1 1 auto;
}

.loading-container {
  width: 100%;
}
</style>
