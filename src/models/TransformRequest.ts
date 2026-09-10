import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface TransformRequest {
//   transformMap?: TTIriRef;
//   sourceFormat?: string;
//   targetFormat?: string;
//   source?: { [index: string]: any[] };
// }

export const TransformRequestSchema = z.strictObject({
  transformMap: TTIriRefSchema.optional(),
  sourceFormat: z.string().optional(),
  targetFormat: z.string().optional(),
  source: z.record(z.string(), z.array(z.any()))
});

export type TransformRequest = z.output<typeof TransformRequestSchema>;

export function isTransformRequest(value: unknown): value is TransformRequest {
  return TransformRequestSchema.safeParse(value).success;
}
