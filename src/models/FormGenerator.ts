import { TTIriRefSchema } from "@endeavour/vue-library/models";
import { TTEntitySchema } from "@endeavour/vue-library/models";
import { PropertyShapeSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface FormGenerator {
//   iri?: string;
//   status?: TTIriRef;
//   label?: string;
//   comment?: string;
//   targetShape?: TTIriRef;
//   type?: TTIriRef[];
//   isContainedIn?: TTEntity[];
//   subClassOf?: TTIriRef[];
//   scheme?: TTIriRef;
//   property?: PropertyShape[];
// }

export const FormGeneratorSchema = z.strictObject({
  iri: z.url().optional(),
  status: TTIriRefSchema.optional(),
  label: z.string().optional(),
  comment: z.string().optional(),
  targetShape: TTIriRefSchema.optional(),
  type: z.array(TTIriRefSchema).optional(),
  isContainedIn: z.array(TTEntitySchema).optional(),
  subClassOf: z.array(TTIriRefSchema).optional(),
  scheme: TTIriRefSchema.optional(),
  property: z.array(PropertyShapeSchema).optional()
});

export type FormGenerator = z.output<typeof FormGeneratorSchema>;

export function isFormGenerator(value: unknown): value is FormGenerator {
  return FormGeneratorSchema.safeParse(value).success;
}
