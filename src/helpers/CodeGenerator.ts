import { CodeTemplate } from "../interfaces/CodeTemplate";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";

export function generateCode(template: CodeTemplate, model: TTIriRef, properties: DataModelProperty[], namespace: string): string {
  const result: string[] = [];

  const split = splitTemplate(template.template);

  result.push(replaceClassTokens(template, split.header, namespace, model));

  if (properties && properties.length) {
    for (const prop of properties) {
      result.push(replacePropertyTokens(template, split.property, split.collectionProperty, namespace, model, prop));
    }
  }

  result.push(split.footer);
  return result.join("");
}

function splitTemplate(template: string) {
  // Get marker positions
  const propertyTemp = "<template #property>";
  const propertyTempEnd = "</template #property>";
  const arrayTemp = "<template #array>";
  const arrayTempEnd = "</template #array>";

  const ps = { s: template.indexOf(propertyTemp), l: propertyTemp.length };
  const pe = { s: template.indexOf(propertyTempEnd), l: propertyTempEnd.length };
  const as = { s: template.indexOf(arrayTemp), l: arrayTemp.length };
  const ae = { s: template.indexOf(arrayTempEnd), l: arrayTempEnd.length };

  const header = template.substring(0, ps.s);
  const footer = template.substring(pe.s + pe.l);
  const property = template.substring(ps.s + ps.l, as.s > 0 ? as.s : pe.s);
  const array = as.s > 0 ? template.substring(as.s + as.l, ae.s) : "";

  return {
    header: header,
    footer: footer,
    property: property,
    collectionProperty: array
  };
}

function replaceClassTokens(template: CodeTemplate, header: string, namespace: string, model: TTIriRef): string {
  return replaceTokens(template, header, namespace, model);
}

function replacePropertyTokens(
  template: CodeTemplate,
  property: string,
  collectionProperty: string,
  namespace: string,
  model: TTIriRef,
  prop: DataModelProperty
): string {
  const isArray = !prop.maxExclusive;

  let t = property;
  if (isArray) t += collectionProperty;

  return replaceTokens(template, t, namespace, model, prop);
}

function replaceTokens(template: CodeTemplate, subTemplate: string, namespace: string, model: TTIriRef, prop?: DataModelProperty): string {
  let result = subTemplate;

  if (namespace) result = replaceVariants(result, "NAMESPACE", namespace);

  if (model.name) result = replaceVariants(result, "MODEL NAME", model.name);

  if (model.description) result = replaceVariants(result, "MODEL COMMENT", model.description);

  if (prop && prop.property && prop.property.name && prop.type && prop.type) {
    const isArray = !prop.maxExclusive;
    if (!template.datatypeMap[prop.type["@id"]] && prop.type.name) {
      const basePropertyType = codify(toTitleCase(prop.type.name)).replaceAll(" ", "");
      const propertyType =
        isArray && template.collectionWrapper ? replaceVariants(template.collectionWrapper, "BASE DATA TYPE", basePropertyType) : basePropertyType;

      result = replaceVariants(result, "BASE DATA TYPE", basePropertyType);
      result = replaceVariants(result, "DATA TYPE", propertyType);
    } else {
      const basePropertyType = template.datatypeMap[prop.type["@id"]] ?? "!!UNKNOWN!!";
      const propertyType =
        isArray && template.collectionWrapper ? replaceAll(template.collectionWrapper, "BASE DATA TYPE", basePropertyType) : basePropertyType;

      result = replaceAll(result, "BASE DATA TYPE", basePropertyType);
      result = replaceAll(result, "DATA TYPE", propertyType);
    }
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

export function replaceAll(template: string, name: string, value: string) {
  return template
    .replaceAll("${" + name + "}", value)
    .replaceAll("${" + codify(name) + "}", value)
    .replaceAll("${" + name.toLowerCase() + "}", value)
    .replaceAll("${" + codify(name.toLowerCase()) + "}", value)
    .replaceAll("${" + toCamelCase(name) + "}", value)
    .replaceAll("${" + codify(toCamelCase(name)) + "}", value)
    .replaceAll("${" + toTitleCase(name) + "}", value)
    .replaceAll("${" + codify(toTitleCase(name)) + "}", value);
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
    return txt.charAt(0).toUpperCase() + toCamelCase(txt.substring(1));
  });
}

export default {
  generateCode,
  replaceVariants,
  codify
};
