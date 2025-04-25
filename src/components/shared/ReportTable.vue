<template>
  <div :id="id" class="dashcard-container">
    <Card class="dashcard dash-table">
      <template #title v-if="title">
        <span>{{ title }}</span>
      </template>
      <template #subtitle v-if="subTitle">
        <span>{{ subTitle }}</span>
      </template>
      <template #content>
        <DataTable v-if="isCorrectInputData" :value="tableData" class="p-datatable-sm" :scrollable="true" scrollHeight="350px" :loading="loading">
          <template #header v-if="tableHeader"> {{ tableHeader }} </template>
          <Column field="label" header="Label"></Column>
          <Column field="count" header="Total"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import { RDFS, OWL } from "@/vocabulary";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

interface Props {
  title?: string;
  subTitle?: string;
  tableHeader?: string;
  inputData?: any[];
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  inputData: [] as any,
  id: "report-table"
});

const tableData: Ref<{ count: number; label: string }[]> = ref([]);
const loading = ref(false);

const isCorrectInputData = computed(() =>
  props.inputData?.every(item => isObjectHasKeys(item, [RDFS.LABEL, OWL.HAS_VALUE]) || isObjectHasKeys(item, ["count", "label"]))
);

onMounted(() => {
  getReportTableData();
});

function getReportTableData(): void {
  if (!isCorrectInputData.value) return;
  loading.value = true;
  for (const entry of props.inputData!) {
    if (isObjectHasKeys(entry, [RDFS.LABEL, OWL.HAS_VALUE])) {
      tableData.value.push({
        label: entry[RDFS.LABEL],
        count: entry[OWL.HAS_VALUE]
      });
    }
    if (isObjectHasKeys(entry, ["label", "count"])) {
      tableData.value.push({
        label: entry.label,
        count: entry.count
      });
    }
  }
  loading.value = false;
}
</script>

<style scoped>
.dashcard-container {
  height: 100%;
  width: 100%;
}

.dashcard {
  height: 100%;
  width: 100%;
}

.loading-container {
  width: 100%;
  height: 100%;
}
</style>
