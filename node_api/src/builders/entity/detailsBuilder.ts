import * as crypto from "crypto";
import { TTBundle, TTIriRef } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDFS, SHACL } from "@im-library/vocabulary";

export function buildDetails(definition: TTBundle, types?: TTIriRef[]): any[] {
  const treeNode = { children: [] as any[] };
  buildTreeDataRecursively(treeNode, definition.entity, definition.predicates, types);
  return treeNode.children;
}

function buildTreeDataRecursively(treeNode: any, entity: any, predicates: any, types?: TTIriRef[]) {
  if (isObjectHasKeys(entity)) {
    for (const key of Object.keys(entity)) {
      processEntityKey(key, treeNode, entity, predicates);
    }
  } else if (isArrayHasLength(entity)) {
    for (const item of entity) {
      addIriLink(treeNode, item);
    }
  } else {
    addValueToLabel(treeNode, ": ", entity);
  }
}

function processEntityKey(key: string, treeNode: any, entity: any, predicates: any, types?: TTIriRef[]) {
  if (key === IM.ROLE_GROUP) {
    addRoleGroup(treeNode, entity, predicates, key);
  } else if (key === IM.HAS_TERM_CODE) {
    addTermCodes(treeNode, entity, predicates, key);
  } else if (key === SHACL.PROPERTY) {
    addProperty(treeNode, entity, predicates, key);
  } else if (key === SHACL.PARAMETER) {
    addParameter(treeNode, entity, predicates, key);
  } else if (key === IM.DEFINITION) {
    addDefinition(treeNode, entity, predicates, key, types || []);
  } else if (key === IM.HAS_MAP) {
    const defaultNode = { key: key, label: predicates[key], children: [] };
    treeNode.children.push(defaultNode);
    addDefault(defaultNode, entity, predicates);
  } else if (key !== "@id") {
    const newTreeNode = { key: key, label: predicates[key] || key, children: [] };
    treeNode.children?.push(newTreeNode);
    buildTreeDataRecursively(newTreeNode, entity[key], predicates);
  }
}

function addValueToLabel(treeNode: any, divider: string, value: any) {
  treeNode.label += divider + value;
}

function addIriLink(treeNode: any, item: TTIriRef) {
  if (item["@id"] === IM.NAMESPACE + "loadMore")
    treeNode.children?.push({ key: item["@id"], label: item.name, type: "loadMore", data: { predicate: treeNode.key, totalCount: (item as any).totalCount } });
  else treeNode.children?.push({ key: item["@id"], label: item.name, type: "link" });
}

function addDefinition(treeNode: any, entity: any, predicates: any, key: string, types: TTIriRef[]) {
  const definitionNode = { key: key, label: predicates[key] || key };
  treeNode.children.push(definitionNode);
}

function addParameter(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = { key: key, label: predicates[key] || entity[key]?.path?.[0]?.name || key, children: [] as any[] };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const parameter of entity[key]) {
      const parameterNode = {
        key: String(crypto.randomBytes(64).readBigUInt64BE()),
        label: parameter[RDFS.LABEL],
        children: [] as any[]
      };
      newTreeNode.children.push(parameterNode);
      buildTreeDataRecursively(parameterNode, parameter, predicates);
    }
  }
}

function addDefault(treeNode: any, entity: any, predicates: any) {
  for (const key of Object.keys(entity)) {
    if (isArrayHasLength(entity[key])) {
      for (const [index, item] of [entity[key]].entries()) {
        if (isObjectHasKeys(item[index], ["@id", "name"])) {
          addIriLink(treeNode, item[index]);
        } else {
          addDefault(treeNode, item, predicates);
        }
      }
    } else if (isObjectHasKeys(entity[key])) {
      for (const objectKey of Object.keys(entity[key])) {
        const objectNode = {
          key: String(crypto.randomBytes(64).readBigUInt64BE()),
          label: predicates[objectKey] || objectKey,
          children: [] as any
        };

        treeNode.children.push(objectNode);
        addDefault(objectNode, entity[key], predicates);
      }
    } else {
      addValueToLabel(treeNode, " - ", entity[key]);
    }
  }
}

function addTermCodes(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = { key: key, label: predicates[key] || entity[key]?.path?.[0]?.name || key, children: [] as any[] };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const termCode of entity[key]) {
      const termCodeNode = {
        key: termCode[IM.CODE],
        label: termCode[RDFS.LABEL] + " - " + termCode[IM.CODE],
        children: [] as any[]
      };
      newTreeNode.children.push(termCodeNode);
    }
  }
}

function addRoleGroup(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = { key: key, label: predicates[key] || entity[key]?.path?.[0]?.name || key, children: [] as any[] };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const roleGroup of entity[key]) {
      const propertyNode = {
        key: IM.NAMESPACE + "groupNumber" + roleGroup[IM.NAMESPACE + "groupNumber"],
        label: "role group " + roleGroup[IM.NAMESPACE + "groupNumber"],
        children: [] as any[]
      };
      newTreeNode.children?.push(propertyNode);

      for (const roleKey of Object.keys(roleGroup)) {
        if (roleKey !== IM.NAMESPACE + "groupNumber")
          propertyNode.children?.push({
            key: key + "." + roleKey,
            iri: roleKey,
            label: predicates[roleKey],
            data: roleGroup[roleKey]?.[0],
            type: "property"
          });
      }
    }
  }
}

function addProperty(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = { key: key, label: predicates[key] || entity[key]?.path?.[0]?.name || key, children: [] as any[] };
  treeNode.children?.push(newTreeNode);
}
