<template>
  <div id="topbar-mapper-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Workflow</strong></span>
        </div>
      </template>
    </TopBar>

    <div class="col flex grow overflow-auto">
      <SideBar />

      <div id="main-container" class="overflow-auto">
        <div id="main-view">
          <div v-if="workflowLoading" class="flex flex-1 flex-row items-center justify-center"><ProgressSpinner /></div>
          <router-view v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import SideBar from "@/components/workflow/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import { useLoadingStore } from "@/stores/loadingStore";

const loadingStore = useLoadingStore();
const workflowLoading = computed(() => loadingStore.workflowLoading);
</script>

<style scoped lang="scss">
#topbar-mapper-container {
  height: 100%;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

#main-container {
  display: flex;
  flex: 1 1 auto;
}

#main-view {
  flex: 1 1 auto;
  display: flex;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
</style>
