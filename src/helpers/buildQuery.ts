import { Bool, HasPaths, Match, Node, NodeShape, Path, Query, QueryRequest, Return, RuleAction, SearchBinding, Where } from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import type { TreeNode } from "primevue/treenode";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash-es";
import { Orderable } from "@/models/orderable";
import { v4 } from "uuid";
import { DataModelService } from "@/services";

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
      await Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "You have already added properties to the output. Cannot remove label",
        confirmButtonText: "Close",
        confirmButtonColor: "#689F38"
      });
    } else delete match.node;
  } else match.node = keepAs;
}

export function checkGroupChange(e: any, parentGroup: number[], index: number) {
  if (e) {
    if (!parentGroup.includes(index)) {
      parentGroup.push(index);
    }
  } else {
    if (parentGroup.includes(index)) {
      parentGroup.splice(parentGroup.indexOf(index), 1);
    }
  }
  parentGroup.sort((a, b) => a - b);
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
  if (match.is && match.is[0].iri) return [match.is[0].iri];
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

export function removeSubgroup(clause: Match | Where, parent: Match | Where, index: number) {
  if (parent.or) {
    parent.or.splice(index, 1);
    if (clause.and) {
      parent.or.push(...clause.and);
    } else if (clause.or) parent.or.push(...clause.or);
  }
  if (parent.and) {
    parent.and.splice(index, 1);
    if (clause.or) {
      parent.and.push(...clause.or);
    } else if (clause.and) parent.and.push(...clause.and);
  }
}

export function createNewBoolGroup(clause: Match | Where, group: number[]) {
  group.sort((a, b) => a - b);
  const newClause: Where = {};
  if (clause.and) {
    newClause.or = [];
    group.forEach(index => {
      newClause.or!.push(clause.and![index]!);
    });
    const newAndGroup = [];
    for (const [index, item] of clause.and!.entries()) {
      if (!group.includes(index)) newAndGroup.push(item);
    }
    clause.and = newAndGroup;
    clause.and.push(newClause);
  }
  if (clause.or) {
    newClause.and = [];
    group.forEach(index => {
      newClause.and!.push(clause.or![index]!);
    });
    const newOrGroup = [];
    for (const [index, item] of clause.or!.entries()) {
      if (!group.includes(index)) newOrGroup.push(item);
    }
    clause.or = newOrGroup;
    clause.or.push(newClause);
  }
}

export function addConceptToGroup(match: Match) {
  if (match.or) match.or.push({ uuid: v4(), is: [{ descendantsOrSelfOf: true }] });
  else if (match.and) match.and.push({ uuid: v4(), is: [{ descendantsOrSelfOf: true }] });
  else {
    const subMatch = cloneDeep(match);
    delete match.is;
    match.or = [subMatch];
    match.or.push({ uuid: v4(), is: [{ descendantsOrSelfOf: true }] });
  }
}

export function updateBooleans(clause: Match | Where, from: Bool, to: Bool) {
  if (from === to) return;
  if (from === Bool.and) {
    clause.or = (clause as Where).and;
    delete (clause as Where).and;
  } else if (from === Bool.or) {
    clause.and = clause.or;
    delete clause.or;
  }
}

export function getDisplayOperator(parentOperator: Bool | undefined, clauseIndex: number): string | undefined {
  if (!parentOperator) return undefined;
  if (parentOperator != Bool.or) {
    if (clauseIndex > 0) {
      return parentOperator as string;
    } else return "";
  } else if (clauseIndex === 0) return "Either";
  else return parentOperator as string;
}

export function getBooleanOperator(clauseType: string, clause: Match | Where | undefined): Bool | undefined {
  if (!clause) return undefined;
  if (clause.and) return Bool.and;
  if (clause.or) return Bool.or;
  else if ((clause as Match).rule) return Bool.rule;
  else return undefined;
}
export function getBoolGroup(clauseType: string, clause: Match | Where | undefined): Match[] | Where[] | undefined {
  if (!clause) return undefined;
  if (clause.or) return clause.or;
  if (clause.and) return clause.and;
  if ((clause as Match).rule) return (clause as Match).rule;
  else return undefined;
}

export function getBooleanLabel(clauseType: string, operator: Bool, index: number, standardQuery?: boolean, hasSubgroups?: boolean): string {
  const isFirst = index === 0;
  const isMatch = clauseType === "Match";
  const parentPrefix = "";

  if (operator === Bool.and) {
    if (hasSubgroups) return isFirst ? "all of the following" : parentPrefix + "all of the following";
    else return isFirst ? (isMatch ? "Must be" : "Must have") : "And";
  } else if (operator === Bool.or) {
    if (hasSubgroups) {
      if (standardQuery) {
        return isFirst ? "at least one of the following" : parentPrefix + "at least one of the following";
      } else return isFirst ? "any of the following" : parentPrefix + " any of the following";
    }
    return "Or";
  }
  return "";
}

export function getIsRoleGroup(clause: Where | undefined | Match): boolean {
  if (!clause) return false;
  const where = clause as Where;
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

export function deleteGroupFromQuery(query: Query, index: number) {
  query.columnGroup!.splice(index, 1);
}

export function deletePropertyFromParent(match: Match, parentWhere: Where, index: number) {
  if (parentWhere) {
    for (const key of ["and", "or"] as const) {
      if (parentWhere[key]) {
        parentWhere[key]!.splice(index, 1);
      }
    }
  } else {
    delete match.where;
  }
}

export function hasWhere(match: Match, whereToFind: Where): boolean {
  if (match.where) {
    return hasWhereInWhere(match.where, whereToFind);
  } else return false;
}

function hasWhereInWhere(where: Where, whereToFind: Where): boolean {
  if (where.iri) {
    if (where.iri === whereToFind.iri) return true;
  }
  const subWheres = where.and || where.or;
  if (subWheres) {
    for (const subWhere of subWheres) {
      if (hasWhereInWhere(subWhere, whereToFind)) return true;
    }
  }
  return false;
}

export function addWhereToMatch(match: Match, where: Where, index?: number) {
  if (match.where) {
    if (!match.where.and) {
      const currentWhere = match.where;
      match.where = {} as Where;
      match.where.and = [currentWhere];
    }
    if (index === undefined || index < 0 || index >= match.where.and.length) match.where.and!.push(where);
    else match.where.and!.splice(index, 0, where); // insert
  } else match.where = where;
}
export function getPathPropertyNames(pathable: Match | Path, where: Where): string | undefined {
  if (!where.nodeRef) return where.name;
  if (pathable.path) {
    for (const path of pathable.path) {
      if (path.node === where.nodeRef) return path.name + "/ " + where.name;
      const pathName = getPathPropertyNames(path, where);
      if (pathName) return path.name + "->" + pathName;
    }
  }
  return undefined;
}
export function getPathName(pathable: Match | Path, nodeRef: string | undefined): string | undefined {
  if (!pathable.path) return undefined;
  if (!nodeRef) return undefined;
  for (const path of pathable.path) {
    if (path.node === nodeRef) return path.name + "->";
    const pathName = getPathName(path, nodeRef);
    if (pathName) return path.name + "->" + pathName;
  }
}

export function getRuleAction(match: Match): string {
  if (match.ifTrue) {
    return (match.ifTrue + match.ifFalse).toLowerCase();
  }
  return "nextreject";
}

export function addMatchToParent(parent: Match, match: Match) {
  const matches = parent.rule || parent.and || parent.or;
  if (matches) matches.push(match);
  else if (parent.is) {
    parent.and = [];
    const isMatch = { uuid: v4(), is: parent.is } as Match;
    parent.and.push(isMatch);
    parent.and.push(match);
    delete parent.is;
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
export function getExclusionOptions(): any[] {
  const options = [];
  options.push({
    label: "Include",
    value: false,
    tooltip: "Include by default"
  });
  options.push({
    label: "Exclude",
    value: true,
    tooltip: "Exclude from results"
  });
  return options;
}

export function getBooleanOptions(clauseType: string, index: number, standardQuery?: boolean, hasSubgroups?: boolean): any[] {
  const andLabel = getBooleanLabel(clauseType, Bool.and, index, standardQuery, hasSubgroups);
  const orLabel = getBooleanLabel(clauseType, Bool.or, index, standardQuery, hasSubgroups);
  const options = [];

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
  if (index > 0) {
    options.push({
      label: "Exclude",
      value: "not",
      tooltip: "Exclude this from the group"
    });
  }

  return options;
}

export function isGroupable(rootBool?: boolean, parentClause?: Match | Where, parentOperator?: Bool): boolean {
  if (parentOperator && parentOperator === Bool.rule) return false;
  if (parentClause && !rootBool && parentOperator) {
    const parentGroup = (parentClause[parentOperator as keyof (Match | Where)] as Match[]) || [];
    return parentGroup.length > 2;
  }
  return false;
}
export function getConstraintOperator(constrainer: Node | Where) {
  if (constrainer.descendantsOrSelfOf) return "<<";
  if (constrainer.descendantsOf) return "<";
  if (constrainer.memberOf) return "^";
  if (constrainer.ancestorsOf) return ">>";
  return "";
}

export function setConstraintOperator(constrainer: Node | Where, valueConstraintOperator: string) {
  switch (valueConstraintOperator) {
    case "<<":
    case "descendantsOrSelfOf":
      constrainer.descendantsOrSelfOf = true;
      delete constrainer.descendantsOf;
      delete constrainer.memberOf;
      delete constrainer.ancestorsOf;
      break;
    case "<":
    case "descendantsOf":
      constrainer.descendantsOf = true;
      delete constrainer.descendantsOrSelfOf;
      delete constrainer.memberOf;
      delete constrainer.ancestorsOf;
      break;
    case "^":
    case "memberOf":
      constrainer.memberOf = true;
      delete constrainer.descendantsOrSelfOf;
      delete constrainer.descendantsOf;
      delete constrainer.ancestorsOf;
      break;
    case ">>":
    case "ancestorsOrSelfOf":
      constrainer.ancestorsOf = true;
      delete constrainer.descendantsOrSelfOf;
      delete constrainer.descendantsOf;
      delete constrainer.memberOf;
      break;
    default:
      delete constrainer.ancestorsOf;
      delete constrainer.descendantsOrSelfOf;
      delete constrainer.descendantsOf;
      delete constrainer.memberOf;
  }
}
export function addRefinementToGroup(where: Where) {
  if (where.or) {
    where.or.push({ uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where);
  } else if (where.and) {
    where.and.push({ uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where);
  }
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

export function createNodeVariable(match: Match, index: number): string {
  let nodeVariable = "";
  if (match.path) nodeVariable = match.path[0]!.typeOf!.name!.replace(" ", "");
  else nodeVariable = "Match";
  return nodeVariable + (index > 0 ? "_" + index : "");
}

export function setDefiningProperty(match: Match, nodeShape: NodeShape): void {
  if (nodeShape.definingProperty) {
    if (!hasProperty(match.where, nodeShape.definingProperty.iri)) {
      const where = { iri: nodeShape.definingProperty.iri, invalid: true } as Where;
      const propertyShape = nodeShape.property?.find(property => property.path.iri === nodeShape.definingProperty!.iri);
      if (propertyShape && propertyShape.clazz) where.is = [{}];
      addWhereToMatch(match, where);
    }
  }
}

function hasProperty(where: Where | undefined, propertyIri: string): boolean {
  if (!where) return false;
  if (where.iri) return where.iri === propertyIri;
  const wheres = where.and || where.or;
  if (wheres) return wheres.some(item => hasProperty(item, propertyIri));
  return false;
}

export function getTypeIriFromMatch(match: Match, baseType: Node, nodeRef: string | undefined, parent?: Match): string {
  if ((!nodeRef || nodeRef === "") && match.typeOf) return match.typeOf.iri!;
  if (match.path && nodeRef) {
    for (const path of match.path) {
      const type = getTypeIriFromPath(path, nodeRef);
      if (type) return type;
    }
  } else if (match.nodeRef && parent) {
    if (parent.return) {
      for (const ret of parent.return) {
        if (ret.nodeRef) {
          const type = getTypeIriFromMatch(parent, baseType, ret.nodeRef);
          if (type) return type;
        }
      }
    }
  }
  return baseType.iri!;
}

function getTypeIriFromPath(path: Path, nodeRef: string): string | undefined {
  if (path.node === nodeRef) return path.typeOf!.iri;
  if (path.path) {
    for (const subPath of path.path) {
      const type = getTypeIriFromPath(subPath, nodeRef);
      if (type) return type;
    }
  }
  return undefined;
}
export function addReturn(match: Match, node: TreeNode) {
  if (node.type === "property") {
    const fullPath = node.data.path;
    let nodeRef;
    if (fullPath) {
      nodeRef = setPathGetNodeRef(match, fullPath, true);
    }
    const ret = { iri: node.data.iri, name: node.label, as: node.label } as Return;
    if (nodeRef) ret.nodeRef = nodeRef;
    if (!match.return) match.return = [];
    match.return.push(ret);
  }

  match.invalid = false;
}
export function addFilter(match: Match, node: TreeNode): string | undefined {
  let nodeRef;
  if (node.type === "property") {
    const fullPath = node.data.path;
    if (fullPath) {
      nodeRef = setPathGetNodeRef(match, fullPath, true);
    }
    if (node.data.rangeType != SHACL.NODESHAPE) {
      const where = { iri: node.data.iri, invalid: true } as Where;
      if (nodeRef) where.nodeRef = nodeRef;
      if (node.data.rangeType === IM.VALUESET || node.data.rangeType === IM.CONCEPT) where.is = [{}];
      addWhereToMatch(match, where);
    }
  }

  match.invalid = false;
  return nodeRef;
}

export function setPathGetNodeRef(pathable: HasPaths, fullPath: string, optional?: boolean): string | undefined {
  if (!fullPath) return undefined;
  let i = 0;
  const paths = fullPath.split("\t");
  for (i = 0; i < paths.length; i = i + 2) {
    if (pathable.path) {
      const path = findPath(pathable.path, fullPath[i]);
      if (path) {
        pathable = path;
        if (i === paths.length - 2) {
          return path.node;
        }
      } else {
        const newPath = { iri: paths[i], typeOf: { iri: paths[i + 1] }, node: getAcronym(paths[i]) + "_" + i + "_" + pathable.path.length } as Path;
        if (optional) newPath.optional = true;
        pathable.path!.push(newPath);
        pathable = newPath;
        if (i === paths.length - 2) {
          return newPath.node;
        }
      }
    } else {
      const newPath = { iri: paths[i], typeOf: { iri: paths[i + 1] }, node: getAcronym(paths[i]) + "_" + i } as Path;
      if (optional) newPath.optional = true;
      pathable.path = [newPath];
      pathable = newPath;
      if (i === paths.length - 2) {
        return newPath.node;
      }
    }
  }
}

export function getOrderables(nodeShape: NodeShape): Orderable[] {
  const orderables = [] as Orderable[];
  if (nodeShape.property) {
    for (const propertyShape of nodeShape.property) {
      if (propertyShape.orderable && propertyShape.path) {
        orderables.push({
          iri: propertyShape.path.iri,
          name: propertyShape.path.name,
          ascending: propertyShape.ascending!,
          descending: propertyShape.descending!
        });
      }
    }
  }
  return orderables;
}
export function getFormattedPath(path: any): string {
  let result = "";
  if (path.path) {
    for (let i = 0; i < path.path.length; i++) {
      if (result != "") result = result + " ->";
      result = result + path.path[i].name;
    }
  }
  return result;
}

function getAcronym(iri: string | null | undefined): string {
  if (!iri || iri.trim() === "") return "";
  const local = iri.substring(iri.lastIndexOf("#") + 1);
  const parts = local.split(/(?=[A-Z])/);
  let sb = "";
  for (const part of parts) {
    if (part.trim() === "") continue;
    sb += part.substring(0, Math.min(part.length, 3)).toUpperCase();
  }

  return sb.toLowerCase();
}

function findPath(paths: Path[], pathIri: string): Path | undefined {
  return paths.find(item => item.iri === pathIri);
}

export function removeUndefined(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}

export function getResults(nodeRef: string, parentMatch: Match): string | undefined {
  if (!parentMatch.and) return undefined;
  const matches = parentMatch.and || parentMatch.or;
  if (!matches) return undefined;
  return getFromMatches(nodeRef, matches, false);
}

export function getTestFields(then: Where): string | undefined {
  if (!then) return undefined;
  if (then.iri) return then.name;
  const wheres = then.and || then.or;
  if (wheres) {
    const display: string[] = [];
    for (const where of wheres) {
      addTestFields(where, display);
    }
    return display.join(",");
  }
}

function addTestFields(where: Where, display: string[]) {
  if (where.name && !display.includes(where.name)) display.push(where.name);
  else {
    const wheres = where.and || where.or;
    if (wheres) {
      for (const where of wheres) {
        addTestFields(where, display);
      }
    }
  }
}

function getFromMatches(nodeRef: string, matches: Match[], matched: boolean): string | undefined {
  if (!matches) return undefined;
  for (const step of matches) {
    if (matched && step.return) return getReturnFields(step.return);
    else if (matched) {
      const subMatches = step.and || step.or;
      if (subMatches && subMatches.length > 0) {
        return getFromMatches(nodeRef, subMatches, true);
      }
    }
    if (step.node && step.node === nodeRef && step.return) return getReturnFields(step.return);
    else if (step.node && step.node === nodeRef) {
      const subMatches = step.and || step.or;
      if (subMatches && subMatches.length > 0) {
        return getFromMatches(nodeRef, subMatches, true);
      }
    } else {
      const subMatches = step.and || step.or;
      if (subMatches && subMatches.length > 0) {
        const fields = getFromMatches(nodeRef, subMatches, false);
        if (fields) return fields;
      }
    }
  }
  return undefined;
}
function getReturnFields(returnFields: Return[]): string {
  if (Array.isArray(returnFields)) {
    let display = "";
    for (let i = 1; i < returnFields.length; i++) {
      display += display === "" ? returnFields[i].name : ", " + returnFields[i].name;
    }
    return display;
  }
  return "";
}
export function getRelativeToOptions(keepAs: Match[]): any[] {
  const options = [
    {
      label: "Search date",
      value: "$searchDate",
      tooltip: "relative to the search date"
    },
    {
      label: "Achievement date",
      value: "$achievementDate",
      tooltip: "relative to the achievement date"
    }
  ];
  if (keepAs.length > 0) {
    for (const keepAsMatch of keepAs) {
      if (keepAsMatch.node) {
        options.push({
          label: keepAsMatch.node,
          value: keepAsMatch.node,
          tooltip: "relative to a property of the entries found in this  clause"
        });
      }
    }
  }
  return options;
}

export async function getRelativePropertyOptions(keepAs: Match[], nodeRef: string, valueType?: string): Promise<any[]> {
  const options: any[] | PromiseLike<any[]> = [];
  if (!valueType) return options;
  const match = keepAs.find(item => item.node === nodeRef);
  if (!match) return options;
  const dataModel = await DataModelService.getDataModelProperties(match.typeOf!.iri!, false);
  if (!dataModel) return options;
  if (dataModel.property) {
    for (const propertyShape of dataModel.property) {
      if (propertyShape.datatype && propertyShape.datatype.iri === valueType) {
        options.push({
          label: propertyShape.path.name,
          value: propertyShape.path.iri
        });
      }
    }
  }
  return options;
}

export function clauseCheck(importClauses: Map<string, Match>, match: Match, checked: boolean) {
  if (checked) {
    importClauses.set(match.uuid!, match);
    for (const subMatch of match.and || match.or || []) {
      deleteChecks(importClauses, subMatch);
    }
  } else importClauses.delete(match.uuid!);
}

function deleteChecks(importClauses: Map<string, Match>, match: Match) {
  importClauses.delete(match.uuid!);
  for (const subMatch of match.and || match.or || []) {
    deleteChecks(importClauses, subMatch);
  }
}
