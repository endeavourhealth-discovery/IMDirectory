import { CodeTemplate } from "../interfaces/CodeTemplate";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";

export function generateCode(template: CodeTemplate, model: TTIriRef, properties: DataModelProperty[], namespace: string): string {


  const result: string[] = [];

  result.push(replaceClassTokens(template, namespace, model));

  for (const prop of properties) {
    result.push(replacePropertyTokens(template, namespace, model, prop));
  }

  result.push(template.footer);
  return result.join("");
}

function replaceClassTokens(template: CodeTemplate, namespace: string, model: TTIriRef): string {
  return replaceTokens(template, template.header, namespace, model);
}

function replacePropertyTokens(template: CodeTemplate, namespace: string, model: TTIriRef, prop: DataModelProperty): string {
  const isArray = !prop.maxExclusive;

  let t = template.property;
  if (isArray) t += template.collectionProperty;

  return replaceTokens(template, t, namespace, model, prop);
}

function replaceTokens(template: CodeTemplate, subTemplate: string, namespace: string, model: TTIriRef, prop?: DataModelProperty): string {
  let result = subTemplate;

  if (namespace) result = replaceVariants(result, "NAMESPACE", namespace);

  if (model.name) result = replaceVariants(result, "MODEL NAME", model.name);

  if (model.description) result = replaceVariants(result, "MODEL COMMENT", model.description);

  if (prop && prop.property && prop.property.name && prop.type && prop.type) {
    const isArray = !prop.maxExclusive;
    const basePropertyType = getDataType(template.datatypeMap, prop.type);
    const propertyType =
      isArray && template.collectionWrapper ? replaceVariants(template.collectionWrapper, "BASE DATA TYPE", basePropertyType) : basePropertyType;

    result = replaceVariants(result, "BASE DATA TYPE", basePropertyType);
    result = replaceVariants(result, "DATA TYPE", propertyType);
    result = replaceVariants(result, "PROPERTY NAME", prop.property.name);
  }

  return result;
}

export function replaceVariants(template: string, name: string, value: string) {
  return template
    .replaceAll("${" + name + "}", value)
    .replaceAll("${" + codify(name) + "}", codify(value))
    .replaceAll("${" + name.toLowerCase() + "}", value.toLowerCase())
    .replaceAll("${" + codify(name.toLowerCase()) + "}", codify(value.toLowerCase()))
    .replaceAll("${" + toCamelCase(name) + "}", toCamelCase(value))
    .replaceAll("${" + codify(toCamelCase(name)) + "}", codify(toCamelCase(value)))
    .replaceAll("${" + toTitleCase(name) + "}", toTitleCase(value))
    .replaceAll("${" + codify(toTitleCase(name)) + "}", codify(toTitleCase(value)));
}

function getDataType(datatypeMap: any, iri: TTIriRef): string {
  return datatypeMap[iri["@id"]] ?? iri.name ?? "!!UNKNOWN!!"; // TODO!!!
}

export function codify(name: string): string {
  return name
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll("#", "")
    .replaceAll("'", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll('"', "")
    .replaceAll("/", "");
}

function toCamelCase(str: string): string {
  return str
    .split(" ")
    .map((v, i) => (i == 0 ? v.toLowerCase() : toTitleCase(v)))
    .join(" ");
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

export default {
  generateCode,
  replaceVariants,
  codify
};
