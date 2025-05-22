import { EntityReferenceNode, TTEntity as GeneratedTTEntity } from "./AutoGen";
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
