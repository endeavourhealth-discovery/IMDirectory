import { SHACL } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match, Node, Operator, Where, Query, SearchResultSummary } from "../interfaces/AutoGen";
import { isFolder, isProperty, isRecordModel } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";

export function getLastMatchFromNestedProperty(matchOrProperty: any, found: Match[]) {
  if (isObjectHasKeys(matchOrProperty, ["match"])) getLastMatchFromNestedProperty(matchOrProperty.match, found);
  else if (isArrayHasLength(matchOrProperty.property)) {
    if (isObjectHasKeys(matchOrProperty.property[0], ["match"])) getLastMatchFromNestedProperty(matchOrProperty.property[0].match, found);
    else {
      found.push(matchOrProperty);
      return;
    }
  }
}

export function buildInSetMatchFromCS(cs: SearchResultSummary) {
  return { "@id": v4(), is: [buildNodeFromCS(cs)] } as Match;
}

export function buildNodeFromCS(cs: SearchResultSummary) {
  return { "@id": cs.iri, name: cs.name } as Node;
}

function getHasVariable(treeNode: TreeNode) {
  const hasVariable: string[] = [];
  getHasVariableRecursively(treeNode, hasVariable);
  return hasVariable[0] ?? "";
}

function getHasVariableRecursively(treeNode: TreeNode, hasVariable: string[]) {
  if (treeNode.hasVariable) hasVariable.push(treeNode.hasVariable);
  if (isObjectHasKeys(treeNode, ["parent"])) getHasVariableRecursively(treeNode.parent!, hasVariable);
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
      const parentMatch = { "@id": v4(), typeOf: { "@id": treeNode.data }, where: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else if (isProperty(treeNode.conceptTypes)) {
      const parentProperty: any = { "@id": treeNode.data };
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
  const property = { "@id": treeNode.data } as Where;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = Operator.eq;
    property.value = "";
  } else if (isObjectHasKeys(treeNode.ttproperty, [SHACL.CLASS])) {
    property.is = [];
  }
  (property as any).key = treeNode.key;
  return property as Where;
}

export function isNestedProperty(treeNode: TreeNode) {
  const parentList: TreeNode[] = [];
  populateFlatListOfNodesRecursively(parentList, treeNode);
  return parentList.length > 1;
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

  if (isObjectHasKeys(match, ["then"]) && isObjectHasKeys(match.then)) generateMatchIdsRecursively(match.then!);

  if (isArrayHasLength(match.where))
    for (const property of match.where!) {
      if (isObjectHasKeys(property, ["match"])) generateMatchIdsRecursively(property.match!);
    }
}
