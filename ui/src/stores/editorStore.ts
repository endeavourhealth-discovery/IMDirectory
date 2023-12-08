import { defineStore } from "pinia";
import { EditorState } from "@/stores/types/editorState";
import { useUserStore } from "@/stores/userStore";

export const useEditorStore = defineStore("editor", {
  state: (): EditorState => ({
    editorIri: localStorage.getItem("editorSelectedIri") as string,
    editorSavedEntity: JSON.parse(localStorage.getItem("editorSavedEntity") ?? "{}") as any,
    editorHasChanges: false,
    editorEntityStates: [] as any[],
    currentEntityStateIndex: 0,
    editorEntityUpdate: false,
    findInEditorTreeIri: "",
    refreshEditorTree: false,
    eclEditorSavedString: localStorage.getItem("eclEditorSavedString") ?? ("" as string)
  }),
  actions: {
    updateEditorIri(iri: string) {
      this.editorIri = iri;
      if (useUserStore().cookiesOptionalAccepted) localStorage.setItem("editorSelectedIri", iri);
    },
    updateEditorSavedEntity(entity: any) {
      this.editorSavedEntity = entity;
      this.addToEditorEntityStates(entity);
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
    },
    addToEditorEntityStates(editedEntity: any) {
      this.editorEntityStates.push({ ...editedEntity });
      // this.editorEntityUpdate = false;
      this.currentEntityStateIndex = this.editorEntityStates.length - 1;
    },
    updateCurrentEntityStateIndex(index: number) {
      this.currentEntityStateIndex = index;
    },
    initEditorState(currentEntity: any) {
      this.updateEditorSavedEntity(currentEntity);
      this.currentEntityStateIndex = 0;
      this.editorEntityStates = [];
    },
    updateEditorEntityUpdate(update: boolean) {
      console.log("store change");
      this.editorEntityUpdate = update;
    }
  }
});
