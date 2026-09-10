import z from "zod";

// export interface SetOptions {
//   setIri?: string;
//   schemes?: string[];
//   includeIM1id?: boolean;
//   subsumptions?: string[];
//   includeDefinition?: boolean;
//   includeCore?: boolean;
//   includeLegacy?: boolean;
//   includeSubsets?: boolean;
// }

export const SetOptionsSchema = z.strictObject({
  setIri: z.string().optional(),
  schemes: z.array(z.string()).optional(),
  includeIM1id: z.boolean().optional(),
  subsumptions: z.array(z.string()).optional(),
  includeDefinition: z.boolean().optional(),
  includeCore: z.boolean().optional(),
  includeLegacy: z.boolean().optional(),
  includeSubsets: z.boolean().optional()
});

export type SetOptions = z.output<typeof SetOptionsSchema>;

export function isSetOptions(value: unknown): value is SetOptions {
  return SetOptionsSchema.safeParse(value).success;
}
