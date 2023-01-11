import { UIProperty } from "../UIProperty";

export interface DatasetObject {
  selectedProperties?: UIProperty[];
  selectedOrderBy?: UIProperty[];
  selectedGroupBy?: UIProperty[];
  selectedDirection?: string;
  selectedLimit?: number;
}
