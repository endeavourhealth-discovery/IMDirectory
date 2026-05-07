import { DynamicDialogOptions } from "primevue/dynamicdialogoptions";

export interface TypedDynamicDialogOptions<T = unknown> extends Omit<DynamicDialogOptions, "data"> {
  data?: T;
}
