import { GenericObject } from "./GenericObject";

export interface CodeTemplate {
  name: string;
  extension: string;
  collectionWrapper: string;
  datatypeMap: GenericObject;
  template: string;
  complexTypes: boolean;
}
