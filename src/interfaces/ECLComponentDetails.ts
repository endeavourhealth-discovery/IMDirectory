import { ECLComponent } from "../enums/ECLComponent";

export interface ECLComponentDetails {
  id: string;
  value: any;
  position: number;
  type: ECLComponent;
  queryString: string;
  showButtons?: { minus: boolean; plus: boolean };
}
