<template>
  <div class="h-screen w-screen overflow-auto">
    <TopBar>
      <template #content>
        <div class="flex h-full w-full items-center">
          <span class="whitespace-nowrap text-[2rem]"><strong class="text-center">Query runner</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="h-[calc(100% - 3.5rem)] overflow-auto">
      <div class="bg-(--p-content-background) flex h-full flex-auto flex-col flex-nowrap overflow-auto">
        <DataTable
          :value="queryQueueItems"
          :paginator="true"
          :rows="rows"
          :scrollable="true"
          scrollHeight="flex"
          :autoLayout="true"
          @page="onPage($event)"
          :lazy="true"
          :totalRecords="totalCount"
          :rows-per-page-options="[rowsOriginal, rowsOriginal * 2, rowsOriginal * 4, rowsOriginal * 8]"
          :loading="searchLoading"
          :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'"
        >
          <template #empty>None</template>
          <Column field="id" header="ID"></Column>
          <Column field="queryIri" header="Iri"></Column>
          <Column field="queryName" header="Name"></Column>
          <Column field="userName" header="User"></Column>
          <Column field="queuedAt" header="Queued at">
            <template #body="slotProps">
              <span>{{ slotProps.data.queuedAt ? slotProps.data.queuedAt : "-" }}</span>
            </template>
          </Column>
          <Column field="startedAt" header="Started at">
            <template #body="slotProps">
              <span>{{ slotProps.data.startedAt ? slotProps.data.startedAt : "-" }}</span>
            </template>
          </Column>
          <Column field="finishedAt" header="Finished at">
            <template #body="slotProps">
              <span>{{ slotProps.data.finishedAt ? slotProps.data.finishedAt : "-" }}</span>
            </template>
          </Column>
          <Column field="killedAt" header="Killed at">
            <template #body="slotProps">
              <span>{{ slotProps.data.killedAt ? slotProps.data.killedAt : "-" }}</span>
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="slotProps">
              <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="slotProps.data.status" />
            </template>
          </Column>
          <Column>
            <template #body="slotProps">
              <ActionButtons
                :queryQueueItem="slotProps.data"
                @cancel-query="cancelQuery"
                @go-to-query="goToQuery"
                @view-query-results="viewQueryResults"
                @delete-query="deleteQuery"
                @requeue-query="requeueQuery"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButtons from "@/components/queryRunner/ActionButtons.vue";
import TopBar from "@/components/shared/TopBar.vue";
import { DBEntry, QueryExecutorStatus } from "@/interfaces/AutoGen";
import { DirectService, QueryService } from "@/services";
import { onMounted, Ref, ref } from "vue";
import { useRouter } from "vue-router";

const directService = new DirectService();
const router = useRouter();

const queryQueueItems: Ref<DBEntry[]> = ref([]);
const loading = ref(true);
const searchLoading = ref(false);
const totalCount = ref(0);
const page = ref(0);
const rows = ref(25);
const rowsOriginal = ref(25);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  await search();
  loading.value = false;
}

async function search() {
  searchLoading.value = true;
  const results = await QueryService.getQueryQueue(page.value, rows.value);
  totalCount.value = results.totalCount;
  queryQueueItems.value = results.result;
  searchLoading.value = false;
}

function getStatusSeverity(status: QueryExecutorStatus): "secondary" | "success" | "info" | "warn" | "danger" | "contrast" {
  switch (status) {
    case QueryExecutorStatus.QUEUED:
      return "warn";
    case QueryExecutorStatus.RUNNING:
      return "info";
    case QueryExecutorStatus.COMPLETED:
      return "success";
    case QueryExecutorStatus.ERRORED:
      return "danger";
    case QueryExecutorStatus.CANCELLED:
      return "contrast";
    default:
      return "info";
  }
}

async function cancelQuery(queryId: string) {
  await QueryService.cancelQuery(queryId);
}

function goToQuery(queryIri: string) {
  directService.view(queryIri);
}

async function viewQueryResults(queryId: string) {
  await router.push({ name: "QueryResults", params: { id: queryId } });
}

async function deleteQuery(queryId: string) {
  await QueryService.deleteFromQueryQueue(queryId);
}

async function requeueQuery(queryId: string) {
  const found = getById(queryId);
  if (found) await QueryService.requeueQuery({ queueId: found.id, queryRequest: found.queryRequest });
}

function getById(queryId: string): DBEntry | undefined {
  return queryQueueItems.value.find(item => item.id === queryId);
}

async function onPage(event: any) {
  page.value = event.page;
  rows.value = event.rows;
  await search();
  scrollToTop();
}

function scrollToTop() {
  const scrollArea = document.getElementsByClassName("p-datatable-scrollable-table")[0] as HTMLElement;
  scrollArea?.scrollIntoView({ block: "start", behavior: "smooth" });
}
</script>

<style scoped></style>
