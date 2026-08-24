import z from "zod";

// export interface TermCode {
//   code: string;
//   name: string;
//   scheme: string;
//   entityTermCode?: string;
// }

export const TermCodeSchema = z.strictObject({
  code: z.string(),
  name: z.string(),
  scheme: z.string(),
  entityTermCode: z.string().optional()
});

export type TermCode = z.output<typeof TermCodeSchema>;

export function isTermCode(value: unknown): value is TermCode {
  return TermCodeSchema.safeParse(value).success;
}
