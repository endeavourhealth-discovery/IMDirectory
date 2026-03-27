import { ExtendedTTEntity } from "vue-library/interfaces";

export interface ValidatedEntity extends ExtendedTTEntity {
  validationCode?: string;
  validationLabel?: string;
}
