import z from "zod";

// export interface SuperiorPropertiesBoolFocusPagedRequest {
//   ecl?: string;
//   page?: number;
//   size?: number;
//   schemeFilters?: string[];
//   inactive?: boolean;
// }

export const SuperiorPropertiesBoolFocusPagedRequestSchema = z.strictObject({
  ecl: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
  schemeFilters: z.array(z.string()),
  inactive: z.boolean().optional()
});

export type SuperiorPropertiesBoolFocusPagedRequest = z.output<typeof SuperiorPropertiesBoolFocusPagedRequestSchema>;

export function isSuperiorPropertiesBoolFocusPagedRequest(value: unknown): value is SuperiorPropertiesBoolFocusPagedRequest {
  return SuperiorPropertiesBoolFocusPagedRequestSchema.safeParse(value).success;
}
