import { Node, RelativeTo, Where, Assignable, Match, Path } from "@/interfaces/AutoGen";
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
  },
  {
    label: "Relative range",
    value: "relativeRange",
    tooltip: "The range of date or time or value is relative to the value of a parameter or result of another query"
  },
  {
    label: "Absolute range",
    value: "absoluteRange",
    tooltip: "The range of date time or value is not relative to any other value"
  },
  { label: "is not recorded", value: "isNull", tooltip: "Test for absence of value" },
  { label: "is recorded", name: "notNull", tooltip: "Test for presence of any value" }
];

export const offsetOptions = [
  { label: "relative to", value: "0" },
  { label: "prior to", value: "-" },
  { label: "after", value: "+" }
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
    tooltip: "Include concept (default)"
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
      label: (IM.DATE + IM.TIME).includes(valueType) ? "on or after" : "greater or equal to",
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

export function getWhereDisplay(where: Where, valueType: string): string {
  let result = "";
  const relative = where.relativeTo;
  const isTime = valueType === IM.DATE || valueType === IM.TIME;
  if (where.range) {
    result = "between ";
    result = result.concat(assignDisplay(where.range.from, relative, isTime));
    result = result.concat(" and ");
    result = result.concat(assignDisplay(where.range.to, relative, isTime));
  } else {
    result = result.concat(assignDisplay(where, relative, isTime));
  }
  if (relative) result = result.concat(getRelativeToTerm(relative));
  else if (where.isNull) result = result.concat("is not recorded");
  else if (where.isNotNull) result = result.concat("is recorded");
  return result;
}

function assignDisplay(assign: Assignable, relative: RelativeTo | undefined, isTime: boolean): string {
  let result = "";
  const value = assign.value ? (assign.value.startsWith("-") ? assign.value.substring(1) : assign.value) : undefined;
  const operator = assign.operator ? assign.operator : undefined;
  const negative = !assign.value ? false : assign.value.startsWith("-");
  if (value || operator) {
    switch (operator) {
      case "=":
        result = result.concat("exactly ");
        break;
      case ">=":
        result = result.concat(isTime ? "on or after " : "equal to or greater than ");
        break;
      case "<=":
        result = result.concat(isTime ? "on or before " : "equal to or less than ");
        break;
      case ">":
        result = result.concat(isTime ? "after " : "greater than ");
        break;
      case "<":
        result = result.concat(isTime ? "before " : "less than ");
    }
    if (!value) {
      if (!relative) result = result.concat("0");
    }
    if (value) {
      if (!relative && negative) result = result.concat(getValueUnits("-" + value, assign.unit?.name));
      else result = result.concat(getValueUnits(value, assign.unit?.name));
      if (relative) {
        if (negative) {
          result = result.concat(isTime ? "prior to " : "below ");
        } else {
          result = result.concat(isTime ? "after " : "above ");
        }
      }
    }
  }
  return result;
}

function getValueUnits(value: string | undefined, units: string | undefined): string {
  if (!value) return "";
  return units ? value + " " + units + " " : value + " ";
}

function getRelativeToTerm(relativeTo: RelativeTo): string {
  if (relativeTo.nodeRef) return relativeTo.nodeRef;
  if (relativeTo.parameter) {
    switch (relativeTo.parameter) {
      case "$referenceDate":
        return "Search date";
      case "$baselineDate":
        return "Achievement date";
      case "$now":
        return "Current date";
      default:
        return "unknown parameter";
    }
  }
  return "unknown";
}

export function getInclusivityOptions(fromOrTo: "from" | "to"): any[] {
  const results = [];
  if (fromOrTo === "from") {
    results.push({
      label: " Inclusive",
      value: ">=",
      tooltip: "Inclusive of value"
    });
    results.push({
      label: "Exclusive",
      value: ">",
      tooltip: "Exclusive of value"
    });
  }
  if (fromOrTo === "to") {
    results.push({
      label: "Inclusive",
      value: "<=",
      tooltip: "Inclusive of value"
    });
    results.push({
      label: "Exclusive",
      value: "<",
      tooltip: "Exclusive of value"
    });
  }
  return results;
}
export function getPathName(nodeRef: string, match: Match): string {
  if (!match.path) return "";
  let flatPath = "";
  for (const path of match.path) {
    flatPath = flatPath + (path.name! === "" ? path.iri?.split("#")[1] : path.name);
    if (path.variable === nodeRef) return flatPath;
    flatPath = getPathNameFromPath(nodeRef, flatPath, path);
  }
  return flatPath;
}

function getPathNameFromPath(nodeRef: string, flatPath: string, path: Path): string {
  flatPath = flatPath.concat("/");
  if (path.path) {
    for (const subPath of path.path) {
      flatPath = flatPath.concat(subPath.name!);
      if (path.variable === nodeRef) return flatPath;
      flatPath = getPathNameFromPath(nodeRef, flatPath, path);
    }
  }
  return flatPath;
}
