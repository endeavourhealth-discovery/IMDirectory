import { TTIriRef } from "../TTIriRef.js";

export interface TTAlias extends TTIriRef {
  alias: string;
  inverse: boolean;
  variable: string;
  includeSupertypes: boolean;
  includeSubtypes: boolean;
  includeMembers: boolean;
  excludeSelf: boolean;
  isType: boolean;
  isSet: boolean;
}
