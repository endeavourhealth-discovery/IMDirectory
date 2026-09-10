import z from "zod";

// export interface EntityValidationResponse {
//   valid?: boolean;
//   message?: string;
// }

export const EntityValidationResponseSchema = z.strictObject({
  valid: z.boolean().optional(),
  message: z.string().optional()
});

export type EntityValidationResponse = z.output<typeof EntityValidationResponseSchema>;

export function isEntityValidationResponse(value: unknown): value is EntityValidationResponse {
  return EntityValidationResponseSchema.safeParse(value).success;
}
