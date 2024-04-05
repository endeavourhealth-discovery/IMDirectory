import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { IM, RDFS, SHACL, VALIDATION, QUERY } from "@im-library/vocabulary";
import axios from "axios";

export default class Validator {
  constructor() {
    // empty constructor
  }

  entityService: EntityService = new EntityService(axios);
  queryService: QueryService = new QueryService(axios);

  public async validate(iri: string, data: any): Promise<{ isValid: boolean; message?: string }> {
    if (iri === VALIDATION.HAS_PARENT) return this.hasValidParents(data);
    if (iri === VALIDATION.IS_DEFINITION) return this.isValidDefinition(data);
    if (iri === VALIDATION.IS_IRI) return this.isValidIri(data);
    if (iri === VALIDATION.IS_TERMCODE) return this.isValidTermcodes(data);
    if (iri === VALIDATION.IS_PROPERTY) return this.isValidProperties(data);
    if (iri === VALIDATION.IS_SCHEME) return await this.isValidScheme(data);
    if (iri === VALIDATION.IS_STATUS) return await this.isValidStatus(data);
    if (iri === VALIDATION.IS_ROLE_GROUP) return this.isValidRoleGroups(data);
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
    if (isObjectHasKeys(data, [IM.IS_SUBSET_OF]) && isArrayHasLength(data[IM.IS_SUBSET_OF]) && data[IM.IS_SUBSET_OF].every((item: any) => isTTIriRef(item))) {
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
    if (isObjectHasKeys(data, [IM.DEFINITION]) || isObjectHasKeys(data, [IM.IS_SUBSET_OF]) || isObjectHasKeys(data, ["http://endhealth.info/im#subsetsEdit"])) {
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
      if (typeof data[IM.ID] !== "string") message = "Iri must be of type string";
      else {
        if (!/#/g.test(data[IM.ID])) message = "Iri must contain a '#'";
        else {
          const splits = data[IM.ID].split("#");
          if (splits.length !== 2) message = "Iri contains invalid character '#' within identifier.";
          else if (!/^http:\/\/[a-zA-Z]+\.[a-zA-Z]+\/[a-zA-Z]+#$/.test(splits[0] + "#")) message = "Iri url is invalid.";
          else if (!splits[1]) message = "Iri must have a code.";
          else if (encodeURIComponent(splits[1]) !== splits[1]) {
            const invalidCharactersEncoded = encodeURIComponent(splits[1]).match(/%[0-9a-zA-Z]{2}/g);
            if (invalidCharactersEncoded) {
              const invalidCharactersDecoded = invalidCharactersEncoded.map(char => decodeURIComponent(char));
              message = "Iri identifier contains invalid characters: " + JSON.stringify(invalidCharactersDecoded);
            }
          } else if (["CSET_"].includes(splits[1])) {
            message = "Iri missing code after prefix: " + splits[1];
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
      if (data[IM.HAS_TERM_CODE].every((tc: any) => this.isValidTermCode(tc))) {
        valid = true;
        message = undefined;
      }
    } else {
      valid = true;
      message = undefined;
    }
    return { isValid: valid, message: message };
  }

  private isValidTermCode(data: any): boolean {
    let valid = false;
    if (isObjectHasKeys(data, [IM.CODE, IM.HAS_STATUS, RDFS.LABEL]) && data[IM.CODE] && data[IM.HAS_STATUS] && data[RDFS.LABEL]) {
      if (data[IM.HAS_STATUS] && data[IM.HAS_STATUS].length === 1) {
        if (null !== data[IM.HAS_STATUS][0]) valid = true;
      }
    }
    return valid;
  }

  private async isValidScheme(data: any): Promise<{ isValid: boolean; message?: string }> {
    let valid = false;
    let message: string | undefined = "Scheme is invalid";
    const schemes = await this.entityService.getEntityChildren(IM.GRAPH);
    if (isObjectHasKeys(data, [IM.HAS_SCHEME]) && isArrayHasLength(data[IM.HAS_SCHEME]) && isTTIriRef(data[IM.HAS_SCHEME][0])) {
      if (schemes.findIndex(s => s["@id"] === data[IM.HAS_SCHEME][0]["@id"]) !== -1) {
        valid = true;
        message = undefined;
      }
    }
    return { isValid: valid, message: message };
  }

  private async isValidStatus(data: any): Promise<{ isValid: boolean; message?: string }> {
    let valid = false;
    let message: string | undefined = "Status is invalid";
    const queryReq = {
      argument: [
        {
          valueIri: {
            "@id": IM.STATUS
          },
          parameter: "this"
        }
      ],
      query: {
        "@id": QUERY.GET_DESCENDANTS
      }
    };
    const statuses = await this.queryService.queryIM(queryReq);

    if (isObjectHasKeys(data, [IM.HAS_STATUS]) && isArrayHasLength(data[IM.HAS_STATUS])) {
      if (data[IM.HAS_STATUS][0]["@id"] && data[IM.HAS_STATUS][0].name) {
        for (let s in statuses.entities) {
          if (data[IM.HAS_STATUS][0]["@id"] === statuses.entities[s]["@id"] && data[IM.HAS_STATUS][0].name === statuses.entities[s][RDFS.LABEL]) {
            valid = true;
            message = undefined;
          }
        }
      }
    }
    return { isValid: valid, message: message };
  }

  private isValidRoleGroups(data: any): { isValid: boolean; message?: string } {
    if (!isObjectHasKeys(data, [IM.ROLE_GROUP])) return { isValid: true };

    for (let group in data[IM.ROLE_GROUP]) {
      if (isObjectHasKeys(data[IM.ROLE_GROUP][group], [IM.GROUP_NUMBER])) {
        if (Object.keys(data[IM.ROLE_GROUP][group]).length <= 1) {
          return { isValid: false, message: "1 or more role groups are invalid." };
        } else {
          for (let roles in data[IM.ROLE_GROUP][group]) {
            if (null === data[IM.ROLE_GROUP][group][roles]["@id"] || "" === data[IM.ROLE_GROUP][group][roles].name) {
              return { isValid: false, message: "1 or more role groups are invalid." };
            }
          }
        }
      }
    }
    return { isValid: true };
  }
}
