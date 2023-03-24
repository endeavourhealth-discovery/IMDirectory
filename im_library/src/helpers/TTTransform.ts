import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function transformTT(ttEntity: any, map?: any) {
  if (!isObjectHasKeys(ttEntity)) return {};
  ttEntity = transformIris(ttEntity);
  transformObjectRecursively(ttEntity, map);
  return ttEntity;
}

function transformObjectRecursively(ttEntity: any, map?: any) {
  for (const key of Object.keys(ttEntity)) {
    if (key.startsWith("http")) {
      const property = isObjectHasKeys(map, [key]) ? map[key] : getNameFromIri(key);
      ttEntity[property] = ttEntity[key];
      delete ttEntity[key];

      if (isArrayHasLength(ttEntity[property])) {
        for (const nestedEntity of ttEntity[property]) {
          transformObjectRecursively(nestedEntity, map);
        }
      } else if (isObjectHasKeys(ttEntity[property])) {
        transformObjectRecursively(ttEntity[property], map);
      }
    }
  }
}

function transformIris(ttEntity: any) {
  const regex = /@id/gm;
  const stringEntity = JSON.stringify(ttEntity);
  return JSON.parse(stringEntity.replace(regex, "iri"));
}

function getNameFromIri(iri: string) {
  if (!iri) return "undefined";
  if (iri.includes("#")) {
    return iri.split("#")[1];
  }
}

export default {
  transformTT
};
