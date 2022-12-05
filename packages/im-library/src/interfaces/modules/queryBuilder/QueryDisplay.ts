import { QueryDisplayType } from "../../../enums";

export interface QueryDisplay {
  key: number;
  label: string;
  type: QueryDisplayType;
  value?: any;
  children?: QueryDisplay[];
  selectable?: boolean;
}
