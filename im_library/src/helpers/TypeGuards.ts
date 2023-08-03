import { BugReport, TTBundle, Workflow } from "../interfaces";
import { PropertyShape, TTIriRef } from "../interfaces/AutoGen";
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

export function isWorkflow(data: any): data is Workflow {
  if (
    data &&
    (data as Workflow).id &&
    (data as Workflow).createdBy &&
    (data as Workflow).assignedTo &&
    (data as Workflow).dateCreated &&
    (data as Workflow).state &&
    (data as Workflow).state
  )
    return true;
  else return false;
}

export function isBugReport(data: any): data is BugReport {
  if (
    data &&
    isWorkflow(data) &&
    (data as BugReport).OS &&
    (data as BugReport).actualResult &&
    (data as BugReport).error &&
    (data as BugReport).expectedResult &&
    (data as BugReport).module &&
    (data as BugReport).product &&
    (data as BugReport).reproduceSteps &&
    (data as BugReport).severity &&
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
