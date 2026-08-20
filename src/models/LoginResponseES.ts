import z from "zod";

import { UserJavaSchema } from "./UserJava";

// export interface LoginResponseES {
//   sessionId?: string;
//   user?: UserJava;
//   state?: string;
// }

export const LoginResponseESSchema = z.strictObject({
  sessionId: z.string(),
  user: UserJavaSchema,
  state: z.string()
});

export type LoginResponseES = z.output<typeof LoginResponseESSchema>;

export function isLoginResponseES(value: unknown): value is LoginResponseES {
  return LoginResponseESSchema.safeParse(value).success;
}
