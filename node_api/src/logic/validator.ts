import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { IM, RDFS, SHACL } from "@im-library/vocabulary";

export default class Validator {
  constructor() {}

  public validate(iri: string, data: any): { isValid: boolean; message?: string } {
    if (iri === IM.validation.HAS_PARENT) return this.hasValidParents(data);
    if (iri === IM.validation.IS_DEFINITION) return this.isValidDefinition(data);
    if (iri === IM.validation.IS_IRI) return this.isValidIri(data);
    if (iri === IM.validation.IS_TERMCODE) return this.isValidTermcodes(data);
    if (iri === IM.validation.IS_SUMMARY) return this.isValidSummary(data);
    if (iri === IM.validation.IS_PROPERTY) return this.isValidProperties(data);
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
    if (!isObjectHasKeys(data, [IM.ID])) message = "Entity is missing 'http://endhealth.info/im#id' key";
    else {
      if (typeof data[IM.ID] !== "string" && data[IM.ID]) message = "Iri must be of type string";
      else {
        if (!/#/g.test(data[IM.ID])) message = "Iri must contain a '#'";
        else {
          const splits = data[IM.ID].split("#");
          if (splits.length !== 2) message = "Iri contains invalid character '#' within identifier.";
          else if (!/^http:\/\/[a-zA-Z]+\.[a-zA-Z]+\/[a-zA-Z]+#$/.test(splits[0] + "#")) message = "Iri url is invalid.";
          else if (encodeURIComponent(splits[1]) !== splits[1]) {
            const invalidCharactersEncoded = encodeURIComponent(splits[1]).match(/%[0-9a-zA-Z]{2}/g);
            if (invalidCharactersEncoded) {
              const invalidCharactersDecoded = invalidCharactersEncoded.map(char => decodeURIComponent(char));
              message = "Iri identifier contains invalid characters: " + JSON.stringify(invalidCharactersDecoded);
            }
          } else {
            valid = true;
            message = undefined;
          }
        }
      }
    }
    return { isValid: valid, message: message };
  }

  private isValidProperties(data: any) {
    let valid = true;
    let message: string | undefined = undefined;
    const props: any[] = data[SHACL.PROPERTY];

    if (!props || props.length == 0) {
      valid = false;
      message = "Data models must have at least 1 property";
    } else {
      for (const prop of props) {
        if (!this.isValidIriOrIriList(prop[SHACL.PATH], 1, 1)) valid = false;

        if (
          !this.isValidIriOrIriList(prop[SHACL.NODE], 1, 1) &&
          !this.isValidIriOrIriList(prop[SHACL.DATATYPE], 1, 1) &&
          !this.isValidIriOrIriList(prop[SHACL.CLASS], 1, 1)
        )
          valid = false;
      }

      if (!valid) message = "One or more invalid properties";
    }

    return { isValid: valid, message: message };
  }

  private isValidIriOrIriList(value: any, minLength = 0, maxLength = 0) {
    if (!value) {
      return minLength == 0;
    }

    if (!value.length) value = [value];

    if (value.length < minLength || value.length > maxLength) {
      return false;
    }

    return value.every((pd: any) => pd?.["@id"]);
  }

  private isValidTermcodes(data: any): { isValid: boolean; message?: string } {
    let valid = false;
    let message: string | undefined = "1 or more term codes are invalid.";
    if (isObjectHasKeys(data, [IM.HAS_TERM_CODE])) {
      if (data[IM.HAS_TERM_CODE].every((tc: any) => this.isValidTermCode(tc))) valid = true;
    }
    return { isValid: valid, message: message };
  }

  private isValidTermCode(data: any): boolean {
    return isObjectHasKeys(data, [IM.CODE, IM.HAS_STATUS, RDFS.LABEL]) && data[IM.CODE] && data[IM.HAS_STATUS] && data[RDFS.LABEL];
  }

  private isValidSummary(data: any): { isValid: boolean; message?: string } {
    let valid = false;
    let message: string | undefined = "One or more fields are invalid.";
    if (isObjectHasKeys(data, [IM.ID, IM.HAS_STATUS, RDFS.LABEL])) {
      if (this.isValidIri(data) && data[RDFS.LABEL] && data[IM.HAS_STATUS]) valid = true;
      else message = this.isValidIri(data).message;
    }
    return { isValid: valid, message: message };
  }
}
