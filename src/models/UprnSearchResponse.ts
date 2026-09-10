import z from "zod";

import { Address, AddressSchema } from "./Address";
import { MatchPattern, MatchPatternSchema } from "./MatchPattern";

// export interface UprnSearchResponse {
//   ABPAddress: Address;
//   Address_format: string;
//   Algorithm: string;
//   ClassTerm: string;
//   Classification: string;
//   MatchPattern: MatchPattern;
//   Matched: boolean;
//   Postcode_quality: string;
//   Qualifier: string;
//   UPRN: string;
// }

export const UprnSearchResponseSchema = z.strictObject({
  ABPAddesss: AddressSchema,
  Address_format: z.string(),
  Algorithm: z.string(),
  ClassTerm: z.string(),
  Classification: z.string(),
  MatchPattern: MatchPatternSchema,
  Matched: z.boolean(),
  Postcode_quality: z.string(),
  Qualifier: z.string(),
  UPRN: z.string()
});

export type UprnSearchResponse = z.output<typeof UprnSearchResponseSchema>;

export function isUprnSearchResponse(value: unknown): value is UprnSearchResponse {
  return UprnSearchResponseSchema.safeParse(value).success;
}
