import { Bool, Match, Node, Query, QueryRequest, RuleAction, SearchBinding, Where, Path, Operator } from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import type { TreeNode } from "primevue/treenode";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash-es";
import { isFolder, isFunction, isProperty, isRecordModel } from "@/helpers/ConceptTypeMethods";
import { v4 } from "uuid";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";
import { useDialogStore } from "@/stores/dialogStore";

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
  const dialogStore = useDialogStore();
  if (keepAs === "") {
    if (match.return) {
      await dialogStore.open(GenericDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-exclamation",
          title: "Warning",
          text: "You have already added properties to the output. Cannot remove label",
          confirmButtonText: "Close"
        }
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
    if (clause.and) parent.or.push(...clause.and);
  }
  if (parent.and) {
    parent.and.splice(index, 1);
    if (clause.or) parent.and.push(...clause.or);
  }
}

export function createNewBoolGroup(clause: Match | Where, group: number[]) {
  group.sort((a, b) => a - b);
  const newClause: Match | Where = {};
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
  if (match.or) match.or.push({ is: [{ descendantsOrSelfOf: true }] });
  else if (match.and) match.and.push({ is: [{ descendantsOrSelfOf: true }] });
  else {
    const subMatch = cloneDeep(match);
    delete match.is;
    match.or = [subMatch];
    match.or.push({ is: [{ descendantsOrSelfOf: true }] });
  }
}

export function updateBooleans(clause: Match | Where, from: Bool, to: Bool) {
  if (from === to) return;
  if (from === Bool.and) {
    clause.or = clause.and;
    delete clause.and;
  } else if (from === Bool.or) {
    clause.and = clause.or;
    delete clause.or;
  }
}

export function hasBoolGroups(clause: Match) {
  return !!(clause.or || clause.and);
}

export function hasExpandableGroups(clause: Match) {
  return !!clause.step;
}

export function getBooleanLabel(
  clauseType: string,
  operator: Bool,
  index: number,
  standardQuery?: boolean,
  hasSubgroups?: boolean,
  parentOperator?: Bool
): string {
  const isFirst = index === 0;
  const isMatch = clauseType === "Match";
  if (operator === Bool.and) {
    if (hasSubgroups) return isFirst ? "all of the following" : (parentOperator && parentOperator === Bool.or ? "or " : "and ") + "all of the following";
    else return isFirst ? (isMatch ? "Must be" : "Must have") : "And";
  }
  if (operator === Bool.union) return "merge results from the following";
  else {
    if (hasSubgroups) {
      if (standardQuery) {
        return isFirst ? "at least one of the following" : (parentOperator && parentOperator === Bool.and ? "and " : "or ") + "at least one of the following";
      } else return isFirst ? "any of the following" : (parentOperator && parentOperator === Bool.and ? "and " : "or ") + " any of the following";
    }
    return "Or";
  }
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

export function deleteMatchFromParent(parentMatch: Match, index: number) {
  for (const key of ["rule", "and", "or"] as const) {
    if (parentMatch[key]) {
      parentMatch[key]!.splice(index, 1);
    }
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

function addPath(match: Match, flatPath: string): string | undefined {
  let matchPath: Path | undefined = undefined;
  const paths = flatPath.split("\t");
  for (let i = 0; i < paths.length - 1; i++) {
    if (!matchPath) {
      match.path = [{ iri: paths[i], typeOf: { iri: paths[i + 1] } }];
      matchPath = match.path[0];
    } else {
      matchPath.path = [{ iri: paths[i], typeOf: { iri: paths[i + 1] } }];
      matchPath = matchPath.path[0];
    }
  }
  const refNumber = Object.keys(paths || {}).length + 1;
  let lastPart = paths[paths.length - 1];
  if (lastPart.includes("#")) lastPart = lastPart.split("#")[1];
  const nodeRef = lastPart + refNumber.toString();
  if (matchPath) {
    matchPath.node = nodeRef;
    return nodeRef;
  }
  return undefined;
}
function getPaths(match: Match): Record<string, string> | undefined {
  if (!match.path) return undefined;
  const paths = {} as Record<string, string>;
  const path = match.path[0];
  const flatPath = path.iri! + "\t" + path.typeOf!.iri;
  if (path.node != null) {
    paths[flatPath] = path.node;
  }
  if (path.path) {
    addSubPaths(flatPath, path, paths);
  }
  return paths;
}

function addSubPaths(flatPath: string, path: Path, paths: Record<string, string>): void {
  const childPath = path.path![0];
  const childFlatPath = childPath.iri! + "\t" + childPath.typeOf!.iri;
  if (childPath.node != null) {
    paths[flatPath + "\t" + childFlatPath] = childPath.node;
  }
  if (childPath.path) {
    addSubPaths(flatPath + "\t" + childFlatPath, childPath, paths);
  }
}

export function addWhereToMatch(match: Match, node: TreeNode, property: string) {
  let nodeRef;
  const path = node.data.path;
  if (path) {
    const paths = getPaths(match);
    if (paths && path in paths) {
      nodeRef = paths[path];
    } else {
      nodeRef = addPath(match, path);
    }
  }
  const where = {} as Where;
  where.iri = property;
  if (nodeRef) where.nodeRef = nodeRef;
  if (match.where) {
    if (!match.where.and) {
      const currentWhere = match.where;
      match.where = {} as Where;
      match.where.and = [currentWhere];
      match.where.and.push(where);
    } else match.where.and.push(where);
  } else match.where = where;
}

export function matchDefined(match: Match): boolean {
  return !!(match.path || match.where || match.is || match.rule || match.and || match.or || match.step);
}
export function getRuleAction(match: Match): string {
  if (match.ifTrue) {
    return (match.ifTrue + match.ifFalse).toLowerCase();
  }
  return "nextreject";
}

export function addMatchToParent(match: Match, parent: Match) {
  for (const key of ["rule", "and", "or"] as const) {
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

export function getBooleanOptions(clauseType: string, index: number, standardQuery?: boolean, hasSubgroups?: boolean, parentOperator?: Bool): any[] {
  const andLabel = getBooleanLabel(clauseType, Bool.and, index, standardQuery, hasSubgroups, parentOperator);
  const orLabel = getBooleanLabel(clauseType, Bool.or, index, standardQuery, hasSubgroups, parentOperator);
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
export function buildProperty(treeNode: TreeNode): Where | Match {
  const flatList: TreeNode[] = [];
  populateFlatListOfNodesRecursively(flatList, treeNode);
  let currentMatchOrProperty = {};
  for (const [index, treeNode] of flatList.entries()) {
    if (!index) {
      const parentProperty: any = buildPropertyFromTreeNode(treeNode);
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    } else if (isRecordModel(treeNode.conceptTypes)) {
      const parentMatch = { iri: v4(), typeOf: { iri: treeNode.data }, where: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else if (isProperty(treeNode.conceptTypes) || isFunction(treeNode.conceptTypes)) {
      const parentProperty: any = { iri: treeNode.data };
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    }
  }

  return currentMatchOrProperty as Where;
}

function populateFlatListOfNodesRecursively(flatList: TreeNode[], treeNode: TreeNode) {
  const isRoot = treeNode.parent ? treeNode.parent.key === "0" : true;
  if (!isFolder(treeNode.conceptTypes) && !isRoot) flatList.push(treeNode);
  if (treeNode.parent && !isRoot) populateFlatListOfNodesRecursively(flatList, treeNode.parent);
}

function buildPropertyFromTreeNode(treeNode: TreeNode) {
  if (treeNode.property) return treeNode.property;
  const property: Where = { iri: treeNode.data } as Where;
  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = Operator.eq;
    property.value = "";
  } else if (isObjectHasKeys(treeNode.ttproperty, [SHACL.CLASS])) {
    property.is = [];
  }
  (property as any).key = treeNode.key;
  return property;
}
export function updateRelativeTo(property: Where, node: TreeNode) {
  if (!property.relativeTo) property.relativeTo = {};
  if (node.data.parameter) {
    property.relativeTo.parameter = node.data.parameter;
    delete property.relativeTo.nodeRef;
  }
  if (node.data.nodeRef) {
    property.relativeTo.nodeRef = node.data.nodeRef;
    property.relativeTo.iri = node.data.iri;
    delete property.relativeTo.parameter;
  }
}

export function removeUndefined(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}
