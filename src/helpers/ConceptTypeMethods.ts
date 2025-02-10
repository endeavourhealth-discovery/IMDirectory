// Categories
// Set, Query Set, Value Set
// Class, Record Type
// Everything else

import { TTIriRef } from "../interfaces/AutoGen";
import { IM, OWL, RDF, RDFS,SHACL } from "../vocabulary";

export function isOfTypes(conceptTypeElements: TTIriRef[], ...types: string[]): boolean {
  if (!conceptTypeElements || !conceptTypeElements.length) {
    return false;
  }
  let found = false;
  let index = 0;
  while (!found && index < types.length) {
    if (conceptTypeElements.some((e: any) => e.iri === types[index] || e[IM.IRI] === types[index])) {
      found = true;
    }
    index++;
  }
  return found;
}

export function isValueSet(conceptTypes: TTIriRef[]): boolean {
  return isOfTypes(conceptTypes, IM.SET, IM.QUERY_SET, IM.VALUE_SET, IM.CONCEPT_SET, IM.CONCEPT_SET_GROUP);
}

export function isTask(conceptTypes: TTIriRef[]): boolean {
  return isOfTypes(conceptTypes, IM.TASK) || isOfTypes(conceptTypes, IM.MAPPING_TASK) || isOfTypes(conceptTypes, IM.UPDATE_TASK);
}

export function isProperty(conceptTypes: TTIriRef[]): boolean {
  return isOfTypes(conceptTypes, RDF.PROPERTY, SHACL.PROPERTY, IM.DATA_PROPERTY, IM.TARGET_PROPERTY, IM.FUNCTION_PROPERTY, OWL.ANNOTATION_PROPERTY);
}

export function isConcept(conceptTypes: TTIriRef[]): boolean {
  return isOfTypes(conceptTypes, IM.CONCEPT);
}

export function isQuery(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, IM.QUERY, IM.COHORT_QUERY);
}

export function isRecordModel(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, SHACL.NODESHAPE);
}

export function isFolder(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, IM.FOLDER);
}

export function isFeature(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, IM.FEATURE);
}

export function isDataSet(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, IM.DATASET_QUERY);
}

export function isFunction(entityTypes: TTIriRef[]): boolean {
  return isOfTypes(entityTypes, SHACL.FUNCTION);
}

export function getNamesAsStringFromTypes(typeList: TTIriRef[]) {
  return typeList
    .map(type => {
      if (type["@id"] === SHACL.NODESHAPE) {
        return "Data model";
      } else return type.name;
    })
    .join(", ");
}

export default {
  isOfTypes,
  isProperty,
  isValueSet,
  isConcept,
  isFolder,
  isQuery,
  isRecordModel,
  isFeature,
  isDataSet,
  isFunction,
  getNamesAsStringFromTypes
};
