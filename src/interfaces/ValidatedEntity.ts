import { TTEntity } from "@/interfaces/ExtendedAutoGen";

export interface ValidatedEntity extends TTEntity {
  validationCode?: string;
  validationLabel?: string;
}
