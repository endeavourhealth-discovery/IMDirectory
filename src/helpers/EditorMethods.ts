import { ComponentType } from "../enums";
import { Argument, PropertyShape, TTIriRef } from "../interfaces/AutoGen";
import { enumToArray } from "./Converters";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { isTTIriRef } from "./TypeGuards";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>): Argument[] {
  const result: Argument[] = [];
  property.argument?.forEach(arg => {
    const argResult: any = {};
    for (const [key, value] of Object.entries(arg)) {
      processArgument(property, key, value, argResult, valueVariableMap);
    }
    result.push(argResult);
  });
  return result;
}

function processArgument(property: PropertyShape, key: string, value: any, argResult: any, valueVariableMap?: Map<string, any>) {
  if (key === "valueVariable") {
    let foundValueVariable: any = null;
    if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
    if (property.builderChild && valueVariableMap?.has(value + property.order)) {
      foundValueVariable = valueVariableMap.get(value + property.order);
    } else if (valueVariableMap?.has(value)) {
      foundValueVariable = valueVariableMap.get(value);
    }
    if (isArrayHasLength(foundValueVariable) && foundValueVariable.every((item: unknown) => isTTIriRef(item))) argResult["valueIriList"] = foundValueVariable;
    else if (isArrayHasLength(foundValueVariable) && foundValueVariable.every((item: unknown) => typeof item === "string"))
      argResult["valueDataList"] = foundValueVariable;
    else if (isTTIriRef(foundValueVariable)) argResult["valueIri"] = foundValueVariable;
    else if (isObjectHasKeys(foundValueVariable)) argResult["valueObject"] = foundValueVariable;
    else if (typeof foundValueVariable === "string") argResult["valueVariable"] = foundValueVariable;
    else argResult[key] = foundValueVariable;
  } else {
    argResult[key] = value;
  }
}

export function getTreeQueryIri(select: TTIriRef[]) {
  if (!isArrayHasLength(select) || select.length < 2) {
    return undefined;
  }
  return select[1]["@id"];
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
  let name = getNameFromIri(type["@id"]);
  if (name.includes("_")) return name.split("_")[1];
  else throw new Error("Iri is not of type ComponentType: " + type["@id"]);
}

export function processComponentType(type: TTIriRef | undefined): any {
  if (!type) throw new Error("Invalid component type: undefined");
  const typeName = extractComponentFromIri(type);
  const componentList = enumToArray(ComponentType);
  const found = componentList.find(c => c.toLowerCase() === typeName.toLowerCase());
  if (found) return found;
  else throw new Error("Invalid component type encountered while processing component types: " + type["@id"]);
}

export default { processArguments, processComponentType, getTreeQueryIri };
