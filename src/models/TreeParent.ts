import z from "zod";

// export interface TreeParent {
//   name: string;
//   iri: string;
//   listPosition: number;
// }

export const TreeParentSchema = z.strictObject({
  name: z.string(),
  iri: z.url(),
  listPosition: z.number()
});

export type TreeParent = z.output<typeof TreeParentSchema>;

export function isTreeParent(value: unknown): value is TreeParent {
  return TreeParentSchema.safeParse(value).success;
}
