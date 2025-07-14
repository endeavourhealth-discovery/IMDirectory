import { IM, SNOMED } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { TTIriRef } from "../interfaces/AutoGen";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
import { GenericObject } from "@/interfaces/GenericObject";
import {Namespace} from "@/vocabulary/Namespace";

export function transformTT(ttEntity: TTEntity, map?: GenericObject) {
  if (!isObjectHasKeys(ttEntity)) return {} as TTEntity;
  ttEntity = transformIris(ttEntity);
  transformObjectRecursively(ttEntity, map);
  return ttEntity;
}

function transformObjectRecursively(ttEntity: TTEntity, map?: GenericObject) {
  for (const key of Object.keys(ttEntity)) {
    if (key.startsWith("http")) {
      const property = isObjectHasKeys(map, [key]) ? map?.[key] : getNameFromIri(key);
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

function transformIris(ttEntity: TTEntity) {
  const regex = /iri/gm;
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
  for (const iri of iris) result.push(getNameFromIri(iri.iri));

  return result.join(", ");
}

export function getNameFromRef(ref: GenericObject): string {
  if (ref.name && isObjectHasKeys(ref, ["name"])) return ref.name;
  else if (ref.iri && isObjectHasKeys(ref, ["iri"])) return getNameFromIri(ref.iri);
  else if (isObjectHasKeys(ref, ["typeOf"])) return getNameFromIri(ref["typeOf"].iri);
  else if (isObjectHasKeys(ref, ["parameter"])) return ref["parameter"];
  return "";
}

export function resolveIri(iri: string) {
  if (!iri) return undefined;
  const prefixes: GenericObject = { im: Namespace.IM, sn: Namespace.SNOMED };
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
