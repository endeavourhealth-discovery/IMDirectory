import { TTIriRef } from "../interfaces";
import { RDF, RDFS, IM, SHACL } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { isTTIriRef } from "./TypeGuards";

const validTypes = [IM.CONCEPT, IM.CONCEPT_SET, IM.CONCEPT_SET_GROUP, IM.DATAMODEL_ENTITY, SHACL.PROPERTY, IM.FOLDER, IM.QUERY];
const validStatus = [IM.ACTIVE, IM.DRAFT, IM.INACTIVE];

export function hasValidIri(entity: any): boolean {
  if (!isObjectHasKeys(entity, ["@id"])) return false;
  if (!entity["@id"]) return false;
  return true;
}

export function hasValidName(entity: any): boolean {
  if (!isObjectHasKeys(entity, [RDFS.LABEL])) return false;
  if (!entity[RDFS.LABEL]) return false;
  return true;
}

export function hasValidTypes(entity: any): boolean {
  if (!isObjectHasKeys(entity, [RDF.TYPE])) return false;
  if (!isArrayHasLength(entity[RDF.TYPE])) return false;
  if (!entity[RDF.TYPE].every((type: TTIriRef) => isTTIriRef(type))) return false;
  if (!entity[RDF.TYPE].every((type: TTIriRef) => validTypes.includes(type["@id"]))) return false;
  return true;
}

export function hasValidStatus(entity: any): boolean {
  if (!isObjectHasKeys(entity, [IM.HAS_STATUS])) return false;
  if (!isArrayHasLength(entity[IM.HAS_STATUS])) return false;
  if (!entity[IM.HAS_STATUS].every((status: TTIriRef) => isTTIriRef(status))) return false;
  if (!entity[IM.HAS_STATUS].every((status: TTIriRef) => validStatus.includes(status["@id"]))) return false;
  return true;
}

export function hasValidParents(entity: any): boolean {
  if (!isObjectHasKeys(entity, [IM.IS_CONTAINED_IN]) && !isObjectHasKeys(entity, [IM.IS_A]) && !isObjectHasKeys(entity, [RDFS.SUBCLASS_OF])) return false;
  if (isObjectHasKeys(entity, [IM.IS_CONTAINED_IN])) {
    if (!isArrayHasLength(entity[IM.IS_CONTAINED_IN]) || !entity[IM.IS_CONTAINED_IN].every((parent: unknown) => isTTIriRef(parent))) return false;
  }
  if (isObjectHasKeys(entity, [IM.IS_A])) {
    if (!isArrayHasLength(entity[IM.IS_A]) || !entity[IM.IS_A].every((parent: unknown) => isTTIriRef(parent))) return false;
  }
  if (isObjectHasKeys(entity, [RDFS.SUBCLASS_OF])) {
    if (!isArrayHasLength(entity[RDFS.SUBCLASS_OF]) || !entity[RDFS.SUBCLASS_OF].every((parent: unknown) => isTTIriRef(parent))) return false;
  }
  return true;
}

export default {
  hasValidIri,
  hasValidName,
  hasValidParents,
  hasValidStatus,
  hasValidTypes
};
