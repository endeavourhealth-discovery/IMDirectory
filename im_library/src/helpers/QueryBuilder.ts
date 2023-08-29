import { IM, SHACL } from "../vocabulary";
import { ConceptSummary, TreeNode } from "../interfaces";
import { Match, Node, Property } from "../interfaces/AutoGen";
import { isFolder, isProperty, isQuery, isRecordModel, isValueSet } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";
import { cloneDeep } from "lodash";

export function buildMatchesFromProperties(treeNodeProperties: TreeNode[]): { direct: Match[]; nested: Match[] } {
  const directMatches: Match[] = [];
  const nestedMatches: Match[] = [];

  const queryMatches = treeNodeProperties.filter(prop => isQuery(prop.conceptTypes));
  const directProperties = treeNodeProperties.filter(prop => !isNestedProperty(prop) && !isQuery(prop.conceptTypes));
  const nestedProperties = treeNodeProperties.filter(prop => isNestedProperty(prop));

  if (isArrayHasLength(queryMatches)) {
    for (const queryMatchNode of queryMatches) {
      directMatches.push({ "@id": queryMatchNode.data, name: queryMatchNode.label });
    }
  }

  if (isArrayHasLength(directProperties)) {
    const match: Match = { property: [] } as Match;
    for (const directProperty of directProperties) {
      if (isObjectHasKeys(directProperty, ["parent"]) && directProperty.parent.hasVariable) match.nodeRef = directProperty.parent.hasVariable;
      match.property!.push(buildPropertyFromTreeNode(directProperty));
    }
    directMatches.push(match);
  }

  if (isArrayHasLength(nestedProperties)) {
    const pathToMatchMap: Map<string, { matchItem: Match; hasVariable: string }> = new Map<string, { matchItem: Match; hasVariable: string }>();

    for (const nestedProperty of nestedProperties) {
      const path = getParentPath(nestedProperty);
      const hasVariable = getHasVariable(nestedProperty);
      if (!pathToMatchMap.has(path)) pathToMatchMap.set(path, { matchItem: { property: [] } as Match, hasVariable: hasVariable });
      const leafMatch = pathToMatchMap.get(path);
      leafMatch!.matchItem.property!.push(buildPropertyFromTreeNode(nestedProperty));
    }

    for (const [path, match] of pathToMatchMap.entries()) {
      const parentMatchStructure = buildParentMatchStructure(path, match.matchItem);
      if (match.hasVariable) parentMatchStructure.nodeRef = match.hasVariable;
      nestedMatches.push(parentMatchStructure);
    }
  }

  return { direct: directMatches, nested: nestedMatches };
}

export function buildMatchFromCS(cs: ConceptSummary) {
  return { "@id": cs.iri, name: cs.name } as Node;
}

function getHasVariable(treeNode: TreeNode) {
  const hasVariable: string[] = [];
  getHasVariableRecursively(treeNode, hasVariable);
  return hasVariable[0] ?? "";
}

function getHasVariableRecursively(treeNode: TreeNode, hasVariable: string[]) {
  if (treeNode.hasVariable) hasVariable.push(treeNode.hasVariable);
  if (isObjectHasKeys(treeNode, ["parent"])) getHasVariableRecursively(treeNode.parent, hasVariable);
}

export function buildParentMatchStructure(path: string, match: Match) {
  const parents = path.split("/");
  const leafMatchPath = parents.splice(0, 1);
  parents.splice(parents.length - 1, 1);

  match.typeOf = { "@id": IM.NAMESPACE + leafMatchPath.join() };
  let currentMatchOrProperty: any = cloneDeep(match);
  for (const [index, parentPath] of parents.reverse().entries()) {
    if ((index + 1) % 2 === 0) {
      const parentMatch = { typeOf: { "@id": IM.NAMESPACE + parentPath, property: [cloneDeep(currentMatchOrProperty)] } };
      currentMatchOrProperty = parentMatch;
    } else {
      const parentProperty = { "@id": IM.NAMESPACE + parentPath, match: cloneDeep(currentMatchOrProperty) };
      currentMatchOrProperty = parentProperty;
    }
  }
  return { property: [currentMatchOrProperty] } as Match;
}

function buildPropertyFromTreeNode(treeNode: TreeNode) {
  if (treeNode.property) return treeNode.property;
  const property = { "@id": treeNode.data } as Property;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = "=";
    property.value = "";
  } else if (isObjectHasKeys(treeNode.ttproperty, [SHACL.CLASS])) {
    property.inSet = [{ "@id": "http://endhealth.info/im#Example", name: "Example concept" }];
  }
  (property as any).key = treeNode.key;
  return property;
}

export function isNestedProperty(treeNode: TreeNode) {
  const hasParent = isObjectHasKeys(treeNode.parent);
  if (!hasParent) return false;
  const hasGrandParent = isObjectHasKeys(treeNode.parent.parent);
  if (!hasGrandParent) return false;
  const parentIsFolder = isFolder(treeNode.parent.conceptTypes);
  const hasGreatGrandParent = isObjectHasKeys(treeNode.parent.parent.parent, ["conceptTypes"]);
  if (hasGrandParent && parentIsFolder && !hasGreatGrandParent) return false;
  return hasParent && hasGrandParent && !parentIsFolder && hasGreatGrandParent;
}

export function getParentPath(treeNode: TreeNode): string {
  const path: string[] = [];
  gatherParentPathRecursively(treeNode, path);
  return path.join("/") ?? "";
}

export function gatherParentPathRecursively(treeNode: TreeNode, path: string[]) {
  if (isObjectHasKeys(treeNode, ["parent"]) && isObjectHasKeys(treeNode.parent, ["data"])) {
    if (isProperty(treeNode.parent.conceptTypes) || isRecordModel(treeNode.parent.conceptTypes)) {
      if (isNodeRef(treeNode.parent)) path.push(treeNode.parent.label);
      else path.push(getNameFromRef({ "@id": treeNode.parent.data }));
    }
    gatherParentPathRecursively(treeNode.parent, path);
  }
}

export function isNodeRef(treeNode: TreeNode) {
  return treeNode.label.includes("(" + getNameFromRef({ "@id": treeNode.data }) + ")");
}
