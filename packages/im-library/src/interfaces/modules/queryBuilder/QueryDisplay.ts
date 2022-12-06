import { QueryDisplayType } from "../../../enums/index.js";

export interface QueryDisplay {
  key: number;
  label: string;
  type: QueryDisplayType;
  value?: any;
  children?: QueryDisplay[];
  selectable?: boolean;
}
