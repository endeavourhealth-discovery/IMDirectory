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
      v-if="
        queryQueueItem.status && [QueryExecutorStatus.COMPLETED, QueryExecutorStatus.CANCELLED, QueryExecutorStatus.ERRORED].includes(queryQueueItem.status)
      "
      icon="fa-duotone fa-solid fa-repeat"
      severity="warn"
      class="p-button-rounded p-button-text activity-row-button"
      @click="requeueQuery"
      v-tooltip.left="'Requeue query'"
      data-testid="requeue-query-button"
    />
    <Button
      v-if="queryQueueItem.status && [QueryExecutorStatus.ERRORED].includes(queryQueueItem.status)"
      icon="fa-duotone fa-solid fa-triangle-exclamation"
      class="p-button-rounded p-button-text activity-row-button"
      @click="showErrorDialog = true"
      v-tooltip.left="'Error details'"
      data-testid="show-error-button"
    />
    <Button
      v-if="queryQueueItem.status === QueryExecutorStatus.COMPLETED"
      icon="fa-duotone fa-solid fa-list"
      class="p-button-rounded p-button-text p-button-plain activity-row-button"
      @click="viewQueryResults"
      v-tooltip.left="'View results'"
      data-testid="view-query-results-button"
    />
    <Button
      icon="fa-duotone fa-solid fa-trash"
      severity="danger"
      class="p-button-rounded p-button-text activity-row-button"
      @click="deleteQuery"
      v-tooltip.left="'Delete'"
      data-testid="delete-query-button"
    />
  </div>
  <Dialog v-model:visible="showErrorDialog" modal maximizable header="Error details">
    <div>{{ queryQueueItem.error }}</div>
    <template #footer>
      <div class="im-dialog-footer">
        <div class="button-footer">
          <Button label="Close" @click="showErrorDialog = false" text />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DBEntry, QueryExecutorStatus } from "@/interfaces/AutoGen";
import { useConfirm } from "primevue/useconfirm";
import { ref } from "vue";

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

const showErrorDialog = ref(false);

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
  emit("viewQueryResults", props.queryQueueItem);
}

function requeueQuery() {
  emit("requeueQuery", props.queryQueueItem.id);
}

function showErrorDetails() {}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-content-background) !important;
  z-index: 999;
}
</style>
