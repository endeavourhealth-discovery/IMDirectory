import { defineStore } from "pinia";
import { EditorState } from "@/stores/types/editorState";
import { useUserStore } from "@/stores/userStore";
import { EntityService } from "@/services";
import { RDFS } from "@/vocabulary";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

export const useEditorStore = defineStore("editor", {
  state: (): EditorState => ({
    editorIri: localStorageWithExpiry.getItem("editorSelectedIri"),
    editorSavedEntity: localStorageWithExpiry.getItem("editorSavedEntity") ?? {},
    editorHasChanges: false,
    findInEditorTreeIri: "",
    refreshEditorTree: false,
    eclEditorSavedString: localStorageWithExpiry.getItem("eclEditorSavedString") ?? ""
  }),
  actions: {
    updateEditorIri(iri: string) {
      this.editorIri = iri;
      if (useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("editorSelectedIri", iri);
    },
    async getConceptName(): Promise<string> {
      if (this.editorIri) {
        const result = await EntityService.getPartialEntity(this.editorIri, [RDFS.LABEL]);
        if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
      }
      return "";
    },
    updateEditorSavedEntity(entity: TTEntity | undefined) {
      this.editorSavedEntity = entity;
      if (entity && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("editorSavedEntity", entity);
      else localStorage.removeItem("editorSavedEntity");
    },
    updateEditorHasChanges(bool: boolean) {
      this.editorHasChanges = bool;
    },
    updateFindInEditorTreeIri(iri: string) {
      this.findInEditorTreeIri = iri;
    },
    updateRefreshTree() {
      this.refreshEditorTree = !this.refreshEditorTree;
    },
    updateEclEditorSavedString(ecl: string) {
      this.eclEditorSavedString = ecl;
      if (ecl && useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("eclEditorSavedString", ecl);
      else localStorage.removeItem("eclEditorSavedString");
    }
  }
});
