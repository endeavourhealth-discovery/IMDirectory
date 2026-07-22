import { NAMESPACE } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { GenericObject, GenericObjectSchema, Node, TTEntity, TTEntitySchema, TTIriRef, isTTEntity, isTTIriRef } from "@endeavour/vue-library/models";

import { isString } from "lodash-es";

export function transformTT(ttEntity: TTEntity, map?: GenericObject) {
  if (!isObjectHasKeys(ttEntity)) return TTEntitySchema.parse({});
  ttEntity = transformIris(ttEntity);
  transformObjectRecursively(ttEntity, map);
  return ttEntity;
}

function transformObjectRecursively(ttEntity: TTEntity, map?: GenericObject) {
  for (const key of Object.keys(ttEntity)) {
    if (key.startsWith("http")) {
      const property = isObjectHasKeys(map, [key]) ? map?.[key] : getNameFromIri(key);
      if (typeof property === "string") {
        ttEntity[property] = ttEntity[key];
        delete ttEntity[key];

        if (isArrayOf(ttEntity[property], isTTEntity)) {
          for (const nestedEntity of ttEntity[property]) {
            transformObjectRecursively(nestedEntity, map);
          }
        } else if (isTTEntity(ttEntity[property])) {
          transformObjectRecursively(ttEntity[property], map);
        }
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

export function getNameFromRef(ref: Node): string {
  if (isString(ref.name)) return ref.name;
  else if (isString(ref.iri)) return getNameFromIri(ref.iri);
  // else if (isTTIriRef(ref.typeOf) && isTTIriRef(ref["typeOf"])) return getNameFromIri(ref["typeOf"].iri);
  else if (isString(ref.parameter)) return ref.parameter;
  return "";
}

export function resolveIri(iri: string) {
  if (!iri) return undefined;
  const prefixes = GenericObjectSchema.parse({ im: NAMESPACE.IM, sn: NAMESPACE.SNOMED });
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
