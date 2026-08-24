import z from "zod";

// export interface SimpleMap {
//   iri: string;
//   code: string;
//   name: string;
//   scheme: string;
//   alternativeCode?: string;
//   codeId?: string;
// }

export const SimpleMapSchema = z.strictObject({
  iri: z.url(),
  code: z.string(),
  name: z.string(),
  scheme: z.string(),
  alternativeCode: z.string().optional(),
  codeId: z.string().optional()
});

export type SimpleMap = z.output<typeof SimpleMapSchema>;

export function isSimpleMap(value: unknown): value is SimpleMap {
  return SimpleMapSchema.safeParse(value).success;
}
