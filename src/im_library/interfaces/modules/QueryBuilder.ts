import { QueryDisplayType } from "../../enums/Enums";
import { TTAlias } from "../Interfaces";
import { TTIriRef } from "./TTIriRef";

export interface FieldDto {
  name: string;
  firstType: string;
  secondType?: string;
}

export interface Field {
  name: string;
  type: string;
  genericType: string | GenericType;
}

export interface FieldUI {
  name: string;
  simplifiedType: SimplifiedType;
}

export interface GenericType {
  actualTypeArguments: string[];
  rawType: string;
  typeName: string;
}

export interface QueryObject {
  key: number;
  label: string;
  type: SimplifiedType;
  value?: any;
  children?: QueryObject[];
  selectable?: boolean;
}

export interface QueryObject {
  key: number;
  label: string;
  type: SimplifiedType;
  value?: any;
  children?: QueryObject[];
  selectable?: boolean;
}

export interface SimplifiedType {
  firstType: string;
  secondType?: string;
}

export interface QueryDisplay {
  key: number;
  label: string;
  type: QueryDisplayType;
  value?: any;
  children?: QueryDisplay[];
  selectable?: boolean;
}

export interface SetQueryObject {
  include: boolean;
  concept: TTAlias;
  refinements: Refinement[];
}

export interface Refinement {
  property: TTAlias;
  is: TTAlias;
}
