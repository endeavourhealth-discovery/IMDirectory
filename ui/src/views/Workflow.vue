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
        <router-view v-slot="{ Component }: any">
          <keep-alive>
            <component :is="Component" @showDetails="showDetails" @updateSelected="updateSelected" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import SideBar from "@/components/workflow/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import WorkflowService from "@/services/WorkflowService";
import { Task } from "@im-library/interfaces/AutoGen";

const showInfo = ref(false);
const selectedConceptIri = ref("");
const workflows: Ref<Task[]> = ref([]);

onMounted(async () => {
  workflows.value = await WorkflowService.getWorkflowByCreatedBy();
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
