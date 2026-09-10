import { ref } from "vue";

import { RDFS } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { localStorageWithExpiry } from "@endeavour/vue-library/helpers";
import { type TTEntity, TTEntitySchema, isTTEntity } from "@endeavour/vue-library/models";
import { useUserStore } from "@endeavour/vue-library/stores";

import { isString } from "lodash-es";
import { defineStore } from "pinia";

import { EntityService } from "@/services";

export const useEditorStore = defineStore("editor", () => {
  const editorIri = ref<string>(localStorageWithExpiry.getItem("editorSelectedIri", isString) ?? "");
  const editorSavedEntity = ref<TTEntity | undefined>(localStorageWithExpiry.getItem("editorSavedEntity", isTTEntity) ?? undefined);
  const editorHasChanges = ref<boolean>(false);
  const findInEditorTreeIri = ref<string>("");
  const refreshEditorTree = ref<boolean>(false);
  const eclEditorSavedString = ref<string>(localStorageWithExpiry.getItem("eclEditorSavedString", isString) ?? "");

  function updateEditorIri(iri: string) {
    editorIri.value = iri;
    if (useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("editorSelectedIri", iri);
  }

  async function getConceptName(): Promise<string> {
    if (editorIri.value) {
      const result = await EntityService.getPartialEntity(editorIri.value, [RDFS.LABEL]);
      if (isObjectHasKeys(result, [RDFS.LABEL]) && typeof result[RDFS.LABEL] === "string") return result[RDFS.LABEL];
    }
    return "";
  }

  function updateEditorSavedEntity(entity: TTEntity | undefined) {
    editorSavedEntity.value = entity;
    if (entity && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("editorSavedEntity", entity);
    else localStorage.removeItem("editorSavedEntity");
  }

  function updateEditorHasChanges(bool: boolean) {
    editorHasChanges.value = bool;
  }

  function updateFindInEditorTreeIri(iri: string) {
    findInEditorTreeIri.value = iri;
  }

  function updateRefreshTree() {
    refreshEditorTree.value = !refreshEditorTree.value;
  }

  function updateEclEditorSavedString(ecl: string) {
    eclEditorSavedString.value = ecl;
    if (ecl && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("eclEditorSavedString", ecl);
    else localStorage.removeItem("eclEditorSavedString");
  }
  return {
    eclEditorSavedString,
    editorHasChanges,
    editorIri,
    editorSavedEntity,
    findInEditorTreeIri,
    refreshEditorTree,
    updateEclEditorSavedString,
    updateEditorHasChanges,
    updateEditorIri,
    updateEditorSavedEntity,
    updateFindInEditorTreeIri,
    updateRefreshTree,
    getConceptName
  };
});
