import { SimplifiedType } from "./SimplifiedType";

export interface QueryObject {
  key: number;
  label: string;
  type: SimplifiedType;
  value?: any;
  children?: QueryObject[];
  selectable?: boolean;
}
