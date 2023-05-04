import { defineStore } from "pinia";
import { EditorState } from "@/stores/types/editorState";
import { useCookieStore } from "@/stores/cookieStore";

const cookieStore = useCookieStore();
export const useEditorStore = defineStore("editor", {
    state: (): EditorState => ({
        editorIri: localStorage.getItem("editorSelectedIri") as string,
        editorSavedEntity: JSON.parse(localStorage.getItem("editorSavedEntity") || "{}") as any,
        editorHasChanges: false as boolean,
        findInEditorTreeIri: "",
        refreshEditorTree: false as boolean,
        eclEditorSavedString: localStorage.getItem("eclEditorSavedString") || ("" as string),
    }),
    actions: {
        updateEditorIri(iri: any) {
            this.editorIri = iri;
            if (cookieStore.cookiesOptionalAccepted) localStorage.setItem("editorSelectedIri", iri);
        },
        updateEditorSavedEntity(entity: any) {
            this.editorSavedEntity = entity;
            if (entity && cookieStore.cookiesOptionalAccepted) localStorage.setItem("editorSavedEntity", JSON.stringify(entity));
            else localStorage.removeItem("editorSavedEntity");
        },
        updateEditorHasChanges(bool: any) {
            this.editorHasChanges = bool;
        },
        updateFindInEditorTreeIri(iri: any) {
            this.findInEditorTreeIri = iri;
        },
        updateRefreshTree() {
            this.refreshEditorTree = !this.refreshEditorTree;
        },
        updateEclEditorSavedString(ecl: any) {
            this.eclEditorSavedString = ecl;
            if (ecl && cookieStore.cookiesOptionalAccepted) localStorage.setItem("eclEditorSavedString", ecl);
            else localStorage.removeItem("eclEditorSavedString");
        }
    }
});
