import { defineStore } from "pinia";
import { CreatorState } from "@/stores/types/creatorState";
import { useUserStore } from "@/stores/userStore";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";
import { TTEntity } from "@/interfaces/ExtentedAutoGen";

export const useCreatorStore = defineStore("creator", {
  state: (): CreatorState => ({
    creatorSavedEntity: localStorageWithExpiry.getItem("creatorSavedEntity") ?? {},
    creatorHasChanges: false
  }),
  actions: {
    updateCreatorSavedEntity(entity: TTEntity | undefined) {
      if (useUserStore().cookiesOptionalAccepted) {
        this.creatorSavedEntity = entity;
        if (entity && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("creatorSavedEntity", entity);
        else localStorage.removeItem("creatorSavedEntity");
      }
    },
    updateCreatorHasChanges(bool: boolean) {
      this.creatorHasChanges = bool;
    }
  }
});
