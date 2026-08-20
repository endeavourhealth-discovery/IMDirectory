import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { Entity, EntitySchema } from "./Entity";
import { ParameterTemplateSchema } from "./ParameterTemplate";

// export interface FunctionTemplate extends Entity {
//   function?: TTIriRef;
//   parameterTemplate?: ParameterTemplate[];
// }

export const FunctionTemplateSchema = z.strictObject({
  ...EntitySchema.shape,
  function: TTIriRefSchema.optional(),
  parameterTemplate: z.array(ParameterTemplateSchema).optional()
});

export type FunctionTemplate = z.output<typeof FunctionTemplateSchema>;

export function isFunctionTemplate(value: unknown): value is FunctionTemplate {
  return FunctionTemplateSchema.safeParse(value).success;
}
