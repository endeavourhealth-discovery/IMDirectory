import { TTEntity } from "./AutoGen";

export interface ValidatedEntity extends TTEntity {
  validationCode?: string;
  validationLabel?: string;
}
