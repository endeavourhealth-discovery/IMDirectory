import { defineStore } from "pinia";
import { useUserStore } from "vue-library/stores";
import { EntityService } from "@/services";
import { RDFS } from "vue-library/enums";
import { isObjectHasKeys } from "vue-library/helpers";
import { localStorageWithExpiry } from "vue-library/helpers";
import type { ExtendedTTEntity } from "vue-library/interfaces";
import { ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const editorIri = ref<string>(localStorageWithExpiry.getItem("editorSelectedIri"));
  const editorSavedEntity = ref<ExtendedTTEntity | undefined>(localStorageWithExpiry.getItem("editorSavedEntity") ?? {});
  const editorHasChanges = ref<boolean>(false);
  const findInEditorTreeIri = ref<string>("");
  const refreshEditorTree = ref<boolean>(false);
  const eclEditorSavedString = ref<string>(localStorageWithExpiry.getItem("eclEditorSavedString") ?? "");

  function updateEditorIri(iri: string) {
    editorIri.value = iri;
    if (useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("editorSelectedIri", iri);
  }

  async function getConceptName(): Promise<string> {
    if (editorIri.value) {
      const result = await EntityService.getPartialEntity(editorIri.value, [RDFS.LABEL]);
      if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
    }
    return "";
  }

  function updateEditorSavedEntity(entity: ExtendedTTEntity | undefined) {
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
