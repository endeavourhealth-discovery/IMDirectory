import { TTIriRef } from "vue-library/interfaces";

export interface FilterOptions {
  status: TTIriRef[];
  schemes: TTIriRef[];
  types: TTIriRef[];
  typeSchemes?: Record<string, TTIriRef[]>;
}
