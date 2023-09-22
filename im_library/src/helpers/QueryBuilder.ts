import { IM, SHACL } from "../vocabulary";
import { ConceptSummary, TreeNode } from "../interfaces";
import { Match, Node, Property, Query } from "../interfaces/AutoGen";
import { isFolder, isProperty, isQuery, isRecordModel } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";

export function buildMatchesFromProperties(treeNodeProperties: TreeNode[]): { direct: Match[]; nested: Match[] } {
  const directMatches: Match[] = [];
  const nestedMatches: Match[] = [];

  if (isArrayHasLength(treeNodeProperties)) {
    for (const property of treeNodeProperties) {
      const newMatch = buildNestedPropertyMatch(property);
      if (isNestedProperty(property)) nestedMatches.push(newMatch);
      else directMatches.push(newMatch);
    }
  }
  return { direct: directMatches, nested: nestedMatches };
}

export function buildInSetMatchFromCS(cs: ConceptSummary) {
  return { "@id": v4(), inSet: [buildNodeFromCS(cs)] } as Match;
}

export function buildNodeFromCS(cs: ConceptSummary) {
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

export function buildNestedPropertyMatch(treeNode: TreeNode) {
  const flatList: TreeNode[] = [];
  populateFlatListOfNodesRecursively(flatList, treeNode);
  let currentMatchOrProperty = {};
  for (const [index, treeNode] of flatList.entries()) {
    if (!index) {
      const parentProperty: any = buildPropertyFromTreeNode(treeNode);
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    } else if (isRecordModel(treeNode.conceptTypes)) {
      const parentMatch = { typeOf: { "@id": treeNode.data }, property: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else if (isProperty(treeNode.conceptTypes)) {
      const parentProperty: any = { "@id": treeNode.data };
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    }
  }

  const match = { "@id": v4(), property: [currentMatchOrProperty] } as Match;
  const hasVariable = getHasVariable(treeNode);
  if (hasVariable) match.nodeRef = hasVariable;
  return match;
}

function populateFlatListOfNodesRecursively(flatList: TreeNode[], treeNode: TreeNode) {
  const isRoot = treeNode.parent.key === "0";
  if (!isFolder(treeNode.conceptTypes) && !isRoot) flatList.push(treeNode);
  if (treeNode.parent && !isRoot) populateFlatListOfNodesRecursively(flatList, treeNode.parent);
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
    property.is = [{ "@id": "http://endhealth.info/im#Example", name: "Example concept" }];
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

export function generateMatchIds(query: Query) {
  const queryWithMatchIds = { ...query };
  if (isArrayHasLength(queryWithMatchIds.match))
    for (const match of queryWithMatchIds.match!) {
      generateMatchIdsRecursively(match);
    }

  if (isArrayHasLength(queryWithMatchIds.query))
    for (const subQuery of queryWithMatchIds.query!) {
      if (isArrayHasLength(subQuery.match))
        for (const match of subQuery.match!) {
          generateMatchIdsRecursively(match);
        }
    }
  return queryWithMatchIds;
}

export function generateMatchIdsRecursively(match: Match) {
  if (!match["@id"]) match["@id"] = v4();
  if (isArrayHasLength(match.match))
    for (const nestedMatch of match.match!) {
      generateMatchIdsRecursively(nestedMatch);
    }

  if (isArrayHasLength(match.property))
    for (const property of match.property!) {
      if (isObjectHasKeys(property, ["match"])) generateMatchIdsRecursively(property.match!);
    }
}
