import { NamespacePermissionJava, NamespacePermissionJavaSchema, Task, TaskSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface NamespaceRequest extends Task {
//   namespacePermission?: NamespacePermissionJava;
// }

export const NamespaceRequestSchema = z.strictObject({
  ...TaskSchema.shape,
  namespacePermission: NamespacePermissionJavaSchema.optional()
});

export type NamespaceRequest = z.output<typeof NamespaceRequestSchema>;

export function isNamespaceRequest(value: unknown): value is NamespaceRequest {
  return NamespaceRequestSchema.safeParse(value).success;
}
