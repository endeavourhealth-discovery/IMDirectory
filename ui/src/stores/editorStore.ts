import { defineStore } from "pinia";
import { EditorState } from "@/stores/types/editorState";
import { useUserStore } from "@/stores/userStore";
import { EntityService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

export const useEditorStore = defineStore("editor", {
  state: (): EditorState => ({
    editorIri: localStorage.getItem("editorSelectedIri") as string,
    editorSavedEntity: JSON.parse(localStorage.getItem("editorSavedEntity") ?? "{}") as any,
    editorHasChanges: false,
    findInEditorTreeIri: "",
    refreshEditorTree: false,
    eclEditorSavedString: localStorage.getItem("eclEditorSavedString") ?? ("" as string)
  }),
  actions: {
    updateEditorIri(iri: string) {
      this.editorIri = iri;
      if (useUserStore().cookiesOptionalAccepted) localStorage.setItem("editorSelectedIri", iri);
    },
    async getConceptName(): Promise<string> {
      if (this.editorIri) {
        const result = await EntityService.getPartialEntity(this.editorIri, [RDFS.LABEL]);
        if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
      }
      return "";
    },
    updateEditorSavedEntity(entity: any) {
      this.editorSavedEntity = entity;
      if (entity && useUserStore().cookiesOptionalAccepted) localStorage.setItem("editorSavedEntity", JSON.stringify(entity));
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
      if (ecl && useUserStore().cookiesOptionalAccepted) localStorage.setItem("eclEditorSavedString", ecl);
      else localStorage.removeItem("eclEditorSavedString");
    }
  }
});
