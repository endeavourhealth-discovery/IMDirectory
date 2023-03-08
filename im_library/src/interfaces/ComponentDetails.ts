import { ComponentType, EditorMode } from "../enums";
import { PropertyGroup, PropertyShape } from "../models/AutoGen";

export interface ComponentDetails {
  id: string;
  value: any;
  position: number;
  type: ComponentType;
  json: any;
  showButtons?: { minus: boolean; plus: boolean; up: boolean; down: boolean };
  shape: PropertyShape | PropertyGroup;
  mode: EditorMode;
  showTitles?: boolean;
}
