import type { ExtendedTTEntity } from "@endeavour/vue-library/models";

export interface ValidatedEntity extends ExtendedTTEntity {
  validationCode?: string;
  validationLabel?: string;
}
