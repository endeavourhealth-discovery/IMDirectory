import z from "zod";

// export interface ValidatedEntity extends ExtendedTTEntity {
//   validationCode?: string;
//   validationLabel?: string;
// }

export const ValidatedEntitySchema = z.looseObject({
  validationCode: z.string().optional(),
  validationLabel: z.string().optional()
});

export type ValidatedEntity = z.output<typeof ValidatedEntitySchema>;

export function isValidatedEntity(value: unknown): value is ValidatedEntity {
  return ValidatedEntitySchema.safeParse(value).success;
}
