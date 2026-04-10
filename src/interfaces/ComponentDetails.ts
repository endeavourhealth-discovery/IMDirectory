import { ComponentType, EditorMode } from "../enums";
import type { PropertyShape } from "vue-library/interfaces";

export interface ComponentDetails {
  id: string;
  value: any;
  position: number;
  type: ComponentType;
  json: any;
  showButtons?: { minus: boolean; plus: boolean; up: boolean; down: boolean };
  shape: PropertyShape;
  mode: EditorMode;
}
