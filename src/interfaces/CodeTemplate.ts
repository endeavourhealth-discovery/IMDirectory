import type { GenericObject } from "@endeavour/vue-library/interfaces";

export interface CodeTemplate {
  name: string;
  extension: string;
  collectionWrapper: string;
  datatypeMap: GenericObject;
  template: string;
  complexTypes: boolean;
}
