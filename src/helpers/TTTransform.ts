import { IM, SNOMED } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { TTIriRef } from "../interfaces/AutoGen";

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

export function getNameFromIri(iri: string) {
  if (!iri) return "undefined";
  if (iri.includes("#")) {
    const splits = iri.split("#");
    return splits[1] || splits[0];
  }
  if (iri.includes(":")) {
    const splits = iri.split(":");
    return splits[1] || splits[0];
  }
  return iri;
}

export function getNameListFromIriList(iris: TTIriRef[]): string {
  const result: string[] = [];
  for (const iri of iris) result.push(getNameFromIri(iri["@id"]));

  return result.join(", ");
}

export function getNameFromRef(ref: any): string {
  if (isObjectHasKeys(ref, ["name"])) return ref.name;
  else if (isObjectHasKeys(ref, ["@id"])) return getNameFromIri(ref["@id"]);
  else if (isObjectHasKeys(ref, ["typeOf"])) return getNameFromIri(ref["typeOf"]["@id"]);
  else if (isObjectHasKeys(ref, ["parameter"])) return ref["parameter"];
  return "";
}

export function resolveIri(iri: string) {
  if (!iri) return undefined;
  const prefixes: any = { im: IM.NAMESPACE, sn: SNOMED.NAMESPACE };
  if (iri.includes("#") || iri.includes("urn:uuid:")) {
    return iri;
  } else if (iri.includes(":")) {
    const splits = iri.split(":");
    return (prefixes[splits[0]] ?? prefixes.im) + splits[1];
  } else {
    return prefixes.im + iri;
  }
}

export default {
  transformTT,
  getNameFromRef,
  resolveIri,
  getNameFromIri
};
