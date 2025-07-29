import { Node } from "@/interfaces/AutoGen";
import { IM } from "@/vocabulary";

export const relativityOptions = [
  {
    label: "Relative value",
    value: "relative",
    tooltip: "The date or time or value is relative to the value of a parameter or result of another query"
  },
  {
    label: "Absolute value",
    value: "absolute",
    tooltip: "The date time or value is not relative to any other value"
  }
];

export const valueConstraintTypeOptions = [
  { label: "is", value: "is" },
  { label: "between", value: "range" },
  { label: "is not recorded", value: "isNull" },
  { label: "is recorded", name: "notNull" }
];

export const constraintOperatorOptions = [
  {
    label: "--",
    value: "",
    tooltip: "This concept only"
  },
  {
    label: "<<",
    value: "<<",
    tooltip: "This concept and all descendants"
  },
  {
    label: "<",
    value: "<",
    tooltip: "Descendants of this concept but not this concept"
  },
  {
    label: "^",
    value: "^",
    tooltip: "Member of this value set"
  },
  {
    label: ">>!",
    value: ">>!",
    tooltip: "This concept and all ancestors"
  }
];

export function getPlainConstraintOperatorValue(node: Node): string {
  const key = (["descendantsOrSelfOf", "descendantsOf", "memberOf"] as ConstraintOperatorKey[]).find(k => k in node);
  if (key === undefined) return "conceptOnly";
  return key.toString();
}

export function getPlainConstraintOperatorLabel(node: Node): string {
  const key = (["descendantsOrSelfOf", "descendantsOf", "memberOf"] as ConstraintOperatorKey[]).find(k => k in node);
  if (key === undefined) return "concept only";
  return constraintOperatorMap[key];
}

export type ConstraintOperatorKey = keyof typeof constraintOperatorMap;

export const constraintOperatorMap = {
  descendantsOrSelfOf: "+ children",
  descendantsOf: "children only",
  memberOf: "member of",
  conceptOnly: "concept only"
};

export const plainConstraintOperatorOptions = [
  {
    label: "concept only",
    value: "conceptOnly",
    tooltip: "This concept only, not including descendants"
  },
  {
    label: "+children",
    value: "descendantsOrSelfOf",
    tooltip: "This concept and all descendants"
  },
  {
    label: "children only",
    value: "descendantsOf",
    tooltip: "Descendants of this concept but not this concept"
  }
];

export const nodeInclusionOptions = [
  {
    label: "Include",
    value: "Include",
    tooltip: "Include concept (default"
  },
  {
    label: "Exclude",
    value: "Exclude",
    tooltip: "Exclude this from set"
  }
];

export function getDateFromString(date: string): Date {
  if (date) {
    let separator = "";
    if (date.includes("-")) separator = "-";
    else if (date.includes("/")) separator = "/";
    const splits = date.split(separator);
    if (splits.length !== 3) return new Date();

    const year = parseInt(splits[2]);
    const month = parseInt(splits[1]);
    const day = parseInt(splits[0]);
    return new Date(year, month - 1, day);
  }
  return new Date();
}

export const operatorOptions = (valueType: string): any[] => {
  return [
    {
      label: (IM.DATE + IM.TIME).includes(valueType) ? "on" : "equal",
      value: "=",
      tooltip: "exactly equal to value"
    },
    {
      label: (IM.DATE + IM.TIME).includes(valueType) ? "on or after" : "greater ot equal to",
      value: ">=",
      tooltip: "inclusive of value"
    },
    {
      label: (IM.DATE + IM.TIME).includes(valueType) ? "on or before" : "less than or equal to",
      value: "<=",
      tooltip: "inclusive of value"
    },
    {
      label: (IM.DATE + IM.TIME).includes(valueType) ? "after" : "greater than",
      value: ">",
      tooltip: "exclusive of value"
    },
    {
      label: (IM.DATE + IM.TIME).includes(valueType) ? "before" : "less than",
      value: "<",
      tooltip: "exclusive of value"
    }
  ];
};
