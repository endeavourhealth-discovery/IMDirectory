import { Operator } from "vue-library";

export const OperatorOptions: { label: string; value: Operator; tooltip: string }[] = [
  {
    label: "equal to",
    value: Operator.eq,
    tooltip: "exactly equal to value"
  },
  {
    label: "greater or equal to",
    value: Operator.gte,
    tooltip: "inclusive of value"
  },
  {
    label: "less than or equal to",
    value: Operator.lte,
    tooltip: "inclusive of value"
  },
  {
    label: "greater than",
    value: Operator.gt,
    tooltip: "exclusive of value"
  },
  {
    label: "less than",
    value: Operator.lt,
    tooltip: "exclusive of value"
  }
];
