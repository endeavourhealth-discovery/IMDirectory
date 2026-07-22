import { Ref } from "vue";

import { MatchSchema, NodeSchema, Operator, QueryRequestSchema, WhereSchema } from "@endeavour/vue-library";
import { Bool, IM, RDF, RuleAction, SHACL, XSD } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type {
  Match,
  Node,
  NodeShape,
  Orderable,
  Path,
  PropertyRange,
  Query,
  QueryRequest,
  Return,
  SearchBinding,
  When,
  Where
} from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";
import type { TreeNode } from "primevue/treenode";
import { v4 } from "uuid";

import { Relativity } from "@/enums";
import { SearchOptions } from "@/interfaces";
import { DataModelService, QueryService } from "@/services";

interface Options {
  value: string;
  label?: string;
  tooltip?: string;
  name?: string;
}

export function buildIMQueryFromFilters(filterOptions: SearchOptions): QueryRequest {
  const imQuery = QueryRequestSchema.parse({ query: {} });
  if (imQuery.query) {
    if (isArrayHasLength(filterOptions.status)) addFilterToIMQuery(IM.HAS_STATUS, filterOptions.status, imQuery.query);
    if (isArrayHasLength(filterOptions.types)) addFilterToIMQuery(RDF.TYPE, filterOptions.types, imQuery.query);
    if (isArrayHasLength(filterOptions.schemes)) addFilterToIMQuery(IM.HAS_SCHEME, filterOptions.schemes, imQuery.query);
    if (isArrayHasLength(filterOptions.isA)) addFilterToIMQuery(IM.IS_A, filterOptions.isA!, imQuery.query);
  }
  if (isArrayHasLength(filterOptions.binding)) addBindingsToIMQuery(filterOptions.binding!, imQuery);
  if (filterOptions.page) imQuery.page = filterOptions.page;
  if (filterOptions.textSearch) imQuery.textSearch = filterOptions.textSearch;
  return imQuery;
}

export function getOperatorOptions(valueType: string): Options[] {
  const options: Options[] = [];
  if (valueType != XSD.STRING) {
    options.push({
      label: "equal to",
      value: Operator.eq,
      tooltip: "exactly equal to value"
    });
    options.push({
      label: "greater or equal to",
      value: Operator.gte,
      tooltip: "inclusive of value"
    });
    options.push({
      label: "less than or equal to",
      value: Operator.lte,
      tooltip: "inclusive of value"
    });
    options.push({
      label: "greater than",
      value: Operator.gt,
      tooltip: "exclusive of value"
    });
    options.push({
      label: "less than",
      value: Operator.lt,
      tooltip: "exclusive of value"
    });
  } else {
    options.push({ label: "is", value: Operator.eq });
    options.push({ label: "starts with", value: Operator.start });
    options.push({ label: "contains", value: Operator.contains });
    options.push({ value: Operator.notNull, label: "is recorded" });
    options.push({ value: Operator.isNull, name: "is not recorded" });
  }
  return options;
}

export function getCompareOptions(valueType: string): Options[] {
  const options = [];
  options.push({ label: "Compare to another value", value: Relativity.Compare });
  if (valueType != XSD.STRING) {
    options.push({ label: "Compare with offset from another value", value: Relativity.Relative });
  }
  options.push({ label: "Compare with fixed value", value: Relativity.Absolute });
  return options;
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

function addFilterToIMQuery(predicate: string, values: unknown[], query: Query) {
  if (!query.where) query.where = WhereSchema.parse({});
  if (!query.where.and) query.where.and = [];
  const where: Where = WhereSchema.parse({
    iri: predicate,
    is: values.map(item => NodeSchema.parse(item))
  });
  query.where.and.push(where);
}

export function updateFocusConcepts(match: Match): string[] {
  if (match.is && match.is.iri) return [match.is.iri];
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

export function removeSubgroup(clause: any, parent: Match | Where, index: number) {
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

export function createNewBoolGroup(clause: any, group: number[]) {
  group.sort((a, b) => a - b);
  const newClause = WhereSchema.parse({});
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
  if (match.or) match.or.push(MatchSchema.parse({ uuid: v4(), is: { descendantsOrSelfOf: true } }));
  else if (match.and) match.and.push(MatchSchema.parse({ uuid: v4(), is: { descendantsOrSelfOf: true } }));
  else {
    const subMatch = cloneDeep(match);
    delete match.is;
    delete match.where;
    delete match.orderBy;
    match.uuid = v4();
    match.or = [subMatch];
    match.or.push(MatchSchema.parse({ uuid: v4(), is: { descendantsOrSelfOf: true } }));
  }
}

export function updateBooleans(clause: Match | Where, from: Bool, to: Bool) {
  if (from === to) return;
  if (from === Bool.and) {
    clause.or = (clause as Where).and;
    (clause as Where).and = [];
  } else if (from === Bool.or) {
    clause.and = clause.or;
    clause.or = [];
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

export function getMatchFromNodeRef(match: Match, nodeRef: string): Match | undefined {
  if (!match) return undefined;
  if (match.node === nodeRef) return match;
  if (match.any) {
    for (const any of match.any) {
      const testMatch = getMatchFromNodeRef(any, nodeRef);
      if (testMatch) return testMatch;
    }
  }
  return undefined;
}

export function getBoolGroup(clauseType: string, clause: Match | Where | undefined): any[] | undefined {
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

export function addWhereToThen(match: Match, where: Where) {
  if (match.then && !match.then.where) {
    match.then.where = where;
    return;
  }
  if (match.then && match.then.where) {
    if (!match.then.where.and && !match.then.where.or) {
      const currentWhere = match.then.where;
      match.then.where = {} as Where;
      match.then.where.and = [currentWhere];
      match.then.where.and.push(where);
    } else if (match.then.where.and) {
      match.then.where.and.push(where);
    } else if (match.then.where.or) {
      match.then.where.or.push(where);
    }
  } else {
    if (match.then) match.then.where = where;
    else {
      match.then = MatchSchema.parse({ where: where });
    }
  }
}
export async function getSemanticMapOptions(match: Match): Promise<any[]> {
  const maps = await QueryService.getSemanticMaps(match);
  const options = [];
  for (const map of maps) {
    options.push({
      label: map.name,
      value: map.iri
    });
  }
  return options;
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

export function getPathNameFromPropertyRef(match: Match, nodeRef: string, propertyRef: string) {
  const returnMatch = getMatchFromNodeRef(match, nodeRef);
  if (!returnMatch) return undefined;
  if (returnMatch.return) {
    for (const ret of returnMatch.return) {
      if ((ret.as = propertyRef)) {
        if (ret.nodeRef) {
          const pathName = getPathName(returnMatch, ret.nodeRef);
          if (pathName) return pathName;
        }
      }
    }
  }
}
export function getPathNameFromMatch(match: Match, nodeRef: string): string | undefined {
  const pathName = getPathName(match, nodeRef);
  if (pathName) return pathName;
  if (match.any) {
    for (const any of match.any) {
      if (any.node === nodeRef) return any.node + "->";
    }
  }
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

export function addMatchToParent(parent: Match, match: Match, defaultOperator?: Bool) {
  const matches = parent.rule || parent.and || parent.or || parent.any;
  if (matches) matches.push(match);
  else if (parent.is) {
    parent.and = [];
    const isMatch = { uuid: v4(), is: parent.is } as Match;
    parent.and.push(isMatch);
    parent.and.push(match);
    delete parent.is;
  } else {
    const bool = defaultOperator ? defaultOperator : Bool.and;
    parent[bool] = [];
    parent[bool].push(match);
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
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOf = false;
      break;
    case "<":
    case "descendantsOf":
      constrainer.descendantsOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOf = false;
      break;
    case "^":
    case "memberOf":
      constrainer.memberOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.ancestorsOf = false;
      break;
    case ">>":
    case "ancestorsOrSelfOf":
      constrainer.ancestorsOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      break;
    default:
      constrainer.ancestorsOf = false;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
  }
}

export function addBindingsToIMQuery(searchBindings: SearchBinding[], imQuery: QueryRequest) {
  if (imQuery.query && !isArrayHasLength(imQuery.query.and)) imQuery.query.and = [];
  for (const searchBinding of searchBindings) {
    const match = MatchSchema.parse({
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
    });
    imQuery.query?.and?.push(match);
  }
}

export async function setMandatoryWheres(match: Match): Promise<void> {
  if (match.typeOf) {
    await setMandatoryWheresFromType(match, match.typeOf.iri!, undefined);
  }
  await setMandatoryWheresFromPath(match, match);
}

export async function setMandatoryWheresFromPath(match: Match, pathable: Match | Path) {
  if (pathable.path) {
    for (const path of pathable.path) {
      if (path.typeOf) {
        await setMandatoryWheresFromType(match, path.typeOf.iri!, path.node);
      }
      if (path.path) await setMandatoryWheresFromPath(match, path);
    }
  }
}

async function setMandatoryWheresFromType(match: Match, typeIri: string, nodeRef?: string) {
  const nodeShape = await DataModelService.getDataModelProperties(typeIri, false);
  if (!nodeShape) return;
  if (nodeShape.definingProperty) {
    const definingProperty = nodeShape.definingProperty.iri;
    for (const propertyShape of nodeShape.property!) {
      if (propertyShape.path.iri === definingProperty) {
        if (!hasProperty(match.where, propertyShape.path.iri)) {
          const where = createWhere(propertyShape.path.iri, propertyShape.clazz, nodeRef);
          addWhereToMatch(match, where);
        }
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

export function getTypeIriFromMatch(match: Match, baseType: Node, nodeRef?: string): string {
  if (nodeRef) {
    const typeOf = getTypeIriFromNodeRef(match, nodeRef);
    if (typeOf) return typeOf;
    else return baseType.iri!;
  }
  if (match.typeOf) return match.typeOf.iri!;
  else return baseType.iri!;
}

export function getTypeIriFromNodeRef(pathable: Match | Path, nodeRef: string): string | undefined {
  if (pathable.path) {
    for (const path of pathable.path) {
      if (path.node === nodeRef) return path.typeOf!.iri!;
      const typeIri = getTypeIriFromNodeRef(path, nodeRef);
      if (typeIri) return typeIri;
    }
  }
}

export function injectReturn(match: Match, iri: string, ref: string) {
  if (!match.return) match.return = [];
  for (const ret of match.return) {
    if (ret.iri === iri) return;
  }
  match.return.push({ iri: iri, as: ref } as Return);
}

export function addFilter(match: Match, node: TreeNode, isThen: boolean, optional: boolean): string | undefined {
  let nodeRef;
  if (node.type === "property") {
    const fullPath = node.data.path;
    if (fullPath) {
      nodeRef = setPathGetNodeRef(match, fullPath, optional);
    }
    if (node.data.rangeType != SHACL.NODESHAPE) {
      const where = createWhere(node.data.iri, node.data.rangeType, nodeRef);
      if (!isThen) addWhereToMatch(match, where);
      else addWhereToThen(match, where);
    }
  }

  match.invalid = false;
  return nodeRef;
}

export function addWhereToWhen(when: When, match: Match, node: TreeNode): string | undefined {
  let nodeRef;
  if (node.type === "property") {
    const fullPath = node.data.path;
    if (fullPath) {
      nodeRef = setPathGetNodeRef(match, fullPath, true);
    }
    if (node.data.rangeType != SHACL.NODESHAPE) {
      const where = createWhere(node.data.iri, node.data.rangeType, nodeRef);
      if (when.and) when.and.push(where);
      else if (when.or) when.or.push(where);
      else if (when.iri) {
        const iri = when.iri;
        const is = when.is;
        delete when.iri;
        delete when.is;
        const copyWhere = { iri: iri, is: is } as Where;
        when.and = [copyWhere];
        when.and.push(where);
      }
    }
  }
  return nodeRef;
}

function createWhere(iri: string, is: PropertyRange | undefined, nodeRef?: string): Where {
  const where = { iri: iri, invalid: true } as Where;
  if (nodeRef) where.nodeRef = nodeRef;
  if (is) where.is = [NodeSchema.parse({ descendantsOrSelfOf: true })];
  return where;
}

export function setPathGetNodeRef(pathable: Match | Path, fullPath: string, optional?: boolean): string | undefined {
  if (!fullPath) return undefined;
  let i;
  const paths = fullPath.split("\t");
  for (i = 0; i < paths.length; i = i + 2) {
    if (pathable.path) {
      const path = findPath(pathable.path, paths[i]);
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

export function getRelativeToOptions(valueType: string, keepAs: Record<string, Ref<Match>>): any[] {
  const options = [];
  if (valueType === IM.DATE) {
    options.push({
      label: "Search date",
      value: "$searchDate",
      tooltip: "relative to the search date"
    });
    options.push({
      label: "Achievement date",
      value: "$achievementDate",
      tooltip: "relative to the achievement date"
    });
  }
  if (Object.keys(keepAs).length > 0) {
    for (const node of Object.keys(keepAs)) {
      options.push({
        label: node as string,
        value: node as string,
        tooltip: "relative to a property of the entries found in this  clause"
      });
    }
  }
  return options;
}

export async function getRelativePropertyOptions(match: Match, valueType?: string): Promise<any[]> {
  const options: any[] | PromiseLike<any[]> = [];
  if (!valueType) return options;
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
