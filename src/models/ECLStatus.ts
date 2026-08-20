import z from "zod";

// export interface ECLStatus {
//   valid?: boolean;
//   line?: number;
//   offset?: number;
//   message?: string;
// }

export const ECLStatusSchema = z.strictObject({
  valid: z.boolean().optional(),
  line: z.number().optional(),
  offset: z.number().optional(),
  message: z.string().optional()
});

export type ECLStatus = z.output<typeof ECLStatusSchema>;

export function isECLStatus(value: unknown): value is ECLStatus {
  return ECLStatusSchema.safeParse(value).success;
}
