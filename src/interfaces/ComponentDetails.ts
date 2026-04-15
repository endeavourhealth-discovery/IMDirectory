import type { PropertyShape } from "vue-library/interfaces";

import { ComponentType, EditorMode } from "../enums";

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
