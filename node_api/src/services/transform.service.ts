import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { JoinData, JoinInstruction, PathOption, TransformInputUpload, TransformInstruction, TransfromType } from "@im-library/interfaces";
import jp, { PathComponent } from "jsonpath";
import alasql from "alasql";

class TransformFunctions {
  [x: string]: any;
  toUpperCamelCase(value: string): string {
    const lowerCamelCase = this.toLowerCamelCase(value);
    return lowerCamelCase.charAt(0).toUpperCase() + lowerCamelCase.slice(1);
  }

  toLowerCamelCase(value: string): string {
    return value.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  generateIri(dataModel: any, value: string): string {
    return "http://endhealth.info/im#" + value;
  }
}

export default class TransformService {
  axios: any;
  constructor(axios: any) {
    this.axios = axios;
  }

  // TransformService
  public getTransformed(inputJson: any[], dataModelJson: any[], instructions: TransformInstruction[]) {
    const transformed: any[] = [];
    inputJson.forEach(row => {
      let instances: any[] = [];
      dataModelJson.forEach(dataModel => {
        const instance = JSON.parse(JSON.stringify(dataModel));
        instances.push(instance);
      });
      instructions.forEach(instruction => {
        instances = this.transformByInstruction(instruction, instances, row).instances;
      });
      transformed.push(...instances);
    });

    return transformed;
  }

  public getTransformTypes() {
    return Object.keys(TransfromType).map(functionName => functionName.toLowerCase());
  }

  public getFunctions() {
    return Object.getOwnPropertyNames(TransformFunctions.prototype)
      .filter(propertyName => typeof new TransformFunctions()[propertyName] === "function")
      .filter(functionName => functionName !== "constructor");
  }

  public transformByInstruction(instruction: TransformInstruction, instances: any[], input: any) {
    const newValue = this.getValue(input, instances, instruction);
    instruction.destinationPaths.forEach(path => {
      this.setValueWithJpath(instances, path, newValue);
    });
    instruction.exampleTransformed = newValue;
    return { instruction, instances };
  }

  private getValue(input: any[], instance: any, instruction: TransformInstruction): string {
    let value;
    switch (instruction.transformType) {
      case "template":
        value = this.getValueFromTemplate(input, instruction);
        break;
      case "reference":
        value = this.getValueFromReference(input, instruction.transformValue);
        break;
      case "constant":
        value = instruction.transformValue as string;
        break;
      default:
        value = instruction.transformValue as string;
        break;
    }
    if (isArrayHasLength(instruction.transformFunctions)) {
      return this.getValueFromFunctions(value, instruction);
    }

    return value;
  }

  private getValueFromReference(input: any[], transformValue: string) {
    const referenceValues = this.queryWithJpath(input[0] ? input[0] : input, transformValue);
    if (!isArrayHasLength(referenceValues)) {
      return undefined;
    }
    return referenceValues[0];
  }

  private getValueFromFunctions(value: string, instruction: TransformInstruction): string {
    const transformations: string[] = [];
    transformations.push(value);
    let index = 0;
    instruction.transformFunctions.forEach(transformFunction => {
      transformations.push(this.getValueFromFunction(transformations[index], transformFunction));
      index++;
    });
    return transformations[transformations.length - 1];
  }

  private getValueFromFunction(value: string, transformValue: string): string {
    if (this.functionExists(transformValue)) {
      const transformFunctions = new TransformFunctions();
      return transformFunctions[transformValue](value);
    } else {
      return value;
    }
  }

  private functionExists(functionName: string) {
    const functions = Object.getOwnPropertyNames(TransformFunctions.prototype);
    return functions.includes(functionName);
  }

  private getValueFromTemplate(input: any, instruction: TransformInstruction): string {
    let newValue = instruction.transformValue;
    const templateValues = [];
    const referenceValues: any[] = [];
    const regex = /{([^}]+)}/g;
    let curMatch;

    while ((curMatch = regex.exec(instruction.transformValue))) {
      templateValues.push(curMatch[1]);
    }

    templateValues.forEach(value => {
      referenceValues.push(this.getValueFromReference(input, value));
    });

    for (var i = 0; i < templateValues.length; i++) {
      newValue = newValue.replace(new RegExp("{" + templateValues[i] + "}", "gi"), referenceValues[i]);
    }

    return newValue;
  }

  // JsonPathService
  public getInputFromJpath(input: TransformInputUpload, jsonPath: string) {
    const inputAfter = input;
    try {
      inputAfter.inputJson = jp.query(input.inputJson, jsonPath);
      inputAfter.inputDisplayJson = jp.query(input.inputDisplayJson, jsonPath);
      inputAfter.dataModel = this.generateDataModel(inputAfter.inputJson);
    } catch (error) {
      console.log(error);
      input.inputDisplayJson = [];
      input.inputJson = [];
      return input;
    }

    return inputAfter;
  }

  public setValueWithJpath(json: any, jsonPath: string, newValue: string) {
    return jp.value(json, jsonPath, newValue);
  }

  public queryWithJpath(json: any, jsonPath: any) {
    return jp.query(json, jsonPath);
  }

  public getJsonPathOptions(input: any) {
    return jp.paths(input, "$..*");
  }

  public getJpathTreeOptions(input: any) {
    const pathOptions = [] as PathOption[];
    const paths = this.getJsonPathOptions(input);

    paths.forEach(path => {
      const node = { key: "$", label: "$", data: ["$"], children: [] as PathOption[] };
      path.shift();
      this.addPathRecursively(pathOptions, node, path);

      const found = pathOptions.find(pathOption => pathOption.label === "$");
      if (found) {
        found.children.push(...node.children);
      } else {
        pathOptions.push(node);
      }
    });
    this.joinPathOptions(pathOptions);
    return pathOptions;
  }

  addPathRecursively(pathOptions: PathOption[], parentNode: any, propertyList: PathComponent[]) {
    if (propertyList.length) {
      const property = propertyList[0];
      const data = [];
      data.push(...parentNode.data);
      data.push(property);
      const childNode = { key: jp.stringify(data), label: property, data: data, children: [] } as PathOption;
      propertyList.shift();
      if (propertyList.length) {
        this.addPathRecursively(pathOptions, childNode, propertyList);
      }
      parentNode.children.push(childNode);
    }
  }

  private joinPathOptions(pathOptions: PathOption[]) {
    const levelKeys = jp.query(pathOptions, "$.*.key");
    const keySet = new Set(levelKeys);

    keySet.forEach(key => {
      const optionsToJoin = pathOptions.filter(pathOption => pathOption.key === key);

      if (optionsToJoin.length) {
        const restOptions = pathOptions.filter(pathOption => pathOption.key !== key);
        pathOptions.length = 0;
        const joined: PathOption | undefined = optionsToJoin.shift();
        if (joined) {
          optionsToJoin.forEach(option => {
            joined.children.push(...option.children);
          });
          pathOptions.push(...restOptions);
          pathOptions.push(joined);
        }
      }
    });

    pathOptions.forEach(pathOption => {
      if (pathOption.children.length) {
        this.joinPathOptions(pathOption.children);
      }
    });
  }

  // DataModelService
  public getDataModelInstanceDisplay(dataModels: any[]) {
    const instances = [] as any[];
    dataModels.forEach((entity: any) => {
      const instance = {};
      if (isObjectHasKeys(entity)) {
        Object.keys(entity).forEach(key => {
          (instance as any)[key] = "";
        });
      }
      instances.push(instance);
    });
    return instances;
  }

  public generateDataModel(inputJson: any[]) {
    const dataModels: any[] = [];

    if (isArrayHasLength(inputJson)) {
      const exampleRow = inputJson[0];
      this.addEntitiesRecursively(dataModels, exampleRow, undefined);
    }

    return dataModels;
  }

  private addEntitiesRecursively(dataModel: any, exampleRow: any, propertyName: any) {
    const entity = {
      "@id": "string",
      type: "string",
      label: "string"
    } as any;
    if (isObjectHasKeys(exampleRow)) {
      Object.keys(exampleRow).forEach(key => {
        if (isObjectHasKeys(exampleRow[key])) {
          this.addEntitiesRecursively(dataModel, exampleRow[key], key);
          entity[key] = { "@id": "string" };
        } else {
          entity[key] = typeof exampleRow[key];
        }
      });
    }
    dataModel.push(entity);
  }

  // ParseService
  public getJsonFromFile(fileString: string): any[] {
    const lines = fileString.split("\n");
    const jsonArray = [] as any[];
    const headers = lines[0].split(",").map(header => header.replace(/"+/g, "").trim());

    for (var i = 1; i < lines.length; i++) {
      const obj = {} as any;
      const currentline = lines[i].split(",");

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] ? currentline[j].replace(/"+/g, "").trim() : "";
      }

      jsonArray.push(obj);
    }
    return jsonArray;
  }

  // JoinService
  public join(body: JoinData) {
    body.instructions.forEach(currentInstr => {
      const joinedTransform = currentInstr.joinType === "nested" ? this.joinNested(currentInstr, body.inputs) : this.joinFlat(currentInstr, body.inputs); // join dataA with dataB
      body.inputs = body.inputs.filter(input => input.id !== currentInstr.dataA && input.id !== currentInstr.dataB); // remove dataA and dataB from inputs
      body.inputs.push(joinedTransform); // add joinedData to inputs
      body.instructions = this.getUpdatedInstructions(body, currentInstr, joinedTransform); // replace instructions with dataA/dataB.id with joinedData.id
    });
    return body.inputs;
  }

  private getJoinedTransform(instr: JoinInstruction, joinedJson: any[], joinedDisplayJson: any[]) {
    return {
      id: instr.dataA + instr.dataB + Date.now(),
      inputJson: joinedJson,
      inputDisplayJson: joinedDisplayJson,
      inputFile: { name: "Joined-" + Date.now() + ".json", lastModified: Date.now() } as File,
      dataModel: this.generateDataModel(joinedJson)
    } as TransformInputUpload;
  }

  private joinNested(instr: JoinInstruction, inputs: TransformInputUpload[]): TransformInputUpload {
    const dataA = this.getInputById(instr.dataA, inputs);
    const dataB = this.getInputById(instr.dataB, inputs);
    if (!dataA || !dataB) throw Error;
    dataA.inputJson.forEach(inputRow => {
      inputRow[instr.nestedPropertyName] = this.getRowByProperty(dataB.inputJson, instr.propertyB, inputRow[instr.propertyA]);
    });

    dataA.inputDisplayJson.forEach(inputRow => {
      inputRow[instr.nestedPropertyName] = this.getRowByProperty(dataB.inputDisplayJson, instr.propertyB, inputRow[instr.propertyA]);
    });
    return this.getJoinedTransform(instr, dataA.inputJson, dataA.inputDisplayJson);
  }

  private getRowByProperty(rows: any[], property: string, value: string) {
    return rows.find(row => row[property] === value);
  }

  private joinFlat(instr: JoinInstruction, inputs: TransformInputUpload[]): TransformInputUpload {
    const dataA = this.getInputById(instr.dataA, inputs);
    const dataB = this.getInputById(instr.dataB, inputs);
    if (!dataA || !dataB) throw Error;
    const joinedJson = alasql(
      "SELECT * FROM ? dataA \
        LEFT JOIN ? dataB ON dataA." +
        instr.propertyA +
        "= dataB." +
        instr.propertyB,
      [dataA.inputJson, dataB.inputJson]
    );
    const joinedDisplayJson = alasql(
      "SELECT * FROM ? dataA \
      LEFT JOIN ? dataB ON dataA." +
        instr.propertyA +
        "= dataB." +
        instr.propertyB,
      [dataA.inputDisplayJson, dataB.inputDisplayJson]
    );
    return this.getJoinedTransform(instr, joinedJson, joinedDisplayJson);
  }

  private getInputById(id: string, inputs: TransformInputUpload[]) {
    return inputs.find(ipnut => ipnut.id === id);
  }

  private getUpdatedInstructions(body: JoinData, currentInstr: JoinInstruction, joinedTransform: TransformInputUpload): JoinInstruction[] {
    const copyOfInstr = [...body.instructions];
    const currentInstrDataA = currentInstr.dataA;
    const currentInstrDataB = currentInstr.dataB;
    copyOfInstr.forEach(instruction => {
      if (instruction.dataA === currentInstrDataA) {
        instruction.dataA = joinedTransform.id;
      }
      if (instruction.dataA === currentInstrDataB) {
        instruction.dataA = joinedTransform.id;
      }
      if (instruction.dataB === currentInstrDataA) {
        instruction.dataB = joinedTransform.id;
      }
      if (instruction.dataB === currentInstrDataB) {
        instruction.dataB = joinedTransform.id;
      }
    });
    return copyOfInstr;
  }
}
