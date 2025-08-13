<template>
  <div id="workflow-table" class="grow">
    <DataTable
      :value="myWorkflows?.tasks"
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
      <Column header="ID">
        <template #body="{ data }">{{ data.id.iri }}</template>
      </Column>
      <Column field="createdBy" header="Created by"></Column>
      <Column field="type" header="Type"></Column>
      <Column field="state" header="State"></Column>
      <Column field="assignedTo" header="Assigned to"></Column>
      <Column field="dateCreated" header="Created at">
        <template #body="{ data }: any">{{ data.dateCreated ? formatDateTime(data.dateCreated) : "-" }}</template>
      </Column>
      <Column field="hostUrl" header="Host url"></Column>
      <Column header="History">
        <template #body="{ data }: any"
          ><Button
            label="Show history"
            @click="
              showHistoryDialog = true;
              taskHistory = data.history;
            "
        /></template>
      </Column>
      <Column>
        <template #body="{ data }: any">
          <Button label="Details" @click="showDetails(data)" />
        </template>
      </Column>
    </DataTable>
  </div>
  <TaskHistoryDialog v-if="taskHistory" v-model:show-dialog="showHistoryDialog" :task-history="taskHistory" />
</template>

<script setup lang="ts">
import { formatDateTime } from "@/helpers/Datetime/FormatDateTime";
import { Task, TaskHistory, TaskType, WorkflowResponse } from "@/interfaces/AutoGen";
import WorkflowService from "@/services/WorkflowService";
import { onMounted, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import TaskHistoryDialog from "./TaskHistoryDialog.vue";

interface Props {
  taskType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  taskType: "createdBy"
});

const router = useRouter();

const myWorkflows: Ref<WorkflowResponse | undefined> = ref();
const size = ref(25);
const page = ref(1);
const originalSize = ref(25);
const totalCount = ref(0);
const loading = ref(true);
const showHistoryDialog = ref(false);
const taskHistory: Ref<TaskHistory[] | undefined> = ref();

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  switch (props.taskType) {
    case "createdBy":
      myWorkflows.value = await WorkflowService.getTasksByCreatedBy(page.value, size.value);
      break;
    case "assignedTo":
      myWorkflows.value = await WorkflowService.getTasksByAssignedTo(page.value, size.value);
      break;
    case "unassigned":
      myWorkflows.value = await WorkflowService.getUnassignedTasks(page.value, size.value);
      break;
  }
  loading.value = false;
}

async function onPage(event: any) {
  page.value = event.page;
  size.value = event.rows;
  await init();
}

async function showDetails(data: Task) {
  switch (data.type) {
    case TaskType.BUG_REPORT: {
      await router.push({ name: "ViewBugReport", params: { id: data.id?.iri } });
      break;
    }
    case TaskType.ENTITY_APPROVAL: {
      await router.push({ name: "ViewEntityApproval", params: { id: data.id?.iri } });
      break;
    }
    case TaskType.ROLE_REQUEST: {
      await router.push({ name: "ViewRoleRequest", params: { id: data.id?.iri } });
      break;
    }
    case TaskType.GRAPH_REQUEST: {
      await router.push({ name: "ViewGraphRequest", params: { id: data.id?.iri } });
      break;
    }
    default: {
      throw new Error("Unexpected task type: " + data.type);
    }
  }
}
</script>

<style scoped></style>
