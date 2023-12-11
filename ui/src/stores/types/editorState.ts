import { EditHistoryItem } from "@im-library/interfaces";

export interface EditorState {
  editorIri: string;
  editorSavedEntity: any;
  editorHasChanges: boolean;
  findInEditorTreeIri: string;
  refreshEditorTree: boolean;
  eclEditorSavedString: string;
  editHistory: EditHistoryItem[];
  currentEditHistoryStateIndex: number;
}
