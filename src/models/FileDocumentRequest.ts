import { NAMESPACE } from "@endeavour/vue-library/enums";

import z from "zod";

import { TTDocumentSchema } from "./TTDocument";

// export interface FileDocumentRequest {
//   document?: TTDocument;
//   insertNamespace?: NAMESPACE;
// }

export const FileDocumentRequestSchema = z.strictObject({
  document: TTDocumentSchema,
  insertNamespace: z.enum(NAMESPACE).optional()
});

export type FileDocumentRequest = z.output<typeof FileDocumentRequestSchema>;

export function isFileDocumentRequest(value: unknown): value is FileDocumentRequest {
  return FileDocumentRequestSchema.safeParse(value).success;
}
