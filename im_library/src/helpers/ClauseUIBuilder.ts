import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { MatchClauseUI, ConceptSummary, WhereClauseUI } from "../interfaces";
import { getNameFromRef } from "./TTTransform";
import { Entailment, Match, Where } from "../interfaces/AutoGen";

export function buildClauseUI(match: Match): MatchClauseUI[] {
  const clauses = [] as MatchClauseUI[];
  const clauseUI = { matchType: getMatchType(match), matchEntailment: getEntailmentOptions(match), matchValue: getMatchValue(match) } as MatchClauseUI;
  if (isObjectHasKeys(match, ["where"])) {
    for (const where of match.where) {
      const { value, type } = getPropertyValue(where);
      const whereClause = { whereProperty: where["@id"], whereType: type, whereValue: value, whereEntailment: getEntailmentOptions(where) } as WhereClauseUI;
      if (!isArrayHasLength(clauseUI.where)) clauseUI.where = [];
      clauseUI.where.push(whereClause);
    }
  }
  clauses.push(clauseUI);
  return clauses;
}

export function getPropertyValue(where: Where): { value: any; type: string } {
  if (isObjectHasKeys(where, ["range"])) return { value: where.range, type: "range" };
  if (isObjectHasKeys(where, ["in"])) return { value: where.in, type: "in" };
  if (isObjectHasKeys(where, ["notIn"])) return { value: where.notIn, type: "notIn" };
  if (isObjectHasKeys(where, ["operator"])) return { value: where, type: "comparison" };
  return { value: where.in, type: "in" };
}

export function getMatchType(match: Match): { name: string; prop: string } {
  if (isObjectHasKeys(match, ["@type"])) return { name: "Type", prop: "@type" };
  else if (isObjectHasKeys(match, ["@set"])) return { name: "Set", prop: "@set" };
  else if (isObjectHasKeys(match, ["@id"])) return { name: "Entity", prop: "@id" };
}

export function getEntailmentOptions(entailment: Entailment): string[] {
  const entailmentOptions = [] as string[];
  if (isObjectHasKeys(entailment, ["ancestorsOf"])) entailmentOptions.push("ancestorsOf");
  if (isObjectHasKeys(entailment, ["descendantsOf"])) entailmentOptions.push("descendantsOf");
  if (isObjectHasKeys(entailment, ["descendantsOrSelfOf"])) entailmentOptions.push("descendantsOrSelfOf");
  return entailmentOptions;
}

export function getMatchValue(match: Match | Where): ConceptSummary {
  if (isObjectHasKeys(match, ["@type"])) return { iri: match["@type"], name: getNameFromRef(match) } as ConceptSummary;
  else if (isObjectHasKeys(match, ["@set"])) return { iri: match["@set"], name: getNameFromRef(match) } as ConceptSummary;
  else if (isObjectHasKeys(match, ["@id"])) return { iri: match["@id"], name: getNameFromRef(match) } as ConceptSummary;
}
