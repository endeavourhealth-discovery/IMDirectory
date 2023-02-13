import { TTBundle, TTGraphData, TTIriRef } from "../interfaces";
import { SHACL, OWL, IM, RDFS } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function translateFromEntityBundle(bundle: TTBundle, includedPredicates: string[]): TTGraphData {
  const { entity, predicates } = bundle;
  const firstNode = {
    name: entity[RDFS.LABEL],
    iri: entity["@id"],
    relToParent: "",
    children: [],
    _children: []
  } as TTGraphData;
  const keys = Object.keys(entity).filter(key => key != "@id" && includedPredicates.includes(key));
  addNodes(entity, keys, firstNode, predicates);
  return firstNode;
}

function getPropertyIri(nested: any): string {
  if (isObjectHasKeys(nested, [SHACL.CLASS])) {
    return nested[SHACL.CLASS][0]["@id"];
  }
  if (isObjectHasKeys(nested, [SHACL.NODE])) {
    return nested[SHACL.NODE][0]["@id"];
  }
  if (isObjectHasKeys(nested, [OWL.CLASS])) {
    return nested[OWL.CLASS][0]["@id"];
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

  if (isObjectHasKeys(nested, [SHACL.NODE])) {
    return nested[SHACL.NODE][0].name || getNameFromIri(nested[SHACL.NODE][0]["@id"]);
  }

  if (isObjectHasKeys(nested, [OWL.CLASS])) {
    return nested[OWL.CLASS][0].name || getNameFromIri(nested[OWL.CLASS][0]["@id"]);
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
  let preNode = {
    name: "middle-node-" + key,
    iri: "",
    relToParent: "mapped to",
    children: [],
    _children: []
  } as TTGraphData;
  entity[key].forEach((nested: any) => {
    Object.keys(nested).forEach(predicate => {
      nested[predicate].forEach((element: any) => {
        if (isObjectHasKeys(element, [IM.MAPPED_TO])) {
          element[IM.MAPPED_TO].forEach((mappedTo: any) => {
            preNode.children.push({
              name: mappedTo.name,
              iri: mappedTo["@id"],
              relToParent: mappedTo.name,
              children: [],
              _children: []
            });
          });
        }
      });
    });
  });
  if (preNode.children.length > 1) {
    if (!firstNode.children.some((c: any) => c.relToParent === preNode.relToParent)) {
      firstNode.children.push(preNode);
    }
  } else {
    preNode.children[0].relToParent = "mapped to";
    if (!firstNode.children.some((c: any) => c.relToParent === preNode.children[0].relToParent)) {
      firstNode.children.push(preNode.children[0]);
    }
  }
}

function addProperties(firstNode: TTGraphData, entity: any, key: string) {
  if (isObjectHasKeys(entity[key][0], [SHACL.GROUP])) {
    entity[key].forEach((nested: any) => {
      const groupRef: TTIriRef = nested[SHACL.GROUP][0];
      let groupNode = firstNode.children.find(child => child.iri === groupRef["@id"]);
      if (!groupNode) {
        groupNode = {
          name: groupRef.name,
          iri: groupRef["@id"],
          relToParent: "property group",
          children: [],
          _children: []
        } as TTGraphData;
        firstNode.children.push(groupNode);
      }
      addChild(groupNode, getPropertyName(nested), getPropertyIri(nested), nested[SHACL.PATH][0].name);
    });
  } else {
    entity[key].forEach((nested: any) => {
      addChild(firstNode, getPropertyName(nested), getPropertyIri(nested), nested[SHACL.PATH][0].name);
    });
  }
}

function addRoles(firstNode: TTGraphData, entity: any, key: string, predicates: any) {
  entity[key].forEach((nested: any) => {
    const groupID = nested["http://endhealth.info/im#groupNumber"];
    let preNode = {
      name: "middle-node-" + groupID,
      iri: "",
      relToParent: "Group Number " + groupID,
      children: [],
      _children: []
    };
    Object.keys(nested).forEach(predicate => {
      if (predicate !== "http://endhealth.info/im#groupNumber" && isArrayHasLength(nested[predicate])) {
        nested[predicate].forEach((role: any) => {
          addChild(preNode, role.name, role["@id"], predicates[predicate] || predicate);
        });
      }
    });
    if (!firstNode.children.some((c: any) => c.relToParent === "Group Number " + groupID)) {
      firstNode.children.push(preNode);
    }
  });
}

function addArray(firstNode: TTGraphData, entity: any, key: string, predicates: any) {
  let preNode = {
    name: "middle-node-" + key,
    iri: "",
    relToParent: predicates[key],
    children: [],
    _children: []
  } as TTGraphData;
  entity[key].forEach((nested: any) => {
    if (entity[key].length > 1) {
      if (isObjectHasKeys(nested)) {
        addChild(
          preNode,
          nested[RDFS.LABEL] || nested.name || getNameFromIri(nested["@id"]),
          nested["@id"],
          nested[RDFS.LABEL] || nested.name || getNameFromIri(nested["@id"])
        );
      } else {
        addChild(preNode, nested, "", nested);
      }
    } else {
      if (isObjectHasKeys(nested)) {
        addChild(firstNode, nested[RDFS.LABEL] || nested.name || getNameFromIri(nested["@id"]), nested["@id"], predicates[key]);
      } else {
        addChild(firstNode, nested, "", nested);
      }
    }
  });
  if (entity[key].length > 1 && !firstNode.children.some((c: any) => c.relToParent === preNode.relToParent)) {
    firstNode.children.push(preNode);
  }
}

function addChild(parent: any, name: string, iri: string, relToParent: string) {
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
        addChild(firstNode, entity[key].name || entity[key], entity[key]["@id"], predicates[key] || getNameFromIri(key));
      }
    });
  }
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
