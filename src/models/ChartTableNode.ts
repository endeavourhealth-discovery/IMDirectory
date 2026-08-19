import z from "zod";

// export interface ChartTableNode {
//   key: string;
//   type: string;
//   data: any;
// }

export const ChartTableNodeSchema = z.strictObject({
  key: z.string(),
  type: z.string(),
  data: z.any()
});
export type ChartTableNode = z.output<typeof ChartTableNodeSchema>;

export function isChartTableNode(value: unknown): value is ChartTableNode {
  return ChartTableNodeSchema.safeParse(value).success;
}
