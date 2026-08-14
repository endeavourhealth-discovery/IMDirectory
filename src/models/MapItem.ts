import z from "zod";

export const MapItemSchema = z.strictObject({
  assuranceLevel: z.string(),
  iri: z.url(),
  name: z.string(),
  priority: z.number()
});

export type MapItem = z.output<typeof MapItemSchema>;

export function isMapItem(value: unknown): value is MapItem {
  return MapItemSchema.safeParse(value).success;
}
