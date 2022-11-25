import { GenericType } from "./GenericType";

export interface Field {
  name: string;
  type: string;
  genericType: string | GenericType;
}
