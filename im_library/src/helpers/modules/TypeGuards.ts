import { PropertyGroup, PropertyShape, TTBundle, TTIriRef } from "../../interfaces/index.js";

export function isTTIriRef(data: any): data is TTIriRef {
  if (data && (data as TTIriRef)["@id"] && (data as TTIriRef).name && Object.keys(data).length === 2) return true;
  return false;
}

export function isTTBundle(data: any): data is TTBundle {
  if (data && (data as TTBundle).entity && (data as TTBundle).predicates) return true;
  return false;
}

export function isPropertyGroup(data: any): data is PropertyGroup {
  if (data && ((data as PropertyGroup).subGroup || (data as PropertyGroup).property)) return true;
  return false;
}

export function isPropertyShape(data: any): data is PropertyShape {
  if (data && (data as PropertyShape).path) return true;
  return false;
}

export default {
  isTTIriRef,
  isTTBundle,
  isPropertyGroup,
  isPropertyShape
};
