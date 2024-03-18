import { CodeTemplate } from "../codegen/CodeTemplate";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";

export class CodeGenerator {
  private template: CodeTemplate;

  constructor(codeTemplate: CodeTemplate) {
    this.template = codeTemplate;
  }

  public generateCode(model: TTIriRef, properties: DataModelProperty[], namespace: string): string {
    const result: string[] = [];

    result.push(this.replaceClassTokens(namespace, model));

    for (const prop of properties) {
      result.push(this.replacePropertyTokens(namespace, model, prop));
    }

    result.push(this.template.footer);
    return result.join("\n");
  }

  private replaceClassTokens(namespace: string, model: TTIriRef): string {
    return this.replaceTokens(this.template.header, namespace, model);
  }

  private replacePropertyTokens(namespace: string, model: TTIriRef, prop: DataModelProperty): string {
    const isArray = !prop.maxExclusive;

    let t = this.template.property;
    if (isArray) t += this.template.collectionProperty;

    return this.replaceTokens(t, namespace, model, prop);
  }

  private replaceTokens(template: string, namespace: string, model: TTIriRef, prop?: DataModelProperty): string {
    let result = template;

    if (namespace) result = this.replaceVariants(result, "NAMESPACE", namespace);

    if (model.name) result = this.replaceVariants(result, "MODEL NAME", model.name);

    if (model.description) result = this.replaceVariants(result, "MODEL COMMENT", model.description);

    if (prop && prop.property && prop.property.name && prop.type && prop.type) {
      const isArray = !prop.maxExclusive;
      const basePropertyType = this.getDataType(prop.type);
      const propertyType =
        isArray && this.template.collectionWrapper
          ? this.replaceVariants(this.template.collectionWrapper, "BASE DATA TYPE", basePropertyType)
          : basePropertyType;

      result = this.replaceVariants(result, "BASE DATA TYPE", basePropertyType);
      result = this.replaceVariants(result, "DATA TYPE", propertyType);
      result = this.replaceVariants(result, "PROPERTY NAME", prop.property.name);
    }

    return result;
  }

  public replaceVariants(template: string, name: string, value: string) {
    return template
      .replaceAll("${" + name + "}", value)
      .replaceAll("${" + this.codify(name) + "}", this.codify(value))
      .replaceAll("${" + name.toLowerCase() + "}", value.toLowerCase())
      .replaceAll("${" + this.codify(name.toLowerCase()) + "}", this.codify(value.toLowerCase()))
      .replaceAll("${" + this.toCamelCase(name) + "}", this.toCamelCase(value))
      .replaceAll("${" + this.codify(this.toCamelCase(name)) + "}", this.codify(this.toCamelCase(value)))
      .replaceAll("${" + this.toTitleCase(name) + "}", this.toTitleCase(value))
      .replaceAll("${" + this.codify(this.toTitleCase(name)) + "}", this.codify(this.toTitleCase(value)));
  }

  private getDataType(iri: TTIriRef): string {
    return this.template.datatypeMap[iri["@id"]] ?? iri.name ?? "!!UNKNOWN!!"; // TODO!!!
  }

  private codify(name: string): string {
    return name.replaceAll(" ", "").replaceAll("-", "").replaceAll(".", "").replaceAll("#", "").replaceAll("'", "").replaceAll('"', "").replaceAll("/", "");
  }

  public toCamelCase(str: string): string {
    return str
      .split(" ")
      .map((v, i) => (i == 0 ? v.toLowerCase() : this.toTitleCase(v)))
      .join(" ");
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  }
}
