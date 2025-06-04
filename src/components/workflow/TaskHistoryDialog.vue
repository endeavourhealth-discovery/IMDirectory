<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Task history'" :style="{ width: '75vw' }">
    <DataTable :value="taskHistory" :scrollable="true" scrollHeight="flex" :autoLayout="true" :total-records="taskHistory.length">
      <template #empty>None</template>
      <Column field="predicate" header="Predicate">
        <template #body="slotProps">
          {{ predicateToText(slotProps.data.predicate) }}
        </template>
      </Column>
      <Column field="originalObject" header="Original value"></Column>
      <Column field="newObject" header="New value"></Column>
      <Column field="changeDate" header="Modified at">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.changeDate) }}
        </template>
      </Column>
      <Column field="modifiedBy" header="Modified by"></Column>
    </DataTable>
    <template #footer>
      <Button label="Close" @click="visible = false" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDateTime } from "@/helpers/Datetime/FormatDateTime";
import { TaskHistory } from "@/interfaces/AutoGen";
import { IM, WORKFLOW } from "@/vocabulary";

interface Props {
  showDialog: boolean;
  taskHistory: TaskHistory[];
}

const props = defineProps<Props>();

const visible = defineModel("showDialog", { type: Boolean, default: false });

function predicateToText(predicate: string) {
  const predEnd = predicate.split("#")[1];
  return camelCaseToSentenceCase(predEnd);
}

function camelCaseToSentenceCase(camelCase: string) {
  const asSentenceCase = camelCase.replace(/([A-Z])/g, " $1").toLowerCase();
  return asSentenceCase.charAt(0).toUpperCase() + asSentenceCase.slice(1);
}
</script>

<style scoped></style>
