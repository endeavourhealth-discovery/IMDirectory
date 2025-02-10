import { DefinitionConfig } from "../interfaces";
import { bundleToText } from "./Transforms";
import { isArrayHasLength, isObject, isObjectHasKeys } from "./DataTypeCheckers";

export function copyConceptToClipboard(concept: any, configs?: DefinitionConfig[], defaults?: any, blockedUrlIris?: string[]): string {
  const totalKeys = Object.keys(concept).length;
  let counter = 0;
  let returnString = "";
  let key: string;
  let value: any;
  for ([key, value] of Object.entries(concept)) {
    const copyString = conceptObjectToCopyString(key, value, counter, totalKeys, configs, defaults, blockedUrlIris);
    if (copyString) returnString += copyString.value;
    counter++;
  }
  if (returnString.endsWith(",\n")) {
    return returnString.slice(0, -2);
  }
  return returnString;
}

function getReturnString(value: string, counterEqTotalKeysMO: boolean) {
  return counterEqTotalKeysMO ? value : value + ",\n";
}

function handleIsArrayHasLength(newString: string, value: any, key: string, newKey: string) {
  if (value.every((item: any) => isObjectHasKeys(item, ["name"]))) {
    newString = value.map((item: any) => item.name).join(",\n\t");
  } else if (value.every((item: any) => isObjectHasKeys(item, ["property"])) && value.every((item: any) => isObjectHasKeys(item.property, ["name"]))) {
    newString = value.map((item: any) => item.property.name).join(",\n\t");
  } else if (value.every((item: any) => typeof item === "string")) {
    newString = value.join(",\n\t");
  } else {
    console.warn(undefined, "Uncovered object property or missing name found for key: " + key + " at conceptObjectToCopyString within helpers");
  }
  return newString ? newKey + ": [\n\t" + newString + "\n]" : "";
}

function isArrayWithoutLengthAndIsObjectWithoutKeys(value: any) {
  return (Array.isArray(value) && !value.length) || (isObject(value) && !isObjectHasKeys(value));
}

export function conceptObjectToCopyString(
  key: string,
  value: any,
  counter: number,
  totalKeys: number,
  configs?: DefinitionConfig[],
  defaults?: any,
  blockedUrlIris?: string[]
): { label: string; value: string } | undefined {
  if (isArrayWithoutLengthAndIsObjectWithoutKeys(value)) {
    return;
  }
  let newString = "";
  let returnString = "";
  let newKey = key;
  const counterEqTotalKeysMO = counter === totalKeys - 1;

  if (configs && isArrayHasLength(configs)) {
    const label = configs.find((config: DefinitionConfig) => config.predicate === key);
    if (label) {
      newKey = label.label;
    }
  }

  if (isArrayHasLength(value)) {
    returnString = handleIsArrayHasLength(newString, value, key, newKey);
  } else if (isObjectHasKeys(value, ["name"])) {
    returnString = newKey + ": " + value.name;
  } else if (isObjectHasKeys(value, ["entity", "predicates"])) {
    returnString = newKey + ': "\n' + bundleToText("", value, defaults, 1, false, "", blockedUrlIris) + '\n"';
  } else if (isObjectHasKeys(value, ["children", "totalCount"]) && Array.isArray(value.children)) {
    returnString = handleIsArrayHasLength(newString, value.children, key, newKey);
  } else if (typeof value === "string") {
    newString = value.replace(/\n/g, "\n\t").replace(/<p>/g, "\n\t");
    returnString = newKey + ": " + newString;
  } else if (typeof value === "number") {
    returnString = newKey + ": " + value.toString();
  } else {
    console.log(`CopyConceptToClipboard encountered unexpected object type. Object ${JSON.stringify(value)} converted to json string`);
    returnString = newKey + ": " + JSON.stringify(value);
  }

  returnString = getReturnString(returnString, counterEqTotalKeysMO);

  return { label: newKey, value: returnString };
}

export default {
  copyConceptToClipboard,
  conceptObjectToCopyString
};
