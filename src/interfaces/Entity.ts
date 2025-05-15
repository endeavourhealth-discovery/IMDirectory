import { GenericObject } from "./GenericObject";

export interface EntityReference {
  iri: string;
  name: string;
}

export interface Entity extends EntityReference, GenericObject {
  type?: EntityReference[];
  description?: string;
  code?: string;
  scheme?: EntityReference;
  status?: EntityReference;
  isDescendentOf?: EntityReference[];
  hasChildren?: boolean;
  hasGrandChildren?: boolean;
  match?: string;
  weighting?: number;
  orderNumber?: number;
  listPosition?: number;
}
