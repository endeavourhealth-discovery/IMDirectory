import { Node, Order, Where, Match, Path, Operator, TTIriRef, Compare } from "@/interfaces/AutoGen";
import { Orderable } from "@/models/orderable";
import { useQueryStore } from "@/stores/queryStore";

export type RelativeTo = {
  nodeRef?: string;
  parameter?: string;
  qualifier?: TTIriRef;
  iri?: string;
  name?: string;
};
export const Relativity = {
  Compare: "compare",
  Relative: "relative",
  Absolute: "absolute"
} as const;
export type Relativity = (typeof Relativity)[keyof typeof Relativity];

export const compareOptions = [
  { label: "Compare to another value", value: Relativity.Compare },
  { label: "Compare to relative value", value: Relativity.Relative },
  { label: "Compare to fixed value", value: Relativity.Absolute }
] satisfies { label: string; value: Relativity }[];

export const RangeOrValue = {
  Range: "range",
  SingleValue: "singleValue",
  IsNull: "isNull",
  IsNotNull: "isNotNull"
} as const;

export type RangeOrValue = (typeof RangeOrValue)[keyof typeof RangeOrValue];

export const rangeValueOptions = [
  { label: "Range", value: RangeOrValue.Range },
  { label: "Single value", value: RangeOrValue.SingleValue },
  { label: "Is absent", value: RangeOrValue.IsNull },
  { label: "Is present", value: RangeOrValue.IsNotNull }
] satisfies { label: string; value: RangeOrValue }[];

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

export const operatorOptions = [
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
] satisfies { label: string; value: Operator; tooltip: string }[];

export function getRelativeTo(where: Where): RelativeTo | undefined {
  if (where.compare && where.compare.right) {
    return {
      nodeRef: where.compare.right.nodeRef,
      iri: where.compare.right.iri,
      parameter: where.compare.right.parameter,
      name: where.compare.right.name
    };
  }
  return undefined;
}

export function getTypeFromClause(match: Match): string | undefined {
  const queryStore = useQueryStore();
  if (!match.path) {
    if (match.nodeRef) {
      return getTypeFromClause(queryStore.returnMap.get(match.nodeRef)!);
    } else return undefined;
  }
  if (match.return) {
    for (const property of match.return) {
      if (property.nodeRef) return getTypeFromMatchNodeRef(match, property.nodeRef);
    }
  }
  if (match.where) {
    const where = match.where;
    if (where.nodeRef) return getTypeFromMatchNodeRef(match, where.nodeRef);
    for (const op of ["and", "or"] as const) {
      if (where[op] && where[op][0].nodeRef) {
        return getTypeFromMatchNodeRef(match, where[op][0].nodeRef);
      }
    }
  }
  return undefined;
}

function getTypeFromPathNodeRef(aPath: Path, nodeRef: string): string | undefined {
  if (aPath.path) {
    const subPath = aPath.path[0];
    if (subPath.node === nodeRef) return subPath.typeOf!.iri!;
    if (subPath.path) return getTypeFromPathNodeRef(subPath, nodeRef);
  }
  return undefined;
}

function getTypeFromMatchNodeRef(match: Match, nodeRef: string): string | undefined {
  if (match.path) {
    const subPath = match.path[0];
    if (subPath.node === nodeRef) return subPath.typeOf!.iri!;
    if (subPath.path) return getTypeFromPathNodeRef(subPath, nodeRef);
  }
  return undefined;
}

export function getOrderable(match: Match, orderables: any[]): Orderable | undefined {
  if (match.orderBy) {
    const orderProperty = match.orderBy.property![0];
    return orderables.find(o => o.value.iri === orderProperty.iri && o.value.direction === orderProperty.direction);
  }
}

export function getOrderOptions(orderables: Orderable[]): any[] {
  const results = [];
  for (const orderable of orderables) {
    for (const direction of ["ascending", "descending"] as Array<"ascending" | "descending">) {
      results.push({
        label: orderable[direction] + " " + orderable.name,
        value: { iri: orderable.iri, direction: direction as Order, label: orderable[direction] + " " + orderable.name },
        tooltip: "From the entries following the filters"
      });
    }
  }
  results.push({
    label: "Any",
    value: {},
    tooltip: "Any entries following the filters"
  });
  return results;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  const t = toMinutes(time);
  return t >= toMinutes(start) && t <= toMinutes(end);
}
export type SentencePart =
  | { type: "text"; value?: string }
  | { type: "field"; value?: string }
  | { type: "parameter"; value?: string }
  | { type: "nodeRef"; value?: string };

export function buildValueSentence(where: Where): SentencePart[] | undefined {
  if (where.range) return buildRangeSentence(where);
  return buildNonRangeSentence(where);
}

function buildNonRangeSentence(where: Where): SentencePart[] | undefined {
  const parts: SentencePart[] = [];
  if (where.isNull) {
    parts.push({ type: "text", value: "is absent" });
    return parts;
  }
  if (where.notNull) {
    parts.push({ type: "text", value: "is present" });
    return parts;
  }
  const units = where.compare && where.compare.units ? where.compare.units.name : "";
  const value = where.value && where.value != "0" ? where.value : undefined;
  if (where.operator) {
    parts.push({ type: "text", value: getOperatorTerm(where.operator) });
  }
  if (value) parts.push({ type: "text", value: `${value} ${units} ` });
  if (where.compare) {
    addReference(parts, where.compare);
  }
  return parts;
}

function buildRangeSentence(where: Where): SentencePart[] | undefined {
  const parts: SentencePart[] = [];
  const { from, to } = where.range!;
  const units = from.compare && from.compare.units ? from.compare.units.name : "";
  const fromVal = from.value && from.value != "0" ? from.value : undefined;
  const toVal = to.value;
  parts.push({ type: "text", value: " is between " });
  let inclusive = false;
  if (from.operator) {
    if (from.operator === Operator.gte || from.operator === Operator.lte) inclusive = true;
  }
  parts.push({ type: "text", value: `${fromVal} ${units} ` });
  if (inclusive) parts.push({ type: "text", value: "(inc.) " });
  if (from.compare && from.compare.right) {
    if (to.compare && to.compare.right) {
      if (from.compare.right.parameter) {
        if (to.compare && to.compare.right && to.compare.right.parameter) {
          if (to.compare.right.parameter !== from.compare.right.parameter) {
            addReference(parts, from.compare);
          }
        }
      }
    } else addReference(parts, from.compare);
  }
  parts.push({ type: "text", value: " and " });
  inclusive = false;
  if (to.operator) {
    if (to.operator === Operator.gte || to.operator === Operator.lte) inclusive = true;
  }
  if (!inclusive && to.operator) {
    parts.push({ type: "text", value: getOperatorTerm(to.operator) });
  }
  parts.push({ type: "text", value: `${toVal} ${units} ` });
  if (inclusive) parts.push({ type: "text", value: "(inc.) " });
  if (to.compare) {
    addReference(parts, to.compare);
  }
  return parts;
}

function addReference(parts: SentencePart[], compare: Compare) {
  if (compare.units) {
    parts.push({ type: "text", value: "relative to " });
  }
  const source = compare.right!;
  if (source.parameter) {
    parts.push({
      type: "parameter",
      value: source.name
    });
  } else if (source.name) {
    parts.push({
      type: "field",
      value: source.name
    });
    parts.push({ type: "text", value: " of " });
    parts.push({
      type: "nodeRef",
      value: source.nodeRef
    });
  }
}
function getOperatorTerm(operator: Operator): string {
  switch (operator) {
    case "=":
      return "= ";
      break;
    case ">=":
      return "equal to or greater than ";
      break;
    case "<=":
      return "equal to or less than ";
      break;
    case ">":
      return "greater than ";
      break;
    case "<":
      return "less than ";
    default:
      return "";
  }
}
export function getIsOperator(nodes: Node[], eclQuery: boolean | undefined) {
  if (eclQuery) return "=";
  if (nodes.length === 1) return "is";
  else return "in";
}
