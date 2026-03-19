import { Bool, Match, Node, Query, QueryRequest, RuleAction, SearchBinding, Where, Path, NodeShape, Return } from "@/interfaces/AutoGen";
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
  if (parentOperator !== Bool.or) {
    if (clauseIndex > 0) {
      return parentOperator as string;
    } else return parentOperator as string;
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

export function setDefiningProperty(match: Match, typeNode: TreeNode, path: string): void {
  if (typeNode.children)
    for (const property of typeNode.children) {
      if (property.data.definingProperty) {
        if (!hasProperty(match.where, property.data!.iri)) {
          const nodeRef = setPathGetNodeRef(match, path);
          addWhereToMatch(match, { nodeRef: nodeRef, iri: property.data!.iri, invalid: true }, 0);
        }
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
  if ((!nodeRef || nodeRef === "") && !match.nodeRef) return baseType.iri!;
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

export function setPathGetNodeRef(match: Match, path: string, optional?: boolean): string {
  acronyms.clear();
  const fullPath = path.split("\t");
  if (match.path) {
    for (const path of match.path) {
      if (path.node) acronyms.add(path.node);
    }
    const rootPath = findPath(match.path, fullPath[0]);
    if (!rootPath) {
      const path = { iri: fullPath[0], typeOf: { iri: fullPath[1] }, node: getAcronym(fullPath[0]) } as Path;
      if (optional) path.optional = true;
      match.path!.push(path);
      return getPathOnPath(path, fullPath.splice(2).join("\t"));
    } else if (fullPath.length > 2) {
      return getPathOnPath(rootPath, fullPath.splice(2).join("\t"));
    } else return rootPath.node!;
  } else {
    const nodeRef = getAcronym(fullPath[0]);
    match.path = [{ iri: fullPath[0], typeOf: { iri: fullPath[1] }, node: nodeRef }];
    if (optional) match.path[0].optional = true;
    if (fullPath.length > 2) {
      return getPathOnPath(match.path[0], fullPath.splice(1).join("\t"));
    } else return nodeRef;
  }
}

function getPathOnPath(pathTrunk: Path, path: string): string {
  const remainingPath = path.split("\t");
  if (pathTrunk.path) {
    for (const path of pathTrunk.path) {
      if (path.node) acronyms.add(path.node);
    }
    const branchPath = findPath(pathTrunk.path, remainingPath[0]);
    if (!branchPath) {
      const nextPath = {
        iri: remainingPath[0],
        typeOf: { iri: remainingPath[1] },
        node: getAcronym(remainingPath[0])
      } as Path;
      pathTrunk.path!.push(nextPath);
      return getPathOnPath(nextPath, remainingPath.splice(1).join("\t"));
    } else if (remainingPath.length > 2) {
      return getPathOnPath(branchPath, remainingPath.splice(1).join("\t"));
    } else return branchPath.node!;
  } else {
    const nodeRef = getAcronym(remainingPath[0]);
    pathTrunk.path = [{ iri: remainingPath[0], typeOf: { iri: remainingPath[1] }, node: nodeRef }];
    if (remainingPath.length > 2) {
      return getPathOnPath(pathTrunk.path[0], remainingPath.splice(1).join("\t"));
    } else return nodeRef;
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

export async function getNodeShape(match: Match, baseType: Node): Promise<NodeShape> {
  if (!match.path && !match.where) await DataModelService.getDataModelProperties(baseType.iri!, false);
  const typeIri = match.path ? match.path[0].typeOf!.iri : baseType.iri;
  return await DataModelService.getDataModelProperties(typeIri!, false);
}

const acronyms = new Set<string>();

function getAcronym(iri: string | null | undefined): string {
  if (!iri || iri.trim() === "") return "";

  // Extract the local name after the last #
  const hashIndex = iri.lastIndexOf("#");
  const local = hashIndex !== -1 ? iri.substring(hashIndex + 1) : iri;
  const parts = local.split(/(?<!^)(?=[A-Z0-9])/);
  let sb = "";
  for (const part of parts) {
    if (part.trim() === "") continue;
    sb += part.charAt(0).toUpperCase();
  }

  let acronym = sb.toLowerCase();
  if (acronyms.has(acronym)) {
    let i = 1;
    while (acronyms.has(`${acronym}${i}`)) {
      i++;
    }
    acronym = `${acronym}${i}`;
  }

  acronyms.add(acronym);
  return acronym;
}

function findPath(paths: Path[], pathIri: string): Path | undefined {
  return paths.find(item => item.iri === pathIri);
}

export function updateRelativeTo(property: Where, node: TreeNode) {
  if (!property.compare) property.compare = {};
  if (!property.compare.right) property.compare.right = {};
  if (node.data.parameter) {
    property.compare.right.parameter = node.data.parameter;
    delete property.compare.right.nodeRef;
  }
  if (node.data.nodeRef) {
    property.compare.right.nodeRef = node.data.nodeRef;
    property.compare.right.iri = node.data.iri;
    delete property.compare.right.parameter;
  }
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
  for (const step of matches) {
    if (step.node && step.node === nodeRef && step.return) return getReturnFields(step.return);
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
