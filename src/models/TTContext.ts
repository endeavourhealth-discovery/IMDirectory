import z from "zod";

import { TTPrefixSchema } from "./TTPrefix";

// export interface TTContext {
//   nameSpaces?: TTPrefix[];
//   prefixes?: TTPrefix[];
// }

export const TTContextSchema = z.strictObject({
  nameSpaces: z.array(TTPrefixSchema).optional(),
  prefixes: z.array(TTPrefixSchema).optional()
});

export type TTContext = z.output<typeof TTContextSchema>;

export function isTTContext(value: unknown): value is TTContext {
  return TTContextSchema.safeParse(value).success;
}
