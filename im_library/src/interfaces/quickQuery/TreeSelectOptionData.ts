import { TTIriRef } from "../TTIriRef";

export interface TreeSelectOptionData extends TTIriRef {
  type: TTIriRef[];
  componentType: string;
  valueType: TTIriRef;
}
