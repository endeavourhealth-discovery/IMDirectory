import { defineStore } from "pinia";
import { LoadingState } from "./types/loadingState";

export const useLoadingStore = defineStore("loading", {
  state: (): LoadingState => ({
    viewsLoading: false,
    directoryLoading: false,
    authLoading: false,
    uprnLoading: false,
    adminToolboxLoading: false,
    workflowLoading: false
  }),
  actions: {
    updateViewsLoading(bool: boolean) {
      this.viewsLoading = bool;
    },
    updateDirectoryLoading(bool: boolean) {
      this.directoryLoading = bool;
    },
    updateAuthLoading(bool: boolean) {
      this.authLoading = bool;
    },
    updateUprnLoading(bool: boolean) {
      this.uprnLoading = bool;
    },
    updateAdminToolboxLoading(bool: boolean) {
      this.adminToolboxLoading = bool;
    },
    updateWorkflowLoading(bool: boolean) {
      this.workflowLoading = bool;
    }
  }
});
