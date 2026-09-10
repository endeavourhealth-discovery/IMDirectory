import z from "zod";

// export interface DownloadEntityOptions {
//   entityIri?: string;
//   format?: string;
//   includeHasSubtypes?: boolean;
//   includeInferred?: boolean;
//   includeProperties?: boolean;
//   includeMembers?: boolean;
//   expandMembers?: boolean;
//   expandSubsets?: boolean;
//   includeTerms?: boolean;
//   includeIsChildOf?: boolean;
//   includeHasChildren?: boolean;
//   includeInactive?: boolean;
// }

export const DownloadEntityOptionsSchema = z.strictObject({
  entityIri: z.url(),
  format: z.string().optional(),
  includeHasSubtypes: z.boolean().optional(),
  includeInferred: z.boolean().optional(),
  includeProperties: z.boolean().optional(),
  includeMembers: z.boolean().optional(),
  expandMembers: z.boolean().optional(),
  expandSubsets: z.boolean().optional(),
  includeTerms: z.boolean().optional(),
  includeIsChildOf: z.boolean().optional(),
  includeHasChildren: z.boolean().optional(),
  includeInactive: z.boolean().optional()
});

export type DownloadEntityOptions = z.output<typeof DownloadEntityOptionsSchema>;

export function isDownloadEntityOptions(value: unknown): value is DownloadEntityOptions {
  return DownloadEntityOptionsSchema.safeParse(value).success;
}
