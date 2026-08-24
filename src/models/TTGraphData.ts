import z from "zod";

// export interface TTGraphData {
//   name: string;
//   iri: string;
//   relToParent: string;
//   children: TTGraphData[];
//   _children: TTGraphData[];
// }

export const TTGraphDataSchema = z.strictObject({
  name: z.string(),
  iri: z.string(),
  relToParent: z.string(),
  get children(): z.ZodPrefault<z.ZodArray<typeof TTGraphDataSchema>> {
    return z.array(TTGraphDataSchema).prefault([]);
  },
  get _children(): z.ZodPrefault<z.ZodArray<typeof TTGraphDataSchema>> {
    return z.array(TTGraphDataSchema).prefault([]);
  }
});

export type TTGraphData = z.output<typeof TTGraphDataSchema>;

export function isTTGraphData(value: unknown): value is TTGraphData {
  return TTGraphDataSchema.safeParse(value).success;
}
