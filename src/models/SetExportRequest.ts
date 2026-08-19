import z from "zod";

import { SetOptionsSchema } from "./SetOptions";

// export interface SetExportRequest {
//   ownRow?: boolean;
//   format?: string;
//   options?: SetOptions;
// }

export const SetExportRequestSchema = z.strictObject({
  ownRow: z.boolean().optional(),
  format: z.string().optional(),
  options: SetOptionsSchema.optional()
});

export type SetExportRequest = z.output<typeof SetExportRequestSchema>;

export function isSetExportRequest(value: unknown): value is SetExportRequest {
  return SetExportRequestSchema.safeParse(value).success;
}
