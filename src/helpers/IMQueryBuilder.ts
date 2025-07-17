import {
  Bool,
  BoolGroup,
  Element,
  Match,
  Node,
  OrderDirection,
  Query,
  QueryRequest,
  RuleAction,
  SearchBinding,
  TTIriRef,
  Where,
  Path
} from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import Swal from "sweetalert2";

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

export async function setReturn(match: Match, keepAs: string) {
  if (keepAs === "") {
    if (match.return) {
      if (match.return.property) {
        await Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "You have already added properties to the output. Cannot remove label",
          confirmButtonText: "Close",
          confirmButtonColor: "#689F38"
        });
      } else delete match.return;
    }
  } else if (match.return) {
    match.return.as = keepAs;
  } else match.return = { as: keepAs };
}

export function checkGroupChange(e: any, parentGroup: number[], index: number) {
  if (e.length === 1) {
    if (!parentGroup.includes(index)) {
      parentGroup.push(index);
    }
  } else {
    if (parentGroup.includes(index)) {
      parentGroup.splice(parentGroup.indexOf(index), 1);
    }
  }
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
    for (const item of children) {
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

export function getBooleanLabel(clauseType: string, operator: Bool, index: number, standardQuery?: boolean, hasSubgroups?: boolean, union?: boolean): string {
  const isFirst = index === 0;
  const isMatch = clauseType === "Match";
  if (operator === Bool.and) {
    if (hasSubgroups) return isFirst ? "all of the following" : "and all of the following";
    else return isFirst ? (isMatch ? "Must be" : "Must have") : "And";
  }
  if (operator === Bool.or) {
    if (union) return "merge results from the following";
    if (hasSubgroups) return isFirst ? "at least one of the following" : "or at least one of the following";
    else return isFirst ? (isMatch ? "Either" : "Either") : "Or";
  }
  return standardQuery ? (hasSubgroups ? "Exclude if the following" : "Exclude") : "Minus";
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

export function deleteMatchFromParent(parentMatch: Match, index: number) {
  for (const key of ["rule", "and", "or", "not"] as const) {
    if (parentMatch[key]) {
      parentMatch[key]!.splice(index, 1);
    }
  }
}

export function addWhereToMatch(match: Match, path: string, property: string) {
  let nodeRef = ";";
  if (path != "") {
    const propertyTypePath = path.split(",");
    if (!match.path) match.path = [];
    nodeRef = findMatchPathVariable(match, propertyTypePath);
    if (nodeRef == "") {
      const matchPath = {} as Path;
      for (let i = 0; i < propertyTypePath.length; i += 2) {
        matchPath.iri = propertyTypePath[i];
        matchPath.typeOf = { iri: propertyTypePath[i + 1] };
        match.typeOf = matchPath.typeOf;
      }
      match.path.push(matchPath);
    }
  }
  const where = {} as Where;
  where.iri = property;
  if (match.where) {
    if (!match.where.and) {
      const currentWhere = match.where;
      match.where = {} as Where;
      match.where.and = [currentWhere];
      match.where.and.push(where);
    } else match.where.and.push(where);
  } else match.where = where;
}

function findMatchPathVariable(match: Match, path: string[]): string {
  if (!match.path) return "";
  let i = -1;
  for (const pathItem of match.path) {
    i++;
    if (pathItem.iri === path[i]) return pathItem.iri;
  }
  return "";
}
export function matchDefined(match: Match): boolean {
  return !!(match.path || match.where || match.instanceOf);
}
export function getRuleAction(match: Match): string {
  if (match.ifTrue) {
    return (match.ifTrue + match.ifFalse).toLowerCase();
  }
  return "nextreject";
}

export function addMatchToParent(match: Match, parent: Match) {
  for (const key of ["rule", "and", "or", "not"] as const) {
    if (parent[key]) {
      parent[key]!.push(match);
      break;
    }
  }
}
export function setRuleAction(match: Match, ruleAction: string) {
  switch (ruleAction) {
    case "selectnext": {
      match.ifTrue = RuleAction.SELECT;
      match.ifFalse = RuleAction.NEXT;
      break;
    }
    case "selectreject": {
      match.ifTrue = RuleAction.SELECT;
      match.ifFalse = RuleAction.REJECT;
      break;
    }
    case "nextSelect": {
      match.ifTrue = RuleAction.NEXT;
      match.ifFalse = RuleAction.SELECT;
      break;
    }
    case "nextReject": {
      match.ifTrue = RuleAction.NEXT;
      match.ifFalse = RuleAction.REJECT;
      break;
    }
    case "rejectnext": {
      match.ifTrue = RuleAction.REJECT;
      match.ifFalse = RuleAction.NEXT;
      break;
    }
    case "rejectselect": {
      match.ifTrue = RuleAction.REJECT;
      match.ifFalse = RuleAction.SELECT;
      break;
    }
  }
}
export function getRuleActionLabel(value: string): string {
  const match = getRuleActionOptions().find(item => item.value === value);
  return match?.label ?? "";
}
export function getRuleActionOptions(): any[] {
  const next = '<span style="color: var(--p-purple-500);padding-left: 0.2rem;padding-right: 0.2rem">NEXT</span>';
  const reject = '<span  style="color: var(--p-red-500);padding-left:0.2rem;padding-right: 0.2rem">REJECT</span>';
  const select = '<span style="color: var(--p-green-500);padding-left: 0.2rem; padding-right: 0.2rem">SELECT</span>';

  return [
    {
      label: "If true go to" + next + "if false" + reject,
      value: "nextreject",
      tooltip: "Equivalent to AND operator, must be true"
    },
    {
      label: "If true" + select + "and finish, if false go to" + next,
      value: "selectnext",
      tooltip: "Equivalent to OR operator, may be true"
    },
    {
      label: "If true go to" + next + ", if false" + select,
      value: "nextselect",
      tooltip: "Equivalent to OR /NOT"
    },
    {
      label: "If True" + select + "and finish, if false" + reject,
      value: "selectreject",
      tooltip: "Last rule in the query, must be true"
    },
    {
      label: "If True" + reject + ", if false go to" + next,
      value: "rejectnext",
      tooltip: "Equivalent to NOT operator"
    },
    {
      label: "If True" + reject + ", if false" + select,
      value: "rejectselect",
      tooltip: "Last rule in query, must be false"
    }
  ];
}

export function getBooleanOptions(
  clause: Match | Where,
  parent: BoolGroup<Match | Where>,
  parentOperator: Bool,
  clauseType: string,
  index: number,
  standardQuery?: boolean,
  hasSubgroups?: boolean
): any[] {
  const operator = parentOperator as keyof typeof parent;
  const union = ("union" in parent) as boolean;
  const notLabel = getBooleanLabel(clauseType, Bool.not, index, standardQuery, hasSubgroups);
  const andLabel = getBooleanLabel(clauseType, Bool.and, parentOperator === Bool.not ? 1 : index, standardQuery, hasSubgroups);
  const orLabel = getBooleanLabel(clauseType, Bool.or, parentOperator === Bool.not ? 1 : index, standardQuery, hasSubgroups, union);
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
  if (clauseType != "Where" && parent[operator] && ((parent[operator]!.length > 1 && index > 0) || standardQuery))
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

export function isGroupable(rootBool?: boolean, parentMatch?: Match, parentOperator?: Bool): boolean {
  if (parentOperator && parentOperator === Bool.rule) return false;
  if (parentMatch && !rootBool && parentOperator) {
    const parentGroup = (parentMatch[parentOperator as keyof Match] as Match[]) || [];
    return parentGroup.length > 2;
  }
  return false;
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
