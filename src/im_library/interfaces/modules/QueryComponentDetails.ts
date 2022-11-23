import { QueryComponentType } from "../../enums/Enums";
import { BuilderType } from "../../enums/modules/BuilderType";

export interface QueryComponentDetails {
  id: string;
  value: any;
  position: number;
  type: QueryComponentType;
  json: any;
  builderType: BuilderType;
  showButtons?: { minus: boolean; plus: boolean };
}
