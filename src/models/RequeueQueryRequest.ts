import { QueryRequest, QueryRequestSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface RequeueQueryRequest {
//   queueId?: string;
//   queryRequest?: QueryRequest;
// }

export const RequeueQueryRequestSchema = z.strictObject({
  queryId: z.string(),
  queryRequest: QueryRequestSchema
});

export type RequeueQueryRequest = z.output<typeof RequeueQueryRequestSchema>;

export function isRequeueQueryRequest(value: unknown): value is RequeueQueryRequest {
  return RequeueQueryRequestSchema.safeParse(value).success;
}
