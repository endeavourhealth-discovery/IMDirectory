<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Argument values"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="argument-selector"
    :pt="{ content: { class: 'flex-auto' } }"
  >
    {{ queryArguments }}
    <DataTable :value="queryArguments" :paginator="true" :scrollable="true" scroll-height="flex" :autoLayout="true" :lazy="true" :loading="loading">
      <Column field="parameter" header="Parameter"></Column>
      <Column field="valueData" header="Value"></Column>
    </DataTable>
    {{ queryArguments }}
  </Dialog>
</template>

<script setup lang="ts">
import { Argument, DBEntry } from "@/interfaces/AutoGen";
import { onMounted, ref, watch } from "vue";

interface Props {
  queryItem: DBEntry | undefined;
}

const props = defineProps<Props>();

const showDialog = defineModel<boolean>("showDialog");

const queryArguments = ref<Argument[] | undefined>([]);
const loading = ref(false);

function getQueryArguments() {
  loading.value = true;
  if (props.queryItem?.queryRequest) {
    queryArguments.value = props.queryItem.queryRequest.argument;
    queryArguments.value.push({ parameter: "$reference", valueData: "2021-08-03T23:00:00.000Z" });
  }
  loading.value = false;
}

onMounted(() => {
  getQueryArguments();
});

watch(showDialog, () => {
  getQueryArguments();
});
</script>

<style scoped></style>
