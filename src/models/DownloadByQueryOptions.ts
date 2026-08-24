import { QueryRequest, QueryRequestSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { ECLQueryRequest, ECLQueryRequestSchema } from "./ECLQueryRequest";

export interface DownloadByQueryOptions {
  queryRequest?: QueryRequest;
  eclSearchRequest?: ECLQueryRequest;
  totalCount?: number;
  format?: string;
  includeDefinition?: boolean;
  includeCore?: boolean;
  includeLegacy?: boolean;
  includeSubsets?: boolean;
  subsetsOnOwnRow?: boolean;
  im1id?: boolean;
}

export const DownloadByQueryOptionsSchema = z.strictObject({
  queryRequest: QueryRequestSchema.optional(),
  eclSearchRequest: ECLQueryRequestSchema.optional(),
  totalCount: z.number().optional(),
  format: z.string().optional(),

  includeDefinition: z.boolean().optional(),
  includeCore: z.boolean().optional(),
  includeLegacy: z.boolean().optional(),
  includeSubsets: z.boolean().optional(),
  subsetsOnOwnRow: z.boolean().optional(),
  im1id: z.boolean().optional()
});

// export type DownloadByQueryOptions = z.output<typeof DownloadByQueryOptionsSchema>;

export function isDownloadByQueryOptions(value: unknown): value is DownloadByQueryOptions {
  return DownloadByQueryOptionsSchema.safeParse(value).success;
}
