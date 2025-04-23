<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Query Results"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="query-results-dialog"
  >
    <div class="query-results-dialog-content">
      <DataTable
        :value="queryResults"
        :paginator="true"
        :rows="size"
        :scrollable="true"
        scroll-height="flex"
        :autoLayout="true"
        @page="onPage($event)"
        :lazy="true"
        :total-records="totalCount"
        :rows-per-page-options="[originalSize, originalSize * 2, originalSize * 4, originalSize * 8]"
        :loading="loading"
        :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'"
      >
        <template #empty>None</template>
        <Column field="id" header="Patient ID"></Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="im-dialog-footer">
        <div class="button-footer">
          <Button label="Close" @click="closeDialog" text />
          <Button
            :disabled="!queryItem"
            data-testid="query-results-download"
            label="Download"
            :loading="downloadLoading"
            @click="downloadQueryResults()"
            autofocus
          />
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
  showDialog: boolean;
  queryItem: DBEntry | undefined;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

const loading = ref(false);
const downloadLoading = ref(false);
const queryResults: Ref<string[]> = ref([]);
const pageNumber = ref(1);
const size = ref(25);
const originalSize = ref(25);
const totalCount = ref(0);

function closeDialog() {
  emit("update:showDialog", false);
}

async function downloadQueryResults() {
  if (props.queryItem?.queryRequest) {
    const request = cloneDeep(props.queryItem.queryRequest);
    request.page = { pageNumber: pageNumber.value, pageSize: size.value };
    const results = await QueryService.getQueryResultsPaged(request);
    totalCount.value = results.totalCount;
    queryResults.value = results.result;
  }
}

async function onPage(event: any) {
  pageNumber.value = event.page;
  size.value = event.rows;
  await downloadQueryResults();
}
</script>

<style scoped></style>
