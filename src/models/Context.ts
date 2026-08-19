import z from "zod";

// export interface Context {
//   publisher: string;
//   system: string;
//   schema: string;
//   table: string;
//   field: string;
// }

export const ContextSchema = z.strictObject({
  publisher: z.string(),
  system: z.string(),
  schema: z.string(),
  table: z.string(),
  field: z.string()
});

export type Context = z.output<typeof ContextSchema>;

export function isContext(value: unknown): value is Context {
  return ContextSchema.safeParse(value).success;
}
