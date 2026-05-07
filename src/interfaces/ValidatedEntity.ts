import type { ExtendedTTEntity } from "@endeavour/vue-library/interfaces";

export interface ValidatedEntity extends ExtendedTTEntity {
  validationCode?: string;
  validationLabel?: string;
}
