import { Operator, Order } from "@endeavour/vue-library/enums";
import type { Compare, Having, Node, Orderable, Range,Query, Where } from "@endeavour/vue-library/models";

import { ConstraintOperatorKey, ConstraintOperatorMap } from "@/constants/queryEditor/ConstraintOperatorMap";
import { SentencePart } from "@/interfaces";
import { RelativeTo } from "@/interfaces/RelativeTo";

export function getPlainConstraintOperatorValue(node: Node): string {
  const key = (["descendantsOrSelfOf", "descendantsOf", "memberOf"] as ConstraintOperatorKey[]).find(k => k in node);
  if (key === undefined) return "descendantsOrSelfOf";
  return key.toString();
}

export function getPlainConstraintOperatorLabel(node: Node): string {
  const key = (["descendantsOrSelfOf", "descendantsOf", "memberOf"] as ConstraintOperatorKey[]).find(k => k in node);
  if (key === undefined) return "concept only";
  return ConstraintOperatorMap[key];
}

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

export function getOrderable(match: Query, orderables: any[]): Orderable | undefined {
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

export function buildHavingSentence(having?: Having): SentencePart[] | undefined {
  if (!having) return;
  const parts: SentencePart[] = [];
  parts.push({ type: "text", value: "True if " + having.function?.toString() + " " });
  if (having.range) {
    const range = buildRangeSentence(having.range);
    if (range) parts.push(...range);
    return parts;
  } else {
    if (having.operator) {
      parts.push({ type: "text", value: getOperatorTerm(having.operator) });
    }
    const value = having.value && having.value != "0" ? having.value : undefined;
    if (value) parts.push({ type: "text", value: `${value} ` });
    return parts;
  }
}

export function buildValueSentence(where: Where): SentencePart[] | undefined {
  if (where.range) return buildRangeSentence(where.range);
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
  if (where.compare && where.compare.left) {
    parts.push({ type: "text", value: where.compare.left.name + " " });
  }
  const units = where.compare && where.compare.units ? where.compare.units.name : "";
  let value = undefined;
  if (where.value && (where.value != "0" || where.operator)) value = where.value;
  if (where.operator) {
    parts.push({ type: "text", value: getOperatorTerm(where.operator) });
  }
  if (value) parts.push({ type: "text", value: `${value} ${units} ` });
  if (where.compare) {
    addReference(parts, where.compare);
  }
  return parts;
}

function buildRangeSentence(range: Range): SentencePart[] | undefined {
  const parts: SentencePart[] = [];
  const { from, to } = range;
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
  } else {
    if (source.name) {
      parts.push({
        type: "field",
        value: source.name
      });
    }
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
      break;
    case "startsWith":
      return "starts with ";
      break;
    case "contains":
      return "contains ";
    case "isNull":
      return "is not recorded ";
    case "notNull":
      return "is recorded ";
    default:
      return (operator as string) + " ";
  }
}
export function getIsOperator(nodes: Node[], eclQuery: boolean | undefined) {
  if (eclQuery) return "=";
  if (nodes.length === 1) return "is";
  else return "in";
}
