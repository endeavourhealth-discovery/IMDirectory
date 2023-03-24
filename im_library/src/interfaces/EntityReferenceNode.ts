import { TTIriRef } from "../interfaces/AutoGen";

export interface EntityReferenceNode {
  "@id": string;
  hasChildren: boolean;
  hasGrandChildren: boolean;
  name: string;
  type: TTIriRef[];
  orderNumber: number;
}
