<template>
  <Dialog
    v-model:visible="showDialog"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="test-query-results-dialog"
    header="Test Query Results"
    maximizable
    modal
  >
    <div class="query-results-dialog-content">
      <DataTable :autoLayout="true" :lazy="true" :loading="loading" :scrollable="true" :value="testQueryResults" scroll-height="flex">
        <template #empty>None</template>
        <Column field="id" header="Patient ID"></Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="im-dialog-footer">
        <div class="button-footer">
          <Button label="Close" text @click="closeDialog" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface Props {
  testQueryResults: string[];
}

const props = defineProps<Props>();

const showDialog = defineModel<boolean>("showDialog");

const loading = ref(false);

function closeDialog() {
  showDialog.value = false;
}
</script>

<style scoped></style>
