import { IM, NAMESPACE, OWL, RDFS, SHACL } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf, isObject, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import {
  type GenericObject,
  type TTBundle,
  type TTEntity,
  TTGraphDataSchema,
  type TTIriRef,
  isTTArray,
  isTTEntity,
  isTTIriRef,
  isTTProperty
} from "@endeavour/vue-library/models";

import { isArray, isString } from "lodash-es";

import { TTGraphData, TTProperty } from "../interfaces";

export function translateFromEntityBundle(bundle: TTBundle, includedPredicates: string[]): TTGraphData {
  const { entity, predicates } = bundle;
  const firstNode = TTGraphDataSchema.parse({
    name: entity[RDFS.LABEL],
    iri: entity.iri,
    relToParent: "",
    children: [],
    _children: []
  });
  const keys = Object.keys(entity).filter(key => key != "iri" && includedPredicates.includes(key));
  addNodes(entity, keys, firstNode, predicates);
  return firstNode;
}

function getPropertyIri(nested: TTProperty): string {
  if (isArrayHasLength(nested[SHACL.CLASS])) {
    return nested[SHACL.CLASS][0].iri;
  }
  if (isArrayHasLength(nested[SHACL.NODE])) {
    return nested[SHACL.NODE][0].iri;
  }
  if (isObjectHasKeys(nested, [SHACL.DATATYPE])) {
    return nested[SHACL.DATATYPE]![0].iri;
  }

  return "undefined";
}

function getPropertyName(nested: TTProperty): string {
  if (isArrayHasLength(nested[SHACL.CLASS])) {
    return nested[SHACL.CLASS][0].name ?? getNameFromIri(nested[SHACL.CLASS][0].iri);
  }

  if (isArrayHasLength(nested[SHACL.NODE])) {
    return nested[SHACL.NODE][0].name ?? getNameFromIri(nested[SHACL.NODE][0].iri);
  }

  if (isArrayHasLength(nested[SHACL.DATATYPE])) {
    return nested[SHACL.DATATYPE][0].name ?? getNameFromIri(nested[SHACL.DATATYPE][0].iri);
  }

  return "undefined";
}

function getNameFromIri(iri: string): string {
  if (!iri) return iri;
  if (iri.startsWith(NAMESPACE.XSD) || iri.startsWith(NAMESPACE.SNOMED)) return iri.split("#")[1];
  if (iri.startsWith(NAMESPACE.IM + "im:")) return iri.substring(NAMESPACE.IM.length + "im:".length);
  if (iri.startsWith(NAMESPACE.IM)) return iri.substring(NAMESPACE.IM.length);
  if (iri.startsWith(NAMESPACE.RDFS)) return iri.substring(NAMESPACE.RDFS.length);
  return "undefined";
}

function addMaps(firstNode: TTGraphData, entity: TTEntity, key: string) {
  const preNode = TTGraphDataSchema.parse({
    name: "middle-node-" + key,
    iri: "",
    relToParent: "mapped to",
    children: [],
    _children: []
  });
  if (isArray(entity[key])) {
    entity[key].forEach((nested: unknown) => {
      if (isObject(nested)) {
        Object.keys(nested).forEach(predicate => {
          if (isArray(nested[predicate])) {
            nested[predicate].forEach((element: unknown) => {
              addMap(element, preNode);
            });
          }
        });
      }
    });
  }
  if (preNode.children.length < 1) {
    if (!firstNode.children.some((c: TTGraphData) => c.relToParent === preNode.relToParent)) {
      firstNode.children.push(preNode);
    }
  } else {
    preNode.children[0].relToParent = "mapped to";
    if (!firstNode.children.some((c: TTGraphData) => c.relToParent === preNode.children[0].relToParent)) {
      firstNode.children.push(preNode.children[0]);
    }
  }
}

function addMap(element: unknown, preNode: TTGraphData) {
  if (isObjectHasKeys(element, [IM.MAPPED_TO]) && isArray(element[IM.MAPPED_TO])) {
    element[IM.MAPPED_TO].forEach((mappedTo: unknown) => {
      if (isObjectHasKeys(mappedTo, ["iri", "name"]) && typeof mappedTo.iri === "string" && typeof mappedTo.name === "string") {
        preNode.children.push(
          TTGraphDataSchema.parse({
            name: mappedTo.name,
            iri: mappedTo.iri,
            relToParent: mappedTo.name,
            children: [],
            _children: []
          })
        );
      }
    });
  }
}

function addProperties(firstNode: TTGraphData, entity: TTEntity, key: string) {
  if (isArrayHasLength(entity[key])) {
    if (isObjectHasKeys(entity[key][0], [SHACL.GROUP])) {
      entity[key].forEach((nested: unknown) => {
        if (isTTProperty(nested) && isArrayHasLength(nested[SHACL.GROUP])) {
          const groupRef = nested[SHACL.GROUP][0];
          let groupNode = firstNode.children.find(child => child.iri === groupRef.iri);
          if (!groupNode) {
            groupNode = {
              name: groupRef.name,
              iri: groupRef.iri,
              relToParent: "property group",
              children: [],
              _children: []
            } as TTGraphData;
            firstNode.children.push(groupNode);
          }
          addChild(groupNode, getPropertyName(nested), getPropertyIri(nested), nested[SHACL.PATH][0].name ?? "");
        }
      });
    } else {
      entity[key].forEach((nested: unknown) => {
        if (isTTProperty(nested)) {
          addChild(firstNode, getPropertyName(nested), getPropertyIri(nested), nested[SHACL.PATH][0].name ?? "");
        }
      });
    }
  }
}

function addRoles(firstNode: TTGraphData, entity: TTEntity, key: string, predicates: { [x: string]: string }) {
  if (isArray(entity[key])) {
    entity[key].forEach((nested: unknown) => {
      if (isObject(nested)) {
        const groupID = nested[IM.GROUP_NUMBER];
        const preNode = {
          name: "middle-node-" + groupID,
          iri: "",
          relToParent: "Group Number " + groupID,
          children: [],
          _children: []
        };
        Object.keys(nested).forEach(predicate => {
          if (predicate !== IM.GROUP_NUMBER && isArrayHasLength(nested[predicate])) {
            nested[predicate].forEach((role: unknown) => {
              const relToParent = isObjectHasKeys(predicates, [predicate]) && typeof predicates[predicate] === "string" ? predicates[predicate] : predicate;
              if (isObjectHasKeys(role, ["name", "iri"]) && typeof role.name === "string" && typeof role.iri === "string") {
                addChild(preNode, role.name, role.iri, relToParent);
              }
            });
          }
        });
        if (!firstNode.children.some((c: TTGraphData) => c.relToParent === "Group Number " + groupID)) {
          firstNode.children.push(preNode);
        }
      }
    });
  }
}

function getNameFromEntityItems(item: TTEntity): string {
  let name = "";
  if (isObjectHasKeys(item, [RDFS.LABEL]) && typeof item[RDFS.LABEL] === "string") {
    name = item[RDFS.LABEL];
  } else if (isObjectHasKeys(item, ["name"]) && typeof item.name === "string") {
    name = item.name;
  } else if (isObjectHasKeys(item, ["iri"]) && typeof item.iri == "string") name = getNameFromIri(item.iri);

  return name;
}

function addArray(firstNode: TTGraphData, entity: TTEntity, key: string, predicates: { [x: string]: string }) {
  const preNode = TTGraphDataSchema.parse({
    name: "middle-node-" + key,
    iri: "http://endhealth.info/im#testIri",
    relToParent: predicates[key],
    children: [],
    _children: []
  });
  if (isArray(entity[key])) {
    entity[key].forEach((nested: unknown) => {
      if (isArray(entity[key]) && entity[key].length > 1) {
        if (isObjectHasKeys(nested)) {
          const name = getNameFromEntityItems(nested);
          const iri = isString(nested.iri) ? nested.iri : "";
          addChild(preNode, name, iri, name);
        } else if (typeof nested === "string") {
          addChild(preNode, nested, "", nested);
        }
      } else if (isObjectHasKeys(nested, ["iri"]) && typeof nested.iri === "string" && typeof predicates[key] === "string") {
        const name = getNameFromEntityItems(nested);
        addChild(firstNode, name, nested.iri, predicates[key]);
      } else if (typeof nested === "string") {
        addChild(firstNode, nested, "", nested);
      }
    });
    if (entity[key].length > 1 && !firstNode.children.some((c: any) => c.relToParent === preNode.relToParent)) {
      firstNode.children.push(preNode);
    }
  }
}

function addChild(parent: TTGraphData, name: string, iri: string, relToParent: string) {
  if (!parent.children.some((c: any) => c.relToParent === relToParent)) {
    parent.children.push({
      name: name,
      iri: iri,
      relToParent: relToParent,
      children: [],
      _children: []
    });
  }
}

function addNodes(entity: TTEntity, keys: string[], firstNode: TTGraphData, predicates: { [x: string]: string }): void {
  keys.forEach(key => {
    if (isTTArray(entity[key])) {
      switch (key) {
        case IM.HAS_MAP:
          addMaps(firstNode, entity, key);
          break;
        case SHACL.PROPERTY:
          addProperties(firstNode, entity, key);
          break;
        case IM.ROLE_GROUP:
          addRoles(firstNode, entity, key, predicates);
          break;
        default:
          addArray(firstNode, entity, key, predicates);
          break;
      }
    } else {
      if (isTTIriRef(entity[key])) {
        if (typeof entity[key].name === "string") addChild(firstNode, entity[key].name, entity[key].iri, predicates[key] ?? getNameFromIri(key));
        else addChild(firstNode, entity[key].iri, entity[key].iri, predicates[key]);
      } else if (isObjectHasKeys(entity[key], [RDFS.LABEL]) && isString(entity[key][RDFS.LABEL])) {
        addChild(firstNode, entity[key][RDFS.LABEL], "", predicates[key] ?? getNameFromIri(key));
      } else if (isString(entity[key])) {
        addChild(firstNode, entity[key], "", predicates[key] ?? getNameFromIri(key));
      }
    }
  });
}

export function hasNodeChildrenByName(data: TTGraphData, name: string): boolean {
  const nodes = [] as TTGraphData[];
  findNodeByName(data, name, nodes);

  return isArrayHasLength(nodes) && (isArrayHasLength(nodes[0].children) || isArrayHasLength(nodes[0]._children));
}

function findNodeByName(data: TTGraphData, name: string, nodes: TTGraphData[]): void {
  if (data.name === name) {
    nodes.push(data);
  } else if (isArrayHasLength(data.children)) {
    data.children.forEach(child => {
      findNodeByName(child, name, nodes);
    });
  }
}

export function toggleNodeByName(data: TTGraphData, name: string): void {
  if (data.name === name) {
    if (isArrayHasLength(data.children)) {
      data._children = data.children;
      data.children = [];
    } else {
      data.children = data._children;
      data._children = [];
    }
  } else if (isArrayHasLength(data.children)) {
    data.children.forEach(child => {
      toggleNodeByName(child, name);
    });
  }
}

export default {
  translateFromEntityBundle,
  hasNodeChildrenByName,
  findNodeByName,
  toggleNodeByName,
  addNodes
};
