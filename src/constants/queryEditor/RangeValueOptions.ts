import { RangeOrValue } from "@/enums";

export const RangeValueOptions: { label: string; value: RangeOrValue }[] = [
  { label: "Range", value: RangeOrValue.Range },
  { label: "Single value", value: RangeOrValue.SingleValue },
  { label: "Is absent", value: RangeOrValue.IsNull },
  { label: "Is present", value: RangeOrValue.IsNotNull }
];
