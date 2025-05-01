import { TTEntity } from "@/interfaces/ExtentedAutoGen";

export interface ValidatedEntity extends TTEntity {
  validationCode?: string;
  validationLabel?: string;
}
