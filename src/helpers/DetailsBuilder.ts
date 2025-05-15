import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM, RDFS, SHACL } from "@/vocabulary";
import { TTIriRef } from "@/interfaces/AutoGen";
import { TTBundle } from "@/interfaces/ExtendedAutoGen";

export function buildDetails(definition: TTBundle): any[] {
  const treeNode = { children: [] as any[] };
  buildTreeDataRecursively(treeNode, definition.entity, definition.predicates);
  return treeNode.children;
}

function buildTreeDataRecursively(treeNode: any, entity: any, predicates: any) {
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

function processEntityKey(key: string, treeNode: any, entity: any, predicates: any) {
  if (key === IM.ROLE_GROUP) addRoleGroup(treeNode, entity, predicates, key);
  else if (key === IM.HAS_TERM_CODE) addTermCodes(treeNode, entity, predicates, key);
  else if (key === SHACL.PROPERTY) addProperty(treeNode, entity, predicates, key);
  else if (key === SHACL.PARAMETER) addParameter(treeNode, entity, predicates, key);
  else if (key === IM.BINDING) addBinding(treeNode, entity, predicates, key);
  else if (key === IM.DEFINITION) addDefinition(treeNode, predicates, key);
  else if (key === IM.HAS_MAP) addHasMapNode(treeNode, entity, predicates, key);
  else if (key !== "@id") {
    const newTreeNode = { key: key, label: predicates[key] ?? key, children: [] };
    treeNode.children?.push(newTreeNode);
    buildTreeDataRecursively(newTreeNode, entity[key], predicates);
  }
}

function addValueToLabel(treeNode: any, divider: string, value: any) {
  treeNode.label += divider + value;
}

function addIriLink(treeNode: any, item: TTIriRef) {
  if (item["@id"] === IM.LOAD_MORE)
    treeNode.children?.push({
      key: item["@id"],
      label: item.name,
      type: "loadMore",
      data: { predicate: treeNode.key, totalCount: (item as any).totalCount }
    });
  else treeNode.children?.push({ key: item["@id"], label: item.name, type: "link" });
}

function addDefinition(treeNode: any, predicates: any, key: string) {
  const definitionNode = { key: key, label: predicates[key] || key };
  treeNode.children.push(definitionNode);
}

function getLabel(key: string, predicates: any, entity: any) {
  return predicates[key] ?? entity[key]?.path?.[0]?.name ?? key;
}

function addParameter(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as any[]
  };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const parameter of entity[key]) {
      const parameterNode = {
        key: createKeyFromText(parameter[RDFS.LABEL]),
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
    if (isArrayHasLength(entity[key])) addArray(treeNode, entity, predicates, key);
    else if (isObjectHasKeys(entity[key])) addObject(treeNode, entity, predicates, key);
    else addValueToLabel(treeNode, " - ", entity[key]);
  }
}

function addArray(treeNode: any, entity: any, predicates: any, key: string) {
  for (const [index, item] of [entity[key]].entries()) {
    if (isObjectHasKeys(item[index], ["@id", "name"])) addIriLink(treeNode, item[index]);
    else addDefault(treeNode, item, predicates);
  }
}

function addObject(treeNode: any, entity: any, predicates: any, key: string) {
  for (const objectKey of Object.keys(entity[key])) {
    const objectNode = {
      key: createKeyFromText(predicates[objectKey] ?? objectKey),
      label: predicates[objectKey] ?? objectKey,
      children: [] as any
    };

    treeNode.children.push(objectNode);
    addDefault(objectNode, entity[key], predicates);
  }
}

function addTermCodes(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as any[]
  };
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
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as any[]
  };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const roleGroup of entity[key]) {
      const propertyNode = {
        key: IM.GROUP_NUMBER + roleGroup[IM.GROUP_NUMBER],
        label: "role group " + roleGroup[IM.GROUP_NUMBER],
        children: [] as any[]
      };
      newTreeNode.children?.push(propertyNode);

      for (const roleKey of Object.keys(roleGroup)) {
        if (roleKey !== IM.GROUP_NUMBER) propertyNode.children?.push(getRoleValue(predicates, roleGroup, roleKey, key));
      }
    }
  }
}

function getRoleValue(predicates: any, roleGroup: any, roleKey: any, key: string) {
  const valueNode = {
    key: key + "." + roleKey,
    iri: roleKey,
    label: predicates[roleKey],
    type: "property",
    data: roleGroup[roleKey],
    children: [] as any[]
  };
  if (roleGroup[roleKey].length == 1) {
    valueNode.data = roleGroup[roleKey][0];
  } else {
    for (const valueChild of roleGroup[roleKey]) {
      addIriLink(valueNode, valueChild);
    }
  }
  return valueNode;
}

function addBinding(treeNode: any, entity: any, predicates: any, key: any) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as any[]
  };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const roleGroup of entity[key]) {
      const bindingNode = {
        key: roleGroup[SHACL.NODE][0]["@id"],
        label: roleGroup[SHACL.NODE][0].name,
        type: "link"
      };
      newTreeNode.children?.push(bindingNode);
    }
  }
}

function addProperty(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = {
    key: key,
    label: getLabel(key, predicates, entity),
    children: [] as any[]
  };
  treeNode.children?.push(newTreeNode);
}

function setChildNodeArrayCheck(children: any, key: string, predicates: any, grandchildNode: any) {
  if (isArrayHasLength(children[key])) {
    const arrayNode = { key: children[IM.MAP_ADVICE] + key, label: predicates[key], children: [] as any[] };
    grandchildNode.children.push(arrayNode);
    for (const child of children[key]) {
      addIriLink(arrayNode, child);
    }
  } else {
    const nonArrayNode = {
      key: children[IM.MAP_ADVICE] + key,
      label: predicates[key] + " - " + children[key]
    };
    grandchildNode.children.push(nonArrayNode);
  }
}

function addHasMapNode(treeNode: any, entity: any, predicates: any, key: string) {
  const newTreeNode = { key: key, label: predicates[key], children: [] as any[] };
  treeNode.children?.push(newTreeNode);
  if (isArrayHasLength(entity[key])) {
    for (const child of entity[key]) {
      for (const childKey in child) {
        const childNode = {
          key: childKey,
          label: getLabel(childKey, predicates, entity),
          children: [] as any[]
        };
        newTreeNode.children.push(childNode);
        for (const grandchild of child[childKey]) {
          const grandchildNode = {
            key: grandchild[IM.MAP_ADVICE],
            label: grandchild[IM.MAP_ADVICE],
            children: [] as any[]
          };
          childNode.children.push(grandchildNode);
          for (const values in grandchild) {
            setChildNodeArrayCheck(grandchild, values, predicates, grandchildNode);
          }
        }
      }
    }
  }
}

function createKeyFromText(text: string) {
  return new TextEncoder().encode(text).join("");
}
