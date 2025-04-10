<template>
  <div class="flex items-center gap-1">
    <Button
      icon="fa-duotone fa-solid fa-magnifying-glass"
      class="p-button-rounded p-button-text p-button-plain activity-row-button"
      @click="goToQuery"
      v-tooltip.top="'View query'"
      data-testid="view-query-button"
    />
    <Button
      v-if="queryQueueItem.status && [QueryExecutorStatus.QUEUED, QueryExecutorStatus.RUNNING].includes(queryQueueItem.status)"
      icon="fa-duotone fa-solid fa-ban"
      severity="danger"
      class="p-button-rounded p-button-text activity-row-button"
      @click="cancelQuery"
      v-tooltip.left="'Cancel query'"
      data-testid="cancel-query-button"
    />
    <Button
      v-if="queryQueueItem.status && [QueryExecutorStatus.CANCELLED, QueryExecutorStatus.ERRORED].includes(queryQueueItem.status)"
      icon="fa-duotone fa-solid fa-repeat"
      severity="warn"
      class="p-button-rounded p-button-text activity-row-button"
      @click="requeueQuery"
      v-tooltip.left="'Requeue query'"
      data-testid="requeue-query-button"
    />
    <Button
      v-if="queryQueueItem.status === QueryExecutorStatus.CANCELLED"
      icon="fa-duotone fa-solid fa-trash"
      severity="danger"
      class="p-button-rounded p-button-text activity-row-button"
      @click="deleteQuery"
      v-tooltip.left="'Delete from queue'"
      data-testid="delete-query-button"
    />
    <Button
      v-if="queryQueueItem.status === QueryExecutorStatus.COMPLETED"
      icon="fa-duotone fa-solid fa-list"
      class="p-button-rounded p-button-text p-button-plain activity-row-button"
      @click="viewQueryResults"
      v-tooltip.left="'View results'"
      data-testid="view-query-results-button"
    />
  </div>
</template>

<script setup lang="ts">
import { DBEntry, QueryExecutorStatus } from "@/interfaces/AutoGen";
import { useConfirm } from "primevue/useconfirm";

interface Props {
  queryQueueItem: DBEntry;
}

const props = defineProps<Props>();

const emit = defineEmits({
  goToQuery: _payload => true,
  cancelQuery: _payload => true,
  viewQueryResults: _payload => true,
  deleteQuery: _payload => true,
  requeueQuery: _payload => true
});

const confirm = useConfirm();

function goToQuery() {
  emit("goToQuery", props.queryQueueItem.queryIri);
}

function cancelQuery() {
  confirm.require({
    message: "Are you sure you want to cancel query '" + props.queryQueueItem.queryName + "'?",
    header: "Confirm cancellation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Yes"
    },
    accept: () => emit("cancelQuery", props.queryQueueItem.id),
    reject: () => confirm.close()
  });
}

function deleteQuery() {
  confirm.require({
    message: "Are you sure you want to delete query '" + props.queryQueueItem.queryName + "' from the queue?",
    header: "Confirm cancellation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Yes"
    },
    accept: () => emit("deleteQuery", props.queryQueueItem.id),
    reject: () => confirm.close()
  });
}

function viewQueryResults() {
  emit("viewQueryResults", props.queryQueueItem.id);
}

function requeueQuery() {
  emit("requeueQuery", props.queryQueueItem.id);
}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-content-background) !important;
  z-index: 999;
}
</style>
