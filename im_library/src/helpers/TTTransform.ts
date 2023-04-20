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

export function getNameFromRef(ref: any) {
  if (isObjectHasKeys(ref, ["name"])) {
    return ref.name;
  } else if (isObjectHasKeys(ref, ["@id"])) {
    const splits = ref["@id"].split("#");
    return splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["@set"])) {
    const splits = ref["@set"].split("#");
    return splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["@type"])) {
    const splits = ref["@type"].split("#");
    return splits[1] || splits[0];
  } else if (isObjectHasKeys(ref, ["parameter"])) {
    return ref["parameter"];
  }
  return "";
}

export function resolveIri(iri: string) {
  const prefixes: any = { im: "http://endhealth.info/im#", sn: "http://snomed.info/sct#" };
  if (iri.includes("#")) {
    return iri;
  } else if (iri.includes(":")) {
    const splits = iri.split(":");
    return prefixes[splits[0]] + splits[1];
  } else {
    return prefixes.im + iri;
  }
}

export default {
  transformTT,
  getNameFromRef,
  resolveIri
};
