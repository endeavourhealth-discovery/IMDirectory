import { BuilderType, QueryComponentType } from "../enums";

export interface QueryComponentDetails {
  id: string;
  value: any;
  position: number;
  type: QueryComponentType;
  json: any;
  builderType: BuilderType;
  showButtons?: { minus: boolean; plus: boolean };
}
