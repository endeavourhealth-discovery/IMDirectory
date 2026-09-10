import z from "zod";

import { Concept, ConceptSchema } from "./Concept";

// export interface SetContent {
//   name?: string;
//   description?: string;
//   status?: string;
//   version?: number;
//   setDefinition?: string;
//   subsets?: string[];
//   concepts?: Concept[];
// }

export const SetContentSchema = z.strictObject({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  version: z.number().optional(),
  setDefinition: z.string().optional(),
  subsets: z.array(z.string()).optional(),
  concepts: z.array(ConceptSchema).optional()
});

export type SetContent = z.output<typeof SetContentSchema>;

export function isSetContent(value: unknown): value is SetContent {
  return SetContentSchema.safeParse(value).success;
}
