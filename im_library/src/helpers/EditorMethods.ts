import { ComponentType } from "../enums";
import { Argument, PropertyShape, TTIriRef } from "../interfaces/AutoGen";
import { IM } from "../vocabulary";
import { isArrayHasLength } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>): Argument[] {
  const result: Argument[] = [];
  property.argument?.forEach(arg => {
    const argResult: any = {};
    for (const [key, value] of Object.entries(arg)) {
      if (key === "valueVariable") {
        let foundValueVariable: any = null;
        if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
        if (property.builderChild && valueVariableMap && valueVariableMap.has(value + property.order)) {
          foundValueVariable = valueVariableMap.get(value + property.order);
        } else if (valueVariableMap && valueVariableMap.has(value)) {
          foundValueVariable = valueVariableMap.get(value);
        }
        argResult[key] = foundValueVariable;
      } else {
        argResult[key] = value;
      }
    }
    result.push(argResult);
  });
  return result;
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
  const componentList = Object.values(ComponentType).filter(item => isNaN(Number(item)));
  const found = componentList.find(c => c.toLowerCase() === typeName.toLowerCase());
  if (found) return found;
  else throw new Error("Invalid component type encountered while processing component types: " + type["@id"]);
}

export default { processArguments, processComponentType, getTreeQueryIri };
