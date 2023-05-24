import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { IM, RDFS, VALIDATION } from "@im-library/vocabulary";

export default class Validator {
  constructor() {}

  public validate(iri: string, data: any): boolean {
    if (iri === VALIDATION.HAS_PARENT) return this.hasValidParents(data);
    if (iri === VALIDATION.IS_DEFINITION) return this.isValidDefinition(data);
    else throw new Error("Validation function: '" + iri + "' was not found in validator.");
  }

  private hasValidParents(data: any): boolean {
    let valid = false;
    if (isObjectHasKeys(data, [RDFS.SUBCLASS_OF]) && isArrayHasLength(data[RDFS.SUBCLASS_OF]) && data[RDFS.SUBCLASS_OF].every((item: any) => isTTIriRef(item)))
      valid = true;
    if (
      isObjectHasKeys(data, [IM.IS_CONTAINED_IN]) &&
      isArrayHasLength(data[IM.IS_CONTAINED_IN]) &&
      data[IM.IS_CONTAINED_IN].every((item: any) => isTTIriRef(item))
    )
      valid = true;
    if (
      isObjectHasKeys(data, [RDFS.SUB_PROPERTY_OF]) &&
      isArrayHasLength(data[RDFS.SUB_PROPERTY_OF]) &&
      data[RDFS.SUB_PROPERTY_OF].every((item: any) => isTTIriRef(item))
    )
      valid = true;
    if (isObjectHasKeys(data, [IM.IS_CHILD_OF]) && isArrayHasLength(data[IM.IS_CHILD_OF]) && data[IM.IS_CHILD_OF].every((item: any) => isTTIriRef(item)))
      valid = true;
    return valid;
  }

  private isValidDefinition(data: any): boolean {
    let valid = false;
    if (isObjectHasKeys(data, [IM.DEFINITION])) valid = true;
    return valid;
  }
}
