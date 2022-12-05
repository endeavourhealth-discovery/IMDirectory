import { Helpers, Vocabulary } from "im-library/dist/api";
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength },
  TypeGuards: { isTTIriRef }
} = Helpers;
const { IM, RDFS } = Vocabulary;

export default class Validator {
  constructor() {}

  public validate(iri: string, data: any): boolean {
    if (iri === IM.VALIDATION_HAS_PARENT) return this.hasValidParents(data);
    if (iri === IM.VALIDATION_IS_DEFINITION) return this.isValidDefinition(data);
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
