import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";
import { Query, QuerySchema } from "@endeavour/vue-library/models";

import z from "zod";

import { ECLStatus, ECLStatusSchema } from "./ECLStatus";

export interface ECLQueryRequest {
  ecl?: string;
  query?: Query;
  showNames?: boolean;
  status?: ECLStatus;
  includeLegacy?: boolean;
  limit?: number;
  statusFilter?: TTIriRef[];
  page?: number;
  size?: number;
}

export const ECLQueryRequestSchema = z.strictObject({
  ecl: z.string().optional(),
  query: QuerySchema.optional(),
  showNames: z.boolean().optional(),
  status: ECLStatusSchema.optional(),
  includeLegacy: z.boolean().optional(),
  limit: z.number().default(1000),
  statusFilter: z.array(TTIriRefSchema).optional(),
  page: z.number().default(1),
  size: z.number().default(20)
}) satisfies z.ZodType<ECLQueryRequest>;

// export type ECLQueryRequest = z.output<typeof ECLQueryRequestSchema>;

export function isECLQueryRequest(value: unknown): value is ECLQueryRequest {
  return ECLQueryRequestSchema.safeParse(value).success;
}
