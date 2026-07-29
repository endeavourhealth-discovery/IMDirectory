import { IM, RDFS, SHACL } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf, isObject, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import {
  type TTArray,
  type TTBundle,
  type TTEntity,
  type TTIriRef,
  TTLiteral,
  isTTArray,
  isTTEntity,
  isTTIriRef,
  isTTLiteral
} from "@endeavour/vue-library/models";

import { isArray, isBoolean, isNumber, isString } from "lodash-es";
import { TreeNode } from "primevue/treenode";

export function buildDetails(definition: TTBundle): TreeNode[] {
  const treeNode = { children: [] as TreeNode[] } as TreeNode;
  buildTreeDataRecursively(treeNode, definition.entity, definition.predicates);
  return isArray(treeNode.children) ? treeNode.children : [];
}

function buildTreeDataRecursively(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }) {
  if (isArrayHasLength(entity)) {
    for (const item of entity) {
      addIriLink(treeNode, item);
    }
  } else if (isObjectHasKeys(entity)) {
    for (const key of Object.keys(entity)) {
      processEntityKey(key, treeNode, entity, predicates);
    }
  } else {
    addValueToLabel(treeNode, ": ", entity);
  }
}

function processEntityKey(key: string, treeNode: TreeNode, entity: TTEntity, predicates: { [x: string]: string }) {
  if (key === IM.ROLE_GROUP) addRoleGroup(treeNode, entity, predicates, key);
  else if (key === IM.HAS_TERM_CODE) addTermCodes(treeNode, entity, predicates, key);
  else if (key === SHACL.PROPERTY) addProperty(treeNode, entity, predicates, key);
  else if (key === SHACL.PARAMETER) addParameter(treeNode, entity, predicates, key);
  else if (key === IM.BINDING) addBinding(treeNode, entity, predicates, key);
  else if (key === IM.DEFINITION) addDefinition(treeNode, predicates, key);
  else if (key === IM.HAS_MAP) addHasMapNode(treeNode, entity, predicates, key);
  else if (key === IM.HAS_DATASET) addDefinition(treeNode, predicates, key);
  else if (key === IM.MAP_ENTRY) addMapEntryNode(treeNode, entity, predicates, key);
  else if (key !== "iri") {
    const newTreeNode = { key: key, label: predicates[key] ?? key, children: [] } as TreeNode;
    treeNode.children?.push(newTreeNode);
    buildTreeDataRecursively(newTreeNode, entity[key], predicates);
  }
}

function addValueToLabel(treeNode: TreeNode, divider: string, value: unknown) {
  if (isString(value) || isNumber(value) || isBoolean(value)) treeNode.label += divider + value.toString();
  else throw new Error("Unsupported type: " + typeof value);
}

function addIriLink(treeNode: TreeNode, item: unknown) {
  if (isObjectHasKeys(item, ["iri"]) && isString(item.iri)) {
    treeNode.leaf = false;
    if (item.iri === IM.LOAD_MORE)
      treeNode.children?.push({
        key: item.iri,
        label: item.name,
        type: "loadMore",
        data: { predicate: treeNode.key, totalCount: item.totalCount }
      } as TreeNode);
    else treeNode.children?.push({ key: item.iri, label: item.name, leaf: false, type: "link" } as TreeNode);
  }
}

function addDefinition(treeNode: TreeNode, predicates: { [x: string]: string }, key: string) {
  const definitionNode = { key: key, label: predicates[key] || key };
  treeNode.children?.push(definitionNode);
}

function getLabel(key: string, predicates: { [x: string]: string }, entity: TTEntity) {
  if (predicates[key]) return predicates[key];
  else if (isObjectHasKeys(entity[key], ["path"]) && isArrayHasLength(entity[key].path) && isObjectHasKeys(entity[key].path[0], ["name"]))
    return predicates[key] ?? entity[key]?.path?.[0]?.name ?? key;
}

function addParameter(treeNode: TreeNode, entity: TTEntity, predicates: { [z: string]: string }, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as TreeNode[]
  } as TreeNode;
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const parameter of entity[key]) {
      if (isObjectHasKeys(parameter, [RDFS.LABEL]) && isString(parameter[RDFS.LABEL])) {
        const parameterNode = {
          key: createKeyFromText(parameter[RDFS.LABEL]),
          label: parameter[RDFS.LABEL],
          children: [] as TreeNode[]
        } as TreeNode;
        newTreeNode.children?.push(parameterNode);
        buildTreeDataRecursively(parameterNode, parameter, predicates);
      }
    }
  }
}

function addDefault(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }) {
  if (isObject(entity)) {
    for (const key of Object.keys(entity)) {
      if (isArrayHasLength(entity[key])) addArray(treeNode, entity[key], predicates);
      else if (isObjectHasKeys(entity[key])) addObject(treeNode, entity[key], predicates);
      else {
        addValueToLabel(treeNode, " - ", entity[key]);
      }
    }
  }
}

function addArray(treeNode: TreeNode, entity: unknown[], predicates: { [x: string]: string }) {
  for (const item of entity) {
    if (isObjectHasKeys(item, ["iri", "name"])) addIriLink(treeNode, item);
    else addDefault(treeNode, item, predicates);
  }
}

function addObject(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }) {
  if (isObjectHasKeys(entity)) {
    for (const objectKey of Object.keys(entity)) {
      const objectNode = {
        key: createKeyFromText(predicates[objectKey] ?? objectKey),
        label: predicates[objectKey] ?? objectKey,
        children: [] as TreeNode[]
      } as TreeNode;

      treeNode.children?.push(objectNode);
      addDefault(objectNode, entity, predicates);
    }
  }
}

function addTermCodes(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }, key: string) {
  if (isObject(entity)) {
    const newTreeNode = {
      key: key,
      label: getLabel(key, predicates, entity),
      children: [] as TreeNode[]
    } as TreeNode;
    treeNode.children?.push(newTreeNode);
    if (isArrayHasLength(entity[key])) {
      for (const termCode of entity[key]) {
        if (isObjectHasKeys(termCode, [IM.CODE, RDFS.LABEL]) && isString(termCode[IM.CODE]) && isString(termCode[RDFS.LABEL])) {
          const termCodeNode = {
            key: termCode[IM.CODE],
            label: termCode[RDFS.LABEL] + " - " + termCode[IM.CODE],
            children: [] as TreeNode[]
          } as TreeNode;
          newTreeNode.children?.push(termCodeNode);
        }
      }
    }
  }
}

function addRoleGroup(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }, key: string) {
  if (isObject(entity)) {
    const newTreeNode = {
      key: key,
      label: getLabel(key, predicates, entity),
      children: [] as TreeNode[]
    } as TreeNode;
    treeNode.children?.push(newTreeNode);
    if (isArrayHasLength(entity[key])) {
      for (const roleGroup of entity[key]) {
        if (isObjectHasKeys(roleGroup, [IM.GROUP_NUMBER]) && (isString(roleGroup[IM.GROUP_NUMBER]) || isNumber(roleGroup[IM.GROUP_NUMBER]))) {
          const propertyNode = {
            key: IM.GROUP_NUMBER + roleGroup[IM.GROUP_NUMBER],
            label: "role group " + roleGroup[IM.GROUP_NUMBER],
            children: [] as TreeNode[]
          } as TreeNode;
          newTreeNode.children?.push(propertyNode);

          for (const roleKey of Object.keys(roleGroup)) {
            if (roleKey !== IM.GROUP_NUMBER) propertyNode.children?.push(getRoleValue(predicates, roleGroup, roleKey, key));
          }
        }
      }
    }
  }
}

function addMapEntryNode(treeNode: TreeNode, entity: unknown, predicates: { [x: string]: string }, key: string) {
  if (isObject(entity)) {
    const newTreeNode = {
      key: key,
      label: getLabel(key, predicates, entity) + " see maps tab",
      leaf: true
    } as TreeNode;
    treeNode.children?.push(newTreeNode);
  }
}

function getRoleValue(predicates: { [x: string]: string }, roleGroup: TTEntity, roleKey: string, key: string) {
  const valueNode = {
    key: key + "." + roleKey,
    iri: roleKey,
    label: predicates[roleKey],
    type: "property",
    data: roleGroup[roleKey],
    children: [] as TreeNode[]
  } as TreeNode;
  if (isArray(roleGroup[roleKey]) && roleGroup[roleKey].length == 1) {
    valueNode.data = roleGroup[roleKey][0];
  } else if (isArray(roleGroup[roleKey])) {
    for (const valueChild of roleGroup[roleKey]) {
      addIriLink(valueNode, valueChild);
    }
  }
  return valueNode;
}

function addBinding(treeNode: TreeNode, entity: TTEntity, predicates: { [x: string]: string }, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as TreeNode[]
  } as TreeNode;
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const roleGroup of entity[key]) {
      if (isObjectHasKeys(roleGroup, [SHACL.NODE]) && isArrayHasLength(roleGroup[SHACL.NODE]) && isObjectHasKeys(roleGroup[SHACL.NODE][0])) {
        const bindingNode = {
          key: roleGroup[SHACL.NODE][0].iri,
          label: roleGroup[SHACL.NODE][0].name,
          type: "link"
        } as TreeNode;
        newTreeNode.children?.push(bindingNode);
      }
    }
  }
}

function addProperty(treeNode: TreeNode, entity: TTEntity, predicates: { [x: string]: string }, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as TreeNode[]
  } as TreeNode;
  treeNode.children?.push(newTreeNode);
}

function setChildNodeArrayCheck(children: TTEntity, key: string, predicates: { [x: string]: string }, grandchildNode: TreeNode) {
  if (isArrayHasLength(children[key])) {
    const arrayNode = { key: children[IM.MAP_ADVICE] + key, label: predicates[key], children: [] as TreeNode[] } as TreeNode;
    grandchildNode.children?.push(arrayNode);
    for (const child of children[key]) {
      addIriLink(arrayNode, child);
    }
  } else {
    const nonArrayNode = {
      key: children[IM.MAP_ADVICE] + key,
      label: predicates[key] + " - " + children[key]
    } as TreeNode;
    grandchildNode.children?.push(nonArrayNode);
  }
}

function addHasMapNode(treeNode: TreeNode, entity: TTEntity, predicates: { [x: string]: string }, key: string) {
  const newTreeNode = { key: key, label: predicates[key], children: [] as TreeNode[] };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const child of entity[key]) {
      if (isObjectHasKeys(child)) {
        for (const childKey in child) {
          const childNode = {
            key: childKey,
            label: getLabel(childKey, predicates, entity),
            children: [] as TreeNode[]
          } as TreeNode;
          newTreeNode.children.push(childNode);
          if (isArray(child[childKey]))
            for (const grandchild of child[childKey]) {
              const grandchildNode = {
                key: grandchild[IM.MAP_ADVICE],
                label: grandchild[IM.MAP_ADVICE],
                children: [] as TreeNode[]
              } as TreeNode;
              childNode.children?.push(grandchildNode);
              for (const values in grandchild) {
                setChildNodeArrayCheck(grandchild, values, predicates, grandchildNode);
              }
            }
        }
      }
    }
  }
}

function createKeyFromText(text: string) {
  return new TextEncoder().encode(text).join("");
}
