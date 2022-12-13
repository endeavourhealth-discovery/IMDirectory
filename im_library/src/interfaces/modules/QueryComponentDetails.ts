import { BuilderType, QueryComponentType } from "../../enums/index.js";

export interface QueryComponentDetails {
  id: string;
  value: any;
  position: number;
  type: QueryComponentType;
  json: any;
  builderType: BuilderType;
  showButtons?: { minus: boolean; plus: boolean };
}
