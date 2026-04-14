import { ComponentType } from "../enums";
import type { Argument, GenericObject, PropertyShape, QueryRequest, TTIriRef } from "vue-library/interfaces";
import { enumToArray, isArrayHasLength, isObjectHasKeys, TypeGuards } from "vue-library/helpers";
import { IM, RDF, RDFS, SHACL } from "vue-library/enums";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>): Argument[] {
  const result: Argument[] = [];
  property.argument?.forEach(arg => {
    const argResult = {} as Argument;
    for (const [key, value] of Object.entries(arg)) {
      processArgument(property, key, value, argResult, valueVariableMap);
    }
    result.push(argResult);
  });
  return result;
}

export function updateRangeQuery(rangeQuery: QueryRequest, rangeType: string) {
  if (rangeQuery.query && rangeQuery.query.where && rangeQuery.query.where.and) {
    const andClauses = rangeQuery.query.where.and;
    const typeClause = andClauses.find(clause => clause.iri === RDF.TYPE);
    if (typeClause) {
      if (rangeType === "concept") typeClause.is = [{ iri: IM.CONCEPT }, { iri: IM.CONCEPT_SET }, { iri: IM.VALUE_SET }];
      else if (rangeType === "datatype") {
        typeClause.is = [{ iri: RDFS.DATATYPE }];
      } else if (rangeType === "shape") {
        typeClause.is = [{ iri: SHACL.NODESHAPE }];
      }
    }
  }
}

export const propertyRangeTypes = [
  {
    label: "concept",
    value: "concept",
    tooltip: "The range is a concept or set"
  },
  {
    label: "datatype",
    value: "datatype",
    tooltip: "The range is a simple or complex data type"
  },
  {
    label: "shape",
    value: "shape",
    tooltip: "The range is a data model shape "
  }
];

function processArgument(property: PropertyShape, key: string, value: any, argResult: any, valueVariableMap?: Map<string, any>) {
  if (key === "valueVariable") {
    let foundValueVariable: any = null;
    if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
    if (property.builderChild && valueVariableMap && valueVariableMap.has(value + property.order)) {
      foundValueVariable = valueVariableMap.get(value + property.order);
    } else if (valueVariableMap && valueVariableMap.has(value)) {
      foundValueVariable = valueVariableMap.get(value);
    }
    if (isArrayHasLength(foundValueVariable) && foundValueVariable.every((item: unknown) => TypeGuards.isTTIriRef(item)))
      argResult["valueIriList"] = foundValueVariable;
    else if (isArrayHasLength(foundValueVariable) && foundValueVariable.every((item: unknown) => typeof item === "string"))
      argResult["valueDataList"] = foundValueVariable;
    else if (TypeGuards.isTTIriRef(foundValueVariable)) argResult["valueIri"] = foundValueVariable;
    else if (isObjectHasKeys(foundValueVariable)) argResult["valueObject"] = foundValueVariable;
    else if (typeof foundValueVariable === "string") argResult["valueVariable"] = foundValueVariable;
    else argResult[key] = foundValueVariable;
  } else {
    (argResult as GenericObject)[key] = value;
  }
}

export function getTreeQueryIri(select: TTIriRef[]) {
  if (!isArrayHasLength(select) || select.length < 2) {
    return undefined;
  }
  return select[1].iri;
}

function getNameFromIri(iri: string) {
  if (!iri) throw new Error("Missing iri");
  if (iri.includes("#")) {
    const splits = iri.split("#");
    return splits[1] || splits[0];
  }
  return iri;
}

function extractComponentFromIri(type: TTIriRef) {
  const name = getNameFromIri(type.iri);
  if (name.includes("_")) return name.split("_")[1];
  else throw new Error("Iri is not of type ComponentType: " + type.iri);
}

export function processComponentType(type: TTIriRef | undefined) {
  if (!type) throw new Error("Invalid component type: undefined");
  const typeName = extractComponentFromIri(type);
  const componentList = enumToArray(ComponentType);
  const found = componentList.find(c => c.toLowerCase() === typeName.toLowerCase());
  if (found) return found;
  else throw new Error("Invalid component type encountered while processing component types: " + type.iri);
}

export default { processArguments, processComponentType, getTreeQueryIri };
