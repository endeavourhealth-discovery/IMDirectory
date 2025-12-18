import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingStore = defineStore("loading", () => {
  const viewsLoading = ref<boolean>(false);
  const directoryLoading = ref<boolean>(false);
  const authLoading = ref<boolean>(false);
  const uprnLoading = ref<boolean>(false);
  const adminToolboxLoading = ref<boolean>(false);
  const workflowLoading = ref<boolean>(false);

  function updateViewsLoading(bool: boolean) {
    viewsLoading.value = bool;
  }

  function updateDirectoryLoading(bool: boolean) {
    directoryLoading.value = bool;
  }

  function updateAuthLoading(bool: boolean) {
    authLoading.value = bool;
  }

  function updateUprnLoading(bool: boolean) {
    uprnLoading.value = bool;
  }

  function updateAdminToolboxLoading(bool: boolean) {
    adminToolboxLoading.value = bool;
  }

  function updateWorkflowLoading(bool: boolean) {
    workflowLoading.value = bool;
  }

  return {
    adminToolboxLoading,
    authLoading,
    directoryLoading,
    uprnLoading,
    viewsLoading,
    workflowLoading,
    updateAdminToolboxLoading,
    updateAuthLoading,
    updateDirectoryLoading,
    updateUprnLoading,
    updateViewsLoading,
    updateWorkflowLoading
  };
});
