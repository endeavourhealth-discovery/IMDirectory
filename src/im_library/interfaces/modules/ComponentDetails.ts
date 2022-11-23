import { EditorMode } from "../../enums/Enums";
import { BuilderType } from "../../enums/modules/BuilderType";
import { ComponentType } from "../../enums/modules/ComponentType";
import { PropertyGroup } from "./PropertyGroup";
import { PropertyShape } from "./PropertyShape";

export interface ComponentDetails {
  id: string;
  value: any;
  position: number;
  type: ComponentType;
  json: any;
  showButtons?: { minus: boolean; plus: boolean; up: boolean; down: boolean };
  shape: PropertyShape | PropertyGroup;
  mode: EditorMode;
}
