import { Relativity } from "@/enums";

export const CompareOptions: { label: string; value: Relativity }[] = [
  { label: "Compare to another value", value: Relativity.Compare },
  { label: "Compare with offset from another value", value: Relativity.Relative },
  { label: "Compare to fixed value", value: Relativity.Absolute }
];
