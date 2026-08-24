import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { Entity, EntitySchema } from "./Entity";

// export interface ValueTemplate extends Entity {
//   label?: string;
//   parameter?: string;
//   order?: number;
//   valueType?: TTIriRef;
//   defaultValue?: any;
//   valueOption?: any[];
// }

export const ValueTemplateSchema = EntitySchema.extend({
  label: z.string().optional(),
  parameter: z.string().optional(),
  order: z.number().optional(),
  valueType: TTIriRefSchema.optional(),
  defaultValue: z.any(),
  valueOption: z.array(z.any()).optional()
});

export type ValueTemplate = z.output<typeof ValueTemplateSchema>;

export function isValueTemplate(value: unknown): value is ValueTemplate {
  return ValueTemplateSchema.safeParse(value).success;
}
