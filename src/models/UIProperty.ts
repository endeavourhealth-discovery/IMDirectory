// export interface UIProperty {
//   iri: string;
//   name: string;
//   propertyType: "class" | "datatype" | "node";
//   valueType: string;
//   maxCount: number;
//   minCount: number;
//   valueLabel: string;
//   intervalUnitIri: string;
//   intervalUnitOptions: TTIriRef[];
//   unitIri: string;
//   unitOptions: TTIriRef[];
//   operatorIri: string;
//   operatorOptions: string[];
//   qualifierOptions: TTIriRef[];
//   setMemberCount: number;
// }
import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

export const UIPropertySchema = z.strictObject({
  iri: z.url(),
  name: z.string(),
  propertyType: z.enum(["class", "datatype", "node"]),
  valueType: z.string(),
  valueTypeName: z.string().optional(),
  maxCount: z.number().optional(),
  minCount: z.number().optional(),
  valueLabel: z.string().optional(),
  intervalUnitIri: z.string().optional(),
  intervalUnitOptions: z.array(TTIriRefSchema).optional(),
  unitIri: z.string().optional(),
  unitOptions: z.array(TTIriRefSchema).optional(),
  operatorIri: z.string().optional(),
  operatorOptions: z.array(z.string()).optional(),
  qualifierOptions: z.array(TTIriRefSchema).optional(),
  setMemberCount: z.number().optional()
});

export type UIProperty = z.output<typeof UIPropertySchema>;

export function isUIProperty(value: unknown): value is UIProperty {
  return UIPropertySchema.safeParse(value).success;
}
