import z from "zod";

// export interface TTPrefix {
//   iri?: string;
//   prefix?: string;
//   name?: string;
// }

export const TTPrefixSchema = z.strictObject({
  iri: z.url().optional(),
  prefix: z.string().optional(),
  name: z.string().optional()
});

export type TTPrefix = z.output<typeof TTPrefixSchema>;

export function isTTPrefix(value: unknown): value is TTPrefix {
  return TTPrefixSchema.safeParse(value).success;
}
