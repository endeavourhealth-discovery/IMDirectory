import { TTBundle, TTIriRef } from "../interfaces";
import { PropertyShape } from "../interfaces/AutoGen";
import { isObjectHasKeys } from "./DataTypeCheckers";

export function isTTIriRef(data: any): data is TTIriRef {
  if (data && (data as TTIriRef)["@id"] && (data as TTIriRef).name && Object.keys(data).length === 2) return true;
  return false;
}

export function isTTBundle(data: any): data is TTBundle {
  if (data && (data as TTBundle).entity && (data as TTBundle).predicates) return true;
  return false;
}

export function isPropertyShape(data: any): data is PropertyShape {
  if (data && (data as PropertyShape).path) return true;
  return false;
}

export function isAliasIriRef(data: any): data is { iri: string; name?: string } {
  if (data && isObjectHasKeys(data as { iri: string; name?: string }, ["iri"])) return true;
  else return false;
}

export function isBoolGroup(data: any): data is { conjunction: string; items: any[]; type: string; ecl?: string } {
  if (data && (data as { conjunction: string; items: any[]; type: string; ecl?: string }).type === "BoolGroup") return true;
  else return false;
}

export default {
  isTTIriRef,
  isTTBundle,
  isPropertyShape,
  isAliasIriRef,
  isBoolGroup
};
