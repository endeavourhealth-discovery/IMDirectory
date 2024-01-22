import { CodeTemplate } from "@/codegen/CodeTemplate";
import { DataModel, DataModelProperty } from "@/interfaces/AutoGen";

export class CodeGenerator {
  private template: CodeTemplate;

  constructor(codeTemplate: CodeTemplate) {
    this.template = codeTemplate;
  }

  public generateCode(model: DataModel, namespace: string): string {
    const result: string[] = [];

    result.push(this.replaceClassTokens(namespace, model));

    for (const prop of model.properties) {
      result.push(this.replacePropertyTokens(namespace, model, prop));
    }

    result.push(this.template.footer);

    return result.join("\n");
  }

  private replaceClassTokens(namespace: string, model: DataModel): string {
    return this.replaceTokens(this.template.header, namespace, model);
  }

  private replacePropertyTokens(namespace: string, model: DataModel, prop: DataModelProperty): string {
    const isArray = !prop.maxCount || prop.maxCount == 0;

    let t = this.template.property;
    if (isArray) t += this.template.collectionProperty;

    return this.replaceTokens(t, namespace, model, prop);
  }

  private replaceTokens(template: string, namespace: string, model: DataModel, prop?: DataModelProperty): string {
    let result = template
      .replaceAll("${NAMESPACE}", namespace)
      .replaceAll("${MODEL NAME}", model.name)
      .replaceAll("${MODELNAME}", model.name.replaceAll(" ", ""))
      .replaceAll("${model name}", model.name.toLowerCase())
      .replaceAll("${modelname}", model.name.toLowerCase().replaceAll(" ", ""))
      .replaceAll("${model Name}", this.toCamelCase(model.name))
      .replaceAll("${modelName}", this.toCamelCase(model.name).replaceAll(" ", ""))
      .replaceAll("${Model Name}", this.toTitleCase(model.name))
      .replaceAll("${ModelName}", this.toTitleCase(model.name).replaceAll(" ", ""))
      .replaceAll("${MODEL COMMENT}", model.comment);

    if (prop) {
      const isArray = !prop.maxCount || prop.maxCount == 0;
      const basePropertyType = this.getDataType(prop.dataType["@id"]);
      const propertyType = isArray ? this.template.collectionWrapper.replaceAll("${BASE DATA TYPE}", basePropertyType) : basePropertyType;

      result = result
        .replaceAll("${BASE DATA TYPE}", basePropertyType)
        .replaceAll("${DATA TYPE}", propertyType)
        .replaceAll("${PROPERTY NAME}", prop.name)
        .replaceAll("${PROPERTYNAME}", prop.name.replaceAll(" ", ""))
        .replaceAll("${property name}", prop.name.toLowerCase())
        .replaceAll("${propertyname}", prop.name.toLowerCase().replaceAll(" ", ""))
        .replaceAll("${property Name}", this.toCamelCase(prop.name))
        .replaceAll("${propertyName}", this.toCamelCase(prop.name).replaceAll(" ", ""))
        .replaceAll("${Property Name}", this.toTitleCase(prop.name))
        .replaceAll("${PropertyName}", this.toTitleCase(prop.name).replaceAll(" ", ""));
    }

    return result;
  }

  private getDataType(iri: string): string {
    return this.template.datatypeMap[iri] ?? this.template.defaultType;
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
