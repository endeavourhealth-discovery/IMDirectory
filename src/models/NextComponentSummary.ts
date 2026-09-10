import z from "zod";

import { ComponentType } from "../enums/ComponentType";

// export interface NextComponentSummary {
//   previousComponentType: ComponentType;
//   previousPosition: number;
//   parentGroup?: ComponentType;
//   selectedOption: ComponentType;
// }

export const NextComponentSummarySchema = z.strictObject({
  previousComponentType: z.enum(ComponentType),
  previousPosition: z.number(),
  parentGroup: z.enum(ComponentType),
  selectedOption: z.enum(ComponentType)
});

export type NextComponentSummary = z.output<typeof NextComponentSummarySchema>;

export function isNextComponentSummary(value: unknown): value is NextComponentSummary {
  return NextComponentSummarySchema.safeParse(value).success;
}
