import z from "zod";

import { ValueTemplateSchema } from "./ValueTemplate";

// export interface ParameterTemplate extends Entity {
//   label?: string;
//   order?: number;
//   valueTemplate?: ValueTemplate[];
// }

export const ParameterTemplateSchema = z.strictObject({
  label: z.string().optional(),
  order: z.string().optional(),
  valueTemplate: z.array(ValueTemplateSchema).optional()
});

export type ParameterTemplate = z.output<typeof ParameterTemplateSchema>;

export function isParameterTemplate(value: unknown): value is ParameterTemplate {
  return ParameterTemplateSchema.safeParse(value).success;
}
