import { PartialBundle } from "@/models/entityServiceTypes/EntityServiceTypes";
import TTGraphData from "@/models/TTGraphData";
import { IM } from "@/vocabulary/IM";
import { RDF } from "@/vocabulary/RDF";
import { RDFS } from "@/vocabulary/RDFS";
import { SHACL } from "@/vocabulary/SHACL";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function translateFromEntityBundle(bundle: PartialBundle, includedPredicates: string[]): TTGraphData {
  const { entity, predicates } = bundle;
  const firstNode = { name: entity[RDFS.LABEL], iri: entity["@id"], relToParent: "", children: [], _children: [] } as TTGraphData;
  const keys = Object.keys(entity).filter(key => key != "@id" && includedPredicates.includes(key));
  addNodes(entity, keys, firstNode, predicates);
  return firstNode;
}

function getPropertyIri(nested: any): string {
  if (isObjectHasKeys(nested, [SHACL.CLASS])) {
    return nested[SHACL.CLASS][0]["@id"];
  }
  if (isObjectHasKeys(nested, [SHACL.DATATYPE])) {
    return nested[SHACL.DATATYPE][0]["@id"];
  }

  return "undefined";
}

function getPropertyName(nested: any): string {
  if (isObjectHasKeys(nested, [SHACL.CLASS])) {
    return nested[SHACL.CLASS][0].name || getNameFromIri(nested[SHACL.CLASS][0]["@id"]);
  }

  if (isObjectHasKeys(nested, [SHACL.DATATYPE])) {
    return nested[SHACL.DATATYPE][0].name || getNameFromIri(nested[SHACL.DATATYPE][0]["@id"]);
  }

  return "undefined";
}

function getNameFromIri(iri: string): string {
  if (!iri) return iri;
  if (iri.startsWith("http://www.w3.org/2001/XMLSchema#") || iri.startsWith("http://snomed.info/sct#")) return iri.split("#")[1];
  if (iri.startsWith("http://endhealth.info/im#im:")) return iri.substring("http://endhealth.info/im#im:".length);
  if (iri.startsWith("http://endhealth.info/im#")) return iri.substring("http://endhealth.info/im#".length);
  if (iri.startsWith("http://www.w3.org/2000/01/rdf-schema#")) return iri.substring("http://www.w3.org/2000/01/rdf-schema#".length);
  return "undefined";
}

function addMaps(firstNode: TTGraphData, entity: any, key: string) {
  entity[key].forEach((nested: any) => {
    Object.keys(nested).forEach(predicate => {
      nested[predicate].forEach((element: any) => {
        if (isObjectHasKeys(element, [IM.MAPPED_TO])) {
          element[IM.MAPPED_TO].forEach((mappedTo: any) => {
            firstNode.children.push({
              name: mappedTo.name,
              iri: mappedTo["@id"],
              relToParent: "mapped to",
              children: [],
              _children: []
            });
          });
        }
      });
    });
  });
}

function addProperties(firstNode: TTGraphData, entity: any, key: string) {
  entity[key].forEach((nested: any) => {
    firstNode.children.push({
      name: getPropertyName(nested),
      iri: getPropertyIri(nested),
      relToParent: nested[SHACL.PATH][0].name,
      children: [],
      _children: []
    });
  });
}

function addRoles(firstNode: TTGraphData, entity: any, key: string, predicates: any) {
  entity[key].forEach((nested: any) => {
    Object.keys(nested).forEach(predicate => {
      if (predicate !== "http://endhealth.info/im#groupNumber" && isArrayHasLength(nested[predicate])) {
        nested[predicate].forEach((role: any) => {
          firstNode.children.push({
            name: role.name,
            iri: role["@id"],
            relToParent: predicates[predicate] || predicate,
            children: [],
            _children: []
          });
        });
      }
    });
  });
}

function addArray(firstNode: TTGraphData, entity: any, key: string, predicates: any) {
  entity[key].forEach((nested: any) => {
    if (isObjectHasKeys(nested)) {
      firstNode.children.push({
        name: nested[RDFS.LABEL] || nested.name || getNameFromIri(nested["@id"]),
        iri: nested["@id"],
        relToParent: predicates[key],
        children: [],
        _children: []
      });
    } else {
      firstNode.children.push({ name: nested, iri: "", relToParent: getNameFromIri(key), children: [], _children: [] });
    }
  });
}

function addNodes(entity: any, keys: string[], firstNode: TTGraphData, predicates: any): void {
  if (isObjectHasKeys(entity)) {
    keys.forEach(key => {
      if (isArrayHasLength(entity[key])) {
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
        firstNode.children.push({
          name: entity[key].name || entity[key],
          iri: entity[key]["@id"],
          relToParent: predicates[key] || getNameFromIri(key),
          children: [],
          _children: []
        });
      }
    });
  }
}

export function hasNodeChildrenByName(data: TTGraphData, name: string): boolean {
  const nodes = [] as TTGraphData[];
  findNodeByName(data, name, nodes);

  if (isArrayHasLength(nodes) && (isArrayHasLength(nodes[0].children) || isArrayHasLength(nodes[0]._children))) {
    return true;
  }
  return false;
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
