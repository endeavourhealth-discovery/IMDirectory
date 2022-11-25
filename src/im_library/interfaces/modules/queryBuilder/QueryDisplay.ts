import { QueryDisplayType } from "@/im_library/enums";

export interface QueryDisplay {
  key: number;
  label: string;
  type: QueryDisplayType;
  value?: any;
  children?: QueryDisplay[];
  selectable?: boolean;
}
