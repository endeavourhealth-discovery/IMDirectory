export interface JoinData {
  inputs: TransformInputUpload[];
  instructions: JoinInstruction[];
}

export interface TransformInputUpload {
  id: string;
  inputFile: File;
  inputJson: any[];
  inputDisplayJson: any[];
  dataModel: any;
}

export interface JoinInstruction {
  dataA: string;
  dataB: string;
  propertyA: string;
  propertyB: string;
  joinType: string;
  nestedPropertyName: string;
}

export interface JpathData {
  input: TransformInputUpload;
  jpath: string;
}

export interface TransformInstruction {
  destinationPaths: string[];
  transformType: string;
  transformValue: string;
  transformFunctions: string[];
  example: string | undefined;
  exampleTransformed: string | undefined;
}

export enum TransfromType {
  TEMPLATE = "template",
  REFERENCE = "reference",
  CONSTANT = "constant"
}

export interface PathOption {
  key: string;
  label: string;
  data: string[];
  children: PathOption[];
}
