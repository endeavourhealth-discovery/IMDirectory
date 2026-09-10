import z from "zod";

// export interface MatchPattern {
//   Building: string;
//   Flat: string;
//   Number: string;
//   Postcode: string;
//   Street: string;
// }

export const MatchPatternSchema = z.strictObject({
  Building: z.string(),
  Flat: z.string(),
  Number: z.string(),
  Postcode: z.string(),
  Street: z.string()
});

export type MatchPattern = z.output<typeof MatchPatternSchema>;

export function isMatchPattern(value: unknown): value is MatchPattern {
  return MatchPatternSchema.safeParse(value).success;
}
