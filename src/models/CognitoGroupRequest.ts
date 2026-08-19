import { UserRole } from "@endeavour/vue-library/enums";

import z from "zod";

// export interface CognitoGroupRequest {
//   username?: string;
//   groupName?: UserRole;
// }

export const CognitoGroupRequestSchema = z.strictObject({
  username: z.string(),
  groupName: z.enum(UserRole)
});

export type CognitoGroupRequest = z.output<typeof CognitoGroupRequestSchema>;

export function isCognitoRequest(value: unknown): value is CognitoGroupRequest {
  return CognitoGroupRequestSchema.safeParse(value).success;
}
