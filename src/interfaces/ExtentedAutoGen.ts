import { TTEntity as GeneratedTTEntity } from "./AutoGen";

export interface TTEntity extends GeneratedTTEntity {
  [key: string]: any;
}

export interface TTBundle {
  entity: TTEntity;
  predicates: { [index: string]: string };
}
