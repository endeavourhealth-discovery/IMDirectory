import { GenericType } from "./GenericType.js";

export interface Field {
  name: string;
  type: string;
  genericType: string | GenericType;
}
