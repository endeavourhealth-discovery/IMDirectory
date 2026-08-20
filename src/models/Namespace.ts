import z from "zod";

// export interface Namespace {
//   iri: string;
//   name: string;
//   prefix: string;
// }

export const NamespaceSchema = z.strictObject({
  iri: z.url(),
  name: z.string(),
  prefix: z.string()
});

export type Namespace = z.output<typeof NamespaceSchema>;

export function isNamespace(value: unknown): value is Namespace {
  return NamespaceSchema.safeParse(value).success;
}
