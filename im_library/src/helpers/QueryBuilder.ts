import { IM, SHACL } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match, Property } from "../interfaces/AutoGen";
import { isFolder, isProperty, isRecordModel } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";
import { cloneDeep } from "lodash";

export function buildMatchesFromProperties(treeNodeProperties: TreeNode[]): { direct: Match[]; nested: Match[] } {
  const directMatches: Match[] = [];
  const nestedMatches: Match[] = [];

  const nestedProperties = treeNodeProperties.filter(prop => isNestedProperty(prop));
  const directProperties = treeNodeProperties.filter(prop => !isNestedProperty(prop));

  if (isArrayHasLength(directProperties)) {
    const match: Match = { property: [] };
    for (const directProperty of directProperties) {
      match.property!.push(buildPropertyFromTreeNode(directProperty));
    }
    directMatches.push(match);
  }

  if (isArrayHasLength(nestedProperties)) {
    const pathToMatchMap: Map<string, Match> = new Map<string, Match>();

    for (const nestedProperty of nestedProperties) {
      const path = getParentPath(nestedProperty);
      if (!pathToMatchMap.has(path)) pathToMatchMap.set(path, { property: [] } as Match);
      const leafMatch = pathToMatchMap.get(path);
      leafMatch!.property!.push(buildPropertyFromTreeNode(nestedProperty));
    }

    for (const [path, match] of pathToMatchMap.entries()) {
      nestedMatches.push(buildParentMatchStructure(path, match));
    }
  }

  return { direct: directMatches, nested: nestedMatches };
}

export function buildParentMatchStructure(path: string, match: Match) {
  const parents = path.split("/");
  const leafMatchPath = parents.splice(0, 1);
  parents.splice(parents.length - 1, 1);

  match["@type"] = IM.NAMESPACE + leafMatchPath.join();
  let currentMatchOrProperty: any = cloneDeep(match);
  for (const [index, parentPath] of parents.reverse().entries()) {
    if ((index + 1) % 2 === 0) {
      const parentMatch = { "@type": IM.NAMESPACE + parentPath, property: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else {
      const parentProperty = { "@id": IM.NAMESPACE + parentPath, match: cloneDeep(currentMatchOrProperty) };
      currentMatchOrProperty = parentProperty;
    }
  }
  return { property: [currentMatchOrProperty] };
}

function buildPropertyFromTreeNode(treeNode: TreeNode) {
  const property = { "@id": treeNode.data } as Property;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = "=";
    property.value = "";
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
