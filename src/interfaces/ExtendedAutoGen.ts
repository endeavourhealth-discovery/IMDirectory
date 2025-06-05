import { EntityReferenceNode, TTEntity as GeneratedTTEntity, SearchResultSummary as GeneratedSearchResultSummary } from "./AutoGen";
import { GenericObject } from "./GenericObject";

export interface TTEntity extends GeneratedTTEntity, GenericObject {}

export interface TTBundle {
  entity: TTEntity;
  predicates: { [index: string]: string };
}

export interface ExtendedEntityReferenceNode extends EntityReferenceNode {
  name: string;
  icon: string[];
  hasGrandChildren?: boolean;
}

export interface SearchResultSummary extends GeneratedSearchResultSummary, GenericObject {}
