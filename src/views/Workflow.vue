<template>
  <div id="topbar-mapper-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Workflow</strong></span>
      </template>
    </TopBar>

    <SideBar />

    <div :class="showInfo ? 'main-container' : ''">
      <div :class="showInfo ? 'main-view' : ''">
        <div v-if="workflowLoading" class="flex flex-1 flex-row items-center justify-center"><ProgressSpinner /></div>
        <router-view v-else v-slot="{ Component }: any">
          <keep-alive>
            <component :is="Component" @showDetails="showDetails" @updateSelected="updateSelected" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, computed } from "vue";
import SideBar from "@/components/workflow/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import WorkflowService from "@/services/WorkflowService";
import { Task, WorkflowResponse } from "@/interfaces/AutoGen";
import { useLoadingStore } from "@/stores/loadingStore";

const loadingStore = useLoadingStore();
const workflowLoading = computed(() => loadingStore.workflowLoading);

const showInfo = ref(false);
const selectedConceptIri = ref("");
const myWorkflows: Ref<WorkflowResponse | undefined> = ref();
const unassignedTasks: Ref<WorkflowResponse | undefined> = ref();
const task: Ref<Task | undefined> = ref();
const assignedWorkflows: Ref<Task[]> = ref([]);

onMounted(async () => {
  // myWorkflows.value = await WorkflowService.getTasksByCreatedBy();
  task.value = await WorkflowService.getBugReport("http://endhealth.info/workflow#10000000");
  task.value.assignedTo = task.value.createdBy;
  await WorkflowService.updateTask(task.value);
  task.value = await WorkflowService.getBugReport("http://endhealth.info/workflow#10000000");
  // unassignedTasks.value = await WorkflowService.getUnassignedTasks();
});

function updateSelected(selectedIri: string) {
  selectedConceptIri.value = selectedIri;
}

function showDetails(selectedIri: string) {
  selectedConceptIri.value = selectedIri;
  showInfo.value = true;
}

function hideDetails() {
  showInfo.value = false;
}
</script>

<style scoped lang="scss">
#topbar-mapper-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.steps-json-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  overflow: auto;
  position: relative;
}

.steps-content {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  background-color: #ffffff;
}

.p-steps {
  width: 100%;
}

.main-container {
  display: flex;
}

.main-view {
  flex: 75%;
}

.details-view {
  flex: 25%;
}
</style>
