import { TTBundle } from "../interfaces";
import { PropertyShape, TTIriRef, Task, BugReport } from "../interfaces/AutoGen";
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

export function isTask(data: any): data is Task {
  if (data && (data as Task).id && (data as Task).createdBy && (data as Task).dateCreated && (data as Task).state && (data as Task).type) return true;
  else return false;
}

export function isBugReport(data: any): data is BugReport {
  if (
    data &&
    isTask(data) &&
    (data as BugReport).os &&
    (data as BugReport).actualResult &&
    (data as BugReport).expectedResult &&
    (data as BugReport).module &&
    (data as BugReport).product &&
    (data as BugReport).reproduceSteps &&
    (data as BugReport).version
  )
    return true;
  else return false;
}

export default {
  isTTIriRef,
  isTTBundle,
  isPropertyShape,
  isAliasIriRef,
  isBoolGroup
};
