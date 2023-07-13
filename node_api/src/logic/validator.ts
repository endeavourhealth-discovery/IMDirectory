import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { IM, RDFS } from "@im-library/vocabulary";

export default class Validator {
  constructor() {}

  public validate(iri: string, data: any): { isValid: boolean; message?: string } {
    if (iri === IM.validation.HAS_PARENT) return this.hasValidParents(data);
    if (iri === IM.validation.IS_DEFINITION) return this.isValidDefinition(data);
    if (iri === IM.validation.IS_IRI) return this.isValidIri(data);
    else throw new Error("Validation function: '" + iri + "' was not found in validator.");
  }

  private hasValidParents(data: any): { isValid: boolean; message?: string } {
    let valid = false;
    let message: string | undefined = "Entity is missing a parent. Add a parent to 'subclassOf' or 'isContainedIn'.";
    if (
      isObjectHasKeys(data, [RDFS.SUBCLASS_OF]) &&
      isArrayHasLength(data[RDFS.SUBCLASS_OF]) &&
      data[RDFS.SUBCLASS_OF].every((item: any) => isTTIriRef(item))
    ) {
      valid = true;
      message = undefined;
    }
    if (
      isObjectHasKeys(data, [IM.IS_CONTAINED_IN]) &&
      isArrayHasLength(data[IM.IS_CONTAINED_IN]) &&
      data[IM.IS_CONTAINED_IN].every((item: any) => isTTIriRef(item))
    ) {
      valid = true;
      message = undefined;
    }
    if (
      isObjectHasKeys(data, [RDFS.SUB_PROPERTY_OF]) &&
      isArrayHasLength(data[RDFS.SUB_PROPERTY_OF]) &&
      data[RDFS.SUB_PROPERTY_OF].every((item: any) => isTTIriRef(item))
    ) {
      valid = true;
      message = undefined;
    }
    if (isObjectHasKeys(data, [IM.IS_CHILD_OF]) && isArrayHasLength(data[IM.IS_CHILD_OF]) && data[IM.IS_CHILD_OF].every((item: any) => isTTIriRef(item))) {
      valid = true;
      message = undefined;
    }
    return { isValid: valid, message: message };
  }

  private isValidDefinition(data: any): { isValid: boolean; message?: string } {
    let valid = false;
    let message: string | undefined = "Definition is invalid.";
    if (isObjectHasKeys(data, [IM.DEFINITION])) {
      valid = true;
      message = undefined;
    }
    return { isValid: valid, message: message };
  }

  private isValidIri(data: any): { isValid: boolean; message?: string } {
    let valid = false;
    let message: string | undefined = "Iri is invalid";
    if (!isObjectHasKeys(data, [IM.ID])) message = "Entity is missing id field";
    else {
      if (typeof data[IM.ID] !== "string") message = "Iri must be of type string";
      else {
        if (/\s/g.test(data[IM.ID])) message = "Iri cannot contain spaces";
        else {
          (valid = true), (message = undefined);
        }
      }
    }
    return { isValid: valid, message: message };
  }
}
