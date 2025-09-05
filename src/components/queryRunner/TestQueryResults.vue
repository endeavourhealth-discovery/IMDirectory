<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Test Query Results"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="test-query-results-dialog"
  >
    <div class="query-results-dialog-content">
      <DataTable :value="testQueryResults" :scrollable="true" scroll-height="flex" :autoLayout="true" :lazy="true" :loading="loading">
        <template #empty>None</template>
        <Column field="id" header="Patient ID"></Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="im-dialog-footer">
        <div class="button-footer">
          <Button label="Close" @click="closeDialog" text />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DBEntry } from "@/interfaces/AutoGen";
import { QueryService } from "@/services";
import { cloneDeep } from "lodash-es";
import { Ref, ref } from "vue";

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
