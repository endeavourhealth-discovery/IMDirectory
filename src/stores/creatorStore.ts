import { ref } from "vue";

import { localStorageWithExpiry } from "@endeavour/vue-library/helpers";
import type { ExtendedTTEntity } from "@endeavour/vue-library/models";
import { useUserStore } from "@endeavour/vue-library/stores";

import { defineStore } from "pinia";

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
