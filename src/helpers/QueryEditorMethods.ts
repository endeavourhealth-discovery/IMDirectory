import { Operator, Order } from "@endeavour/vue-library/enums";
import type { Compare, Having, Node, Query, Where } from "@endeavour/vue-library/models";

import { ConstraintOperatorKey, ConstraintOperatorMap } from "@/constants/queryEditor/ConstraintOperatorMap";
import { type Orderable, SentencePart } from "@/models";
import { RelativeTo } from "@/models/RelativeTo";

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

export function buildHavingSentence(having?: Having): SentencePart[] | undefined {
  if (!having) return;
  const parts: SentencePart[] = [];

  if (having.range) {
    buildRangeSentence(having, parts);
    return parts;
  } else {
    parts.push({ type: "text", value: "True if " + having.function?.toString() + " " });
    if (having.operator) {
      parts.push({ type: "text", value: getOperatorTerm(having.operator) });
    }
    const value = having.value && having.value != "0" ? having.value : undefined;
    if (value) parts.push({ type: "text", value: `${value} ` });
    return parts;
  }
}

export function buildValueSentence(where: Where): SentencePart[] | undefined {
  const parts: SentencePart[] = [];
  if (where.range) buildRangeSentence(where, parts);
  else buildNonRangeSentence(where, parts);
  if (where.compare) {
    parts.push({ type: "text", value: " relative to " });
    addReference(parts, where.compare);
  }
  return parts;
}

function buildNonRangeSentence(where: Where, parts: SentencePart[]) {
  if (where.isNull) {
    parts.push({ type: "text", value: "is absent" });
    return parts;
  }
  if (where.notNull) {
    parts.push({ type: "text", value: "is present" });
    return parts;
  }

  const units = where.units ? where.units.name : "";
  let value = undefined;
  if (where.value && (where.value != "0" || where.operator)) value = where.value;
  if (where.operator) {
    parts.push({ type: "text", value: getOperatorTerm(where.operator) });
  }
  if (value) parts.push({ type: "text", value: `${value} ${units} ` });
}

function buildRangeSentence(where: Where | Having, parts: SentencePart[]) {
  const { from, to } = where.range!;
  const fromVal = from.value && from.value != "0" ? from.value : undefined;
  const toVal = to.value;
  const fromUnits = from.units ? from.units.name : "";
  const toUnits = to.units ? to.units.name : "";

  parts.push({ type: "text", value: " is between " });
  let inclusive = false;
  if (from.operator) {
    if (from.operator === Operator.gte || from.operator === Operator.lte) inclusive = true;
  }
  parts.push({ type: "text", value: `${fromVal} ${fromUnits} ` });
  if (inclusive) parts.push({ type: "text", value: "(inc.) " });

  parts.push({ type: "text", value: " and " });
  inclusive = false;
  if (to.operator) {
    if (to.operator === Operator.gte || to.operator === Operator.lte) inclusive = true;
  }
  if (!inclusive && to.operator) {
    parts.push({ type: "text", value: getOperatorTerm(to.operator) });
  }
  parts.push({ type: "text", value: `${toVal} ${toUnits} ` });
  if (inclusive) parts.push({ type: "text", value: "(inc.) " });
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
    case ">=":
      return "equal to or greater than ";
    case "<=":
      return "equal to or less than ";
    case ">":
      return "greater than ";
    case "<":
      return "less than ";
    case "startsWith":
      return "starts with ";
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
