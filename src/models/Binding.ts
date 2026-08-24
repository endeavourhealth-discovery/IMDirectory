import z from "zod";

// export interface Binding {
//   predicateBinding?: { [index: string]: string };
//   predicateObject?: { [index: string]: Binding };
// }

export const BindingSchema = z.strictObject({
  predicateBinding: z.record(z.string(), z.string()).default({}),
  get predicateObject() {
    return z.record(z.string(), BindingSchema).default({});
  }
});

export type Binding = z.output<typeof BindingSchema>;

export function isBinding(value: unknown): value is Binding {
  return BindingSchema.safeParse(value).success;
}
