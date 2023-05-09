import { defineStore } from "pinia";
import { CreatorState } from "@/stores/types/creatorState";
import { useUserStore } from "@/stores/userStore";
export const useCreatorStore = defineStore("creator", {
  state: (): CreatorState => ({
    creatorSavedEntity: JSON.parse(localStorage.getItem("creatorSavedEntity") ?? "{}") as any,
    creatorHasChanges: false
  }),
  actions: {
    updateCreatorSavedEntity(entity: any) {
      if (useUserStore().cookiesOptionalAccepted) {
        this.creatorSavedEntity = entity;
        if (entity && useUserStore().cookiesOptionalAccepted) localStorage.setItem("creatorSavedEntity", JSON.stringify(entity));
        else localStorage.removeItem("creatorSavedEntity");
      }
    },
    updateCreatorHasChanges(bool: boolean) {
      this.creatorHasChanges = bool;
    }
  }
});
