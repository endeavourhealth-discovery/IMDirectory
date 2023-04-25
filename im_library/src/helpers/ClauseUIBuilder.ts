import { isObjectHasKeys } from "./DataTypeCheckers";
import { ClauseUI, ConceptSummary } from "../interfaces";
import { getNameFromRef } from "./TTTransform";
import { Entailment, Match, Where } from "../interfaces/AutoGen";

export function buildClauseUI(match: Match): ClauseUI[] {
  const clauses = [] as ClauseUI[];
  if (isObjectHasKeys(match, ["where"])) {
    for (const where of match.where) {
      const clauseUI = {
        clauseType: { name: "Property", prop: "@id" },
        entailmentOptions: getEntailmentOptions(match),
        typeValue: getTypeValue(where),
        propertyValue: getPropertyValue(where)
      } as ClauseUI;
      clauses.push(clauseUI);
    }
  } else {
    const clauseUI = { clauseType: getClauseType(match), entailmentOptions: getEntailmentOptions(match), typeValue: getTypeValue(match) } as ClauseUI;
    clauses.push(clauseUI);
  }
  return clauses;
}

export function getPropertyValue(where: Where): { value: any; type: string } {
  if (isObjectHasKeys(where, ["range"])) return { value: where.range, type: "range" };
  if (isObjectHasKeys(where, ["in"])) return { value: where.in, type: "in" };
  if (isObjectHasKeys(where, ["notIn"])) return { value: where.notIn, type: "notIn" };
  if (isObjectHasKeys(where, ["operator"])) return { value: where, type: "comparison" };
  return { value: where.in, type: "in" };
}

export function getClauseType(match: Match): { name: string; prop: string } {
  if (isObjectHasKeys(match, ["@type"])) return { name: "Type", prop: "@type" };
  else if (isObjectHasKeys(match, ["@set"])) return { name: "Set", prop: "@set" };
  else return { name: "Entity", prop: "@id" };
}

export function getEntailmentOptions(entailment: Entailment): string[] {
  const entailmentOptions = [] as string[];
  if (isObjectHasKeys(entailment, ["ancestorsOf"])) entailmentOptions.push("ancestorsOf");
  if (isObjectHasKeys(entailment, ["descendantsOf"])) entailmentOptions.push("descendantsOf");
  if (isObjectHasKeys(entailment, ["descendantsOrSelfOf"])) entailmentOptions.push("descendantsOrSelfOf");
  return entailmentOptions;
}

export function getTypeValue(match: Match | Where): ConceptSummary {
  if (isObjectHasKeys(match, ["@type"])) return { iri: match["@type"], name: getNameFromRef(match) } as ConceptSummary;
  else if (isObjectHasKeys(match, ["@set"])) return { iri: match["@set"], name: getNameFromRef(match) } as ConceptSummary;
  else return { iri: match["@id"], name: getNameFromRef(match) } as ConceptSummary;
}
