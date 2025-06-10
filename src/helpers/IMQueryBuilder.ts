import { Match, OrderDirection, BoolGroup, Node, Query, QueryRequest, SearchBinding, TTIriRef, Where, Element, Bool } from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { v4 } from "uuid";

export function buildIMQueryFromFilters(filterOptions: SearchOptions): QueryRequest {
  const imQuery: QueryRequest = { query: {} };
  if (isArrayHasLength(filterOptions.status)) addFilterToIMQuery(IM.HAS_STATUS, filterOptions.status, imQuery.query);
  if (isArrayHasLength(filterOptions.types)) addFilterToIMQuery(RDF.TYPE, filterOptions.types, imQuery.query);
  if (isArrayHasLength(filterOptions.schemes)) addFilterToIMQuery(IM.HAS_SCHEME, filterOptions.schemes, imQuery.query);
  if (isArrayHasLength(filterOptions.isA)) addFilterToIMQuery(IM.IS_A, filterOptions.isA!, imQuery.query);
  if (isArrayHasLength(filterOptions.binding)) addBindingsToIMQuery(filterOptions.binding!, imQuery);
  if (filterOptions.page) imQuery.page = filterOptions.page;
  if (filterOptions.textSearch) imQuery.textSearch = filterOptions.textSearch;
  return imQuery;
}

function addFilterToIMQuery(predicate: string, values: any[], query: Query) {
  if (!query.where) query.where = {};
  if (!query.where.and) query.where.and = [];
  const where: Where = {
    iri: predicate,
    is: values.map(item => item as Node)
  };
  query.where.and.push(where);
}

export function updateFocusConcepts(match: Match): string[] {
  if (match.instanceOf && match.instanceOf[0].iri) return [match.instanceOf[0].iri];
  const focusConcepts: string[] = [];
  focusConcepts.push(...focusChildren(match.or));
  focusConcepts.push(...focusChildren(match.and));
  return focusConcepts;
}
function focusChildren(children: Match[] | undefined): string[] {
  const focusConcepts: string[] = [];
  if (children) {
    for (const [index, item] of children.entries()) {
      focusConcepts.push(...updateFocusConcepts(item));
    }
  }
  return focusConcepts;
}

function createNewBoolGroup(clause: BoolGroup<Match | Where | undefined>, group: number[], oldBool: Bool, newBool: Bool) {
  group.sort((a, b) => a - b);
  const newGroup: (Match | Where)[] = [];
  const from = oldBool as keyof typeof clause;
  const to = newBool as keyof typeof clause;
  const newGroupIndex = group[0];
  const newItem = {
    [to]: newGroup
  };

  group.forEach(index => {
    newGroup.push(clause[from]![index]!);
  });
  const newBoolGroup = [];
  for (const [index, item] of clause[from]!.entries()) {
    if (index === newGroupIndex) {
      newBoolGroup.push(newItem);
    } else if (!group.includes(index)) newBoolGroup.push(item);
  }
  clause[from] = newBoolGroup;
}

export function addConceptToGroup(match: Match) {
  if (match.instanceOf) {
    const subMatch = { uuid: match.uuid, instanceOf: match.instanceOf } as Match;
    delete match.instanceOf;
    match.or = [subMatch];
  }
  const bool = match.and ? Bool.and : match.or ? Bool.or : undefined;
  if (bool) {
    const subMatch = { instanceOf: [{ descendantsOrSelfOf: true }] };
    match[bool]!.push(subMatch);
  } else match.instanceOf = [{ descendantsOrSelfOf: true }];
}

export function updateBooleans(clause: BoolGroup<Match | Where | undefined>, oldBool: Bool, newBool: Bool, index: number, group: number[]) {
  if (!clause) return;
  if (group.length > 1) {
    createNewBoolGroup(clause, group, oldBool, newBool);
    group.length = 0;
    return;
  }
  const from = oldBool as keyof typeof clause;
  const to = newBool as keyof typeof clause;
  if (from === to) return;
  if (oldBool === Bool.not) {
    const item = clause.not![index];
    if (clause.and) clause.and.push(item);
    else if (clause.or) clause.or.push(item);
    clause.not!.splice(index, 1);
    if (clause.not!.length === 0) delete clause.not;
    return;
  }
  if (newBool === Bool.not) {
    const item = clause[from]![index];
    clause[from]!.splice(index, 1);
    clause.not = [...(clause.not || []), item];
    return;
  }
  clause[to] = clause[from];
  delete clause[from];
}
export function hasBoolGroups(clause: Match | Where) {
  if (clause.or || clause.and) return true;
  return false;
}

export function getBooleanLabel(clause: Match | Where, clauseType: string, operator: Bool, index: number): string {
  const isFirst = index === 0;
  const isMatch = clauseType === "Match";
  const hasNested = hasBoolGroups(clause);
  if (operator === Bool.and) {
    if (hasNested) {
      return isFirst ? (isMatch ? "Must be " : "Must have") : isMatch ? "And must be a" : "And must have";
    } else {
      return isFirst ? (isMatch ? "Must be" : "Must have") : "And";
    }
  }
  if (operator === Bool.or) {
    if (hasNested) {
      return isFirst ? (isMatch ? "Either is a" : "Either has") : isMatch ? "Or" : "Or has";
    } else {
      return isFirst ? (isMatch ? "Either" : "Either") : "Or";
    }
  }
  return "Minus";
}

export function getIsRoleGroup(where: Where | undefined): boolean {
  if (!where) return false;
  return !!where.roleGroup;
}

export function isBoolWhere(where: Where | undefined): boolean {
  if (!where) return false;
  return !!(where.or || where.and);
}

export function manageRoleGroup(where: Where, isRoleGroup: boolean): void {
  if (where) {
    where.roleGroup = isRoleGroup;
    removeRoleSubgroups(where);
  }
}

function removeRoleSubgroups(where: Where): void {
  const logicalGroups = [...(where.or ?? []), ...(where.and ?? [])];
  for (const item of logicalGroups) {
    if (getIsRoleGroup(item)) {
      item.roleGroup = false;
    }
    removeRoleSubgroups(item);
  }
}

export function getBooleanOptions(clause: Match | Where, parent: BoolGroup<Match | Where>, parentOperator: Bool, clauseType: string, index: number): any[] {
  const operator = parentOperator as keyof typeof parent;
  const notLabel = getBooleanLabel(clause, clauseType, Bool.not, index);
  const andLabel = getBooleanLabel(clause, clauseType, Bool.and, parentOperator === Bool.not ? 1 : index);
  const orLabel = getBooleanLabel(clause, clauseType, Bool.or, parentOperator === Bool.not ? 1 : index);

  const options = [];
  if (parentOperator === Bool.not) {
    options.push({
      label: notLabel,
      value: "not",
      tooltip: "Exclude this item or  group "
    });
    if (parent.and) {
      options.push({
        label: andLabel,
        value: "and",
        tooltip: "All of this group must be true"
      });
    }
    if (parent.or) {
      options.push({
        label: orLabel,
        value: "or",
        tooltip: "At least on of this group must be true"
      });
    }
    return options;
  }

  options.push({
    label: andLabel,
    value: "and",
    tooltip: "Must include"
  });
  options.push({
    label: orLabel,
    value: "or",
    tooltip: "At least one of this group must be true"
  });
  if (clauseType != "Where" && parent[operator] && parent[operator]!.length > 1 && index > 0)
    options.push({
      label: notLabel,
      value: "not",
      tooltip: "Exclude this item or  group "
    });

  return options;
}

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
export function getOperatorToggle(operator: string): string {
  return "Change to " + (operator === "and" ? '"or"' : '"and"') + " (" + (operator === "and" ? getOperatorText("or") : getOperatorText("and")) + ")";
}
export function getOperatorText(operator: string): string {
  if (operator === "or") {
    return "At least one of the following";
  } else if (operator === "and") {
    return "All of the following";
  } else if (operator === "not") {
    return "Exclude if any of the following";
  } else {
    return "whats this operator ";
  }
}

export function getConstraintOperator(constrainer: Element) {
  if (constrainer.descendantsOrSelfOf) return "<<";
  if (constrainer.descendantsOf) return "<";
  if (constrainer.memberOf) return "^";
  if (constrainer.ancestorsOrSelfOf) return ">>!";
  return "";
}

export function setConstraintOperator(constrainer: Element, valueConstraintOperator: string) {
  switch (valueConstraintOperator) {
    case "<<":
      constrainer.descendantsOrSelfOf = true;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case "<":
      constrainer.descendantsOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case "^":
      constrainer.memberOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case ">>!":
      constrainer.ancestorsOrSelfOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      break;
    default:
      constrainer.ancestorsOrSelfOf = false;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
  }
}

export function addSortingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {
  if (!imQuery.query.orderBy) {
    imQuery.query.orderBy = {};
    imQuery.query.orderBy.property = [];
  }
  const orderDirection = {
    iri: sortingField.iri,
    name: sortingField.name ? sortingField.name : "",
    direction: sortDirection.iri === IM.ASCENDING ? "ascending" : "descending"
  } as OrderDirection;
  imQuery.query.orderBy.property?.push(orderDirection);
}

export function addBindingsToIMQuery(searchBindings: SearchBinding[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.and)) imQuery.query.and = [];
  for (const searchBinding of searchBindings) {
    const match: Match = {
      path: [
        {
          iri: IM.BINDING
        }
      ],
      where: {
        and: [
          {
            iri: SHACL.PATH,
            is: [{ iri: searchBinding.path?.iri }]
          },
          {
            iri: SHACL.NODE,
            is: [{ iri: searchBinding.node?.iri }]
          }
        ]
      }
    };
    imQuery.query.and!.push(match);
  }
}
