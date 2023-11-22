import { SHACL } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match, Node, Property, Query, SearchResultSummary } from "../interfaces/AutoGen";
import { isFolder, isProperty, isRecordModel } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";

export function buildMatchesFromProperties(treeNodeProperties: TreeNode[]): { direct: Match[]; nested: Match[] } {
  const directMatches: Match[] = [];
  const nestedMatches: Match[] = [];

  if (isArrayHasLength(treeNodeProperties)) {
    const parentHierarchyMap = new Map<string, TreeNode[]>();

    // build properties from tree nodes
    for (const treeNodeProperty of treeNodeProperties) {
      const parentHierarchy = JSON.stringify(treeNodeProperty.parent);
      if (!parentHierarchyMap.has(parentHierarchy)) parentHierarchyMap.set(parentHierarchy, []);
      parentHierarchyMap.get(parentHierarchy)!.push(treeNodeProperty);
    }

    // map properties to matches
    for (const [parentHierarchy, treeNodeProperties] of parentHierarchyMap.entries()) {
      const isNested = isNestedProperty(treeNodeProperties[0]);
      let matchProperties: Property[] = [];
      if (!isNested) matchProperties = treeNodeProperties.map(treeNodeProperty => buildProperty(treeNodeProperty));
      else matchProperties = buildNestedProperties(treeNodeProperties);
      const match = { "@id": v4(), property: matchProperties } as Match;

      const hasVariableTreeNode = treeNodeProperties.find(treeNodeProperty => getHasVariable(treeNodeProperty));
      if (hasVariableTreeNode) {
        match.property = matchProperties[0].property;
        match.nodeRef = getHasVariable(hasVariableTreeNode);
      }

      if (isNested) nestedMatches.push(match);
      else directMatches.push(match);
    }
  }
  return { direct: directMatches, nested: nestedMatches };
}

export function buildNestedProperties(treeNodeProperties: TreeNode[]) {
  const matchProperties: Property[] = [];
  const treeNodePropertiesCopy = [...treeNodeProperties];
  const firstTreeNode = treeNodePropertiesCopy.shift();
  const matchProperty = buildProperty(firstTreeNode!);
  matchProperties.push(matchProperty);
  if (isArrayHasLength(treeNodePropertiesCopy)) {
    const found: Match[] = [];
    getLastMatchFromNestedProperty(matchProperty, found);
    if (isArrayHasLength(found) && isArrayHasLength(found[0].property))
      for (const treeNodeProperty of treeNodePropertiesCopy) {
        delete treeNodeProperty.parent;
        const additionalMatchProperty = buildPropertyFromTreeNode(treeNodeProperty);
        found[0]!.property!.push(additionalMatchProperty);
      }
  }

  return matchProperties;
}

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
  return { "@id": v4(), inSet: [buildNodeFromCS(cs)] } as Match;
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

export function buildProperty(treeNode: TreeNode) {
  const flatList: TreeNode[] = [];
  populateFlatListOfNodesRecursively(flatList, treeNode);
  let currentMatchOrProperty = {};
  for (const [index, treeNode] of flatList.entries()) {
    if (!index) {
      const parentProperty: any = buildPropertyFromTreeNode(treeNode);
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    } else if (isRecordModel(treeNode.conceptTypes)) {
      const parentMatch = { "@id": v4(), typeOf: { "@id": treeNode.data }, property: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else if (isProperty(treeNode.conceptTypes)) {
      const parentProperty: any = { "@id": treeNode.data };
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    }
  }

  return currentMatchOrProperty as Property;
}

function populateFlatListOfNodesRecursively(flatList: TreeNode[], treeNode: TreeNode) {
  const isRoot = treeNode.parent ? treeNode.parent.key === "0" : true;
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
  return property as Property;
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

  if (isArrayHasLength(match.property))
    for (const property of match.property!) {
      if (isObjectHasKeys(property, ["match"])) generateMatchIdsRecursively(property.match!);
    }
}
