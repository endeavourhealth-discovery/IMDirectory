import z from "zod";

import { UserJavaSchema } from "./UserJava";

// export interface LoginResponse {
//   user?: UserJava;
//   state?: string;
// }

export const LoginResponseSchema = z.strictObject({
  user: UserJavaSchema,
  state: z.string()
});

export type LoginResponse = z.output<typeof LoginResponseSchema>;

export function isLoginResponse(value: unknown): value is LoginResponse {
  return LoginResponseSchema.safeParse(value).success;
}
