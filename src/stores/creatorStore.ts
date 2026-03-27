import { defineStore } from "pinia";
import { useUserStore } from "@/stores/userStore";
import { localStorageWithExpiry } from "vue-library/helpers";
import { ExtendedTTEntity } from "vue-library/interfaces";
import { ref } from "vue";
import { C } from "vitest/dist/chunks/reporters.d.79o4mouw.js";

export const useCreatorStore = defineStore("creator", () => {
  const creatorSavedEntity = ref<any>(localStorageWithExpiry.getItem("creatorSavedEntity") ?? {});
  const creatorHasChanges = ref<boolean>(false);

  function updateCreatorSavedEntity(entity: ExtendedTTEntity | undefined) {
    if (useUserStore().cookiesOptionalAccepted) {
      creatorSavedEntity.value = entity;
      if (entity && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("creatorSavedEntity", entity);
      else localStorage.removeItem("creatorSavedEntity");
    }
  }

  function updateCreatorHasChanges(bool: boolean) {
    creatorHasChanges.value = bool;
  }
  return {
    creatorHasChanges,
    creatorSavedEntity,
    updateCreatorHasChanges,
    updateCreatorSavedEntity
  };
});
