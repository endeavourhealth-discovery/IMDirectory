import { TTEntity } from "@/interfaces/ExtendedAutoGen";

export interface EditorState {
  editorIri: string;
  editorSavedEntity: TTEntity | undefined;
  editorHasChanges: boolean;
  findInEditorTreeIri: string;
  refreshEditorTree: boolean;
  eclEditorSavedString: string;
}
