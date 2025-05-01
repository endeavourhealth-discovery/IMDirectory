import { IM, RDF, RDFS } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { iriToUrl } from "./Converters";
import { Argument, TTIriRef, TTNode } from "../interfaces/AutoGen";
import { TTBundle, TTEntity } from "@/interfaces/ExtendedAutoGen";
import { GenericObject } from "@/interfaces/GenericObject";

// min 2 characters
const indentSize = "  ";
let seeMore = "";

interface StringAdditions {
  pad: string;
  prefix: string;
  withHyperlinks: boolean;
  suffix: string;
  group: boolean;
  last: boolean;
}

export function bundleToText(
  appPath: string,
  bundle: TTBundle,
  defaultPredicatenames: GenericObject,
  indent: number,
  withHyperlinks: boolean,
  conceptIri: string,
  blockedUrlIris?: string[]
): string {
  seeMore = conceptIri;
  let predicates = bundle.predicates;
  predicates = addDefaultPredicates(predicates, defaultPredicatenames);
  delete bundle.entity["@id"];
  delete bundle.entity[IM.IS_A];
  let result = "";
  result += ttValueToString(appPath, bundle.entity, "object", indent, withHyperlinks, predicates, blockedUrlIris);
  return result;
}

function addDefaultPredicates(predicates?: GenericObject | undefined, defaults?: GenericObject | undefined) {
  if (!predicates || !isObjectHasKeys(predicates)) predicates = {};
  if (!defaults || !isObjectHasKeys(defaults)) return predicates;
  for (const [key, value] of Object.entries(defaults)) {
    predicates[key] = value;
  }
  return predicates;
}

export function ttValueToString(
  appPath: string,
  node: any,
  previousType: string,
  indent: number,
  withHyperlinks: boolean,
  iriMap?: GenericObject,
  blockedUrlIris?: string[]
): string {
  if (isObjectHasKeys(node, ["@id"])) {
    return ttIriToString(appPath, node, previousType, indent, withHyperlinks, false, blockedUrlIris);
  } else if (isObjectHasKeys(node, [RDFS.LABEL, IM.CODE])) {
    return termToString(node, indent);
  } else if (isObjectHasKeys(node)) {
    return ttNodeToString(appPath, node, previousType, indent, withHyperlinks, iriMap, blockedUrlIris);
  } else if (isArrayHasLength(node)) {
    return ttArrayToString(appPath, node, indent, withHyperlinks, iriMap, blockedUrlIris);
  } else {
    return String(node);
  }
}

export function termToString(node: TTEntity, indent: number): string {
  return indentSize.repeat(indent) + node[RDFS.LABEL] + "\n";
}

export function ttIriToString(
  appPath: string,
  iri: TTIriRef,
  previous: string,
  indent: number,
  withHyperlinks: boolean,
  inline: boolean,
  blockedUrlIris?: string[]
): string {
  const pad = indentSize.repeat(indent);
  let result = "";
  if (!inline) result += pad;
  if (withHyperlinks && (!blockedUrlIris || !blockedUrlIris.includes(iri["@id"]))) {
    const escapedUrl = iriToUrl(iri["@id"]);
    if (iri["@id"] === seeMore) {
      result += `<Button link as="a" href="">`;
    } else {
      result += `<Button link as="a" target="_blank" href="${window.location.origin}${appPath}/#/concept/${escapedUrl}">`;
    }
  }
  if (iri.name) result += removeEndBrackets(iri.name);
  else result += iri["@id"];
  if (withHyperlinks && (!blockedUrlIris || !blockedUrlIris.includes(iri["@id"]))) {
    result += "</Button>";
  }
  if (previous === "array") result += "\n";
  return result;
}

export function ttNodeToString(
  appPath: string,
  node: TTNode,
  _previousType: string,
  indent: number,
  withHyperlinks: boolean,
  iriMap?: GenericObject,
  blockedUrlIris?: string[]
): string {
  const pad = indentSize.repeat(indent);
  let result = "";
  let first = true;
  let last = false;
  let nodeIndent = indent;
  const totalKeys = Object.keys(node).length;
  let count = 1;
  let group = false;
  if (totalKeys > 1) group = true;
  for (const [key, value] of Object.entries(node)) {
    if (totalKeys === count) last = true;
    if (count === 1) first = true;
    let prefix = "";
    let suffix = "\n";

    if (group) {
      nodeIndent = indent + 1;
      prefix = indentSize;
      if (first) {
        prefix = indentSize.substring(0, indentSize.length - 2) + "( ";
        first = false;
      }
      if (last) {
        suffix = " )\n";
      }
    }
    result += processNode(
      appPath,
      key,
      value,
      nodeIndent,
      iriMap,
      {
        pad: pad,
        prefix: prefix,
        suffix: suffix,
        group: group,
        last: last,
        withHyperlinks: withHyperlinks
      },
      blockedUrlIris
    );
    count++;
  }
  return result;
}

function processNode(
  appPath: string,
  key: string,
  value: any,
  indent: number,
  iriMap: GenericObject | undefined,
  stringAdditions: StringAdditions,
  blockedUrlIris?: string[]
): string {
  let result = "";
  if (isObjectHasKeys(value, ["@id"])) {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += ttIriToString(appPath, value, "object", indent, stringAdditions.withHyperlinks, true, blockedUrlIris);
    result += stringAdditions.suffix;
  } else if (isArrayHasLength(value)) {
    result += processNodeArray(value, key, appPath, indent, iriMap, stringAdditions, blockedUrlIris);
  } else if (isObjectHasKeys(value)) {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += "\n";
    result += ttValueToString(appPath, value, "object", indent + 1, stringAdditions.withHyperlinks, iriMap, blockedUrlIris);
    if (stringAdditions.group && stringAdditions.last && result.endsWith("\n"))
      result = result.substring(0, result.length - 1) + " )" + result.substring(result.length - 1);
    else if (stringAdditions.group && stringAdditions.last) result += " )\n";
  } else {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += ttValueToString(appPath, value, "object", indent, stringAdditions.withHyperlinks, iriMap, blockedUrlIris);
    result += stringAdditions.suffix;
  }
  return result;
}

function processNodeArray(
  value: TTIriRef[],
  key: string,
  appPath: string,
  indent: number,
  iriMap: GenericObject | undefined,
  stringAdditions: StringAdditions,
  blockedUrlIris?: string[]
) {
  let result = "";
  if (value.length === 1 && isObjectHasKeys(value[0], ["@id"])) {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += ttIriToString(appPath, value[0] as TTIriRef, "object", indent, stringAdditions.withHyperlinks, true, blockedUrlIris);
    result += stringAdditions.suffix;
  } else if ((value.length === 1 && typeof value[0] === "string") || typeof value[0] === "number") {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += String(value[0]);
    result += stringAdditions.suffix;
  } else {
    result += getObjectName(key, iriMap, stringAdditions.pad, stringAdditions.prefix);
    result += "\n";
    result += ttValueToString(appPath, value, "object", indent + 1, stringAdditions.withHyperlinks, iriMap, blockedUrlIris);
    if (stringAdditions.group && stringAdditions.last && result.endsWith("\n"))
      result = result.substring(0, result.length - 1) + " )" + result.substring(result.length - 1);
    else if (stringAdditions.group && stringAdditions.last) result += " )\n";
  }
  return result;
}

function getObjectName(key: string, iriMap: GenericObject | undefined, pad: string, prefix: string) {
  if (iriMap && iriMap[key]) return pad + prefix + removeEndBrackets(iriMap[key]) + " : ";
  else return pad + prefix + removeEndBrackets(key) + " : ";
}

export function ttArrayToString(
  appPath: string,
  arr: TTIriRef[],
  indent: number,
  withHyperlinks: boolean,
  iriMap?: GenericObject,
  blockedUrlIris?: string[]
): string {
  let result = "";
  for (const item of arr) {
    removeGroupNumber(arr);
    result += ttValueToString(appPath, item, "array", indent, withHyperlinks, iriMap, blockedUrlIris);
  }
  return result;
}

function removeEndBrackets(str: string): string {
  const lastBracketStart = str.lastIndexOf("(");
  const bracketText = str.substring(lastBracketStart);
  const lastBracketEnd = bracketText.indexOf(")");
  if (lastBracketStart > 0 && lastBracketEnd > 0) return str.substring(0, lastBracketStart).trimEnd() + str.substring(lastBracketEnd + lastBracketStart + 1);
  else return str;
}

function removeGroupNumber(arr: TTEntity[]) {
  const groupNumberItems = arr.filter(item => {
    return isObjectHasKeys(item, [IM.ROLE_GROUP]);
  });
  if (isArrayHasLength(groupNumberItems)) {
    for (const groupNumberItem of groupNumberItems) {
      for (const roleGroup of groupNumberItem[IM.ROLE_GROUP]) {
        delete roleGroup[IM.GROUP_NUMBER];
      }
    }
  }
}

export function mapToObject(args: Argument[]) {
  const argsAsObject = {} as Argument;
  args.forEach((value, key) => {
    (argsAsObject as GenericObject)[key] = value;
  });
  return argsAsObject;
}

export function entityToAliasEntity(ttEntity: TTEntity) {
  if (isObjectHasKeys(ttEntity, ["@id"])) {
    ttEntity.iri = ttEntity["@id"];
    delete ttEntity["@id"];
  }
  if (isObjectHasKeys(ttEntity, [RDFS.LABEL])) {
    ttEntity.name = ttEntity[RDFS.LABEL];
    delete ttEntity[RDFS.LABEL];
  }
  if (isObjectHasKeys(ttEntity, [IM.CODE])) {
    ttEntity.code = ttEntity[IM.CODE];
    delete ttEntity[IM.CODE];
  }
  if (isObjectHasKeys(ttEntity, [RDFS.COMMENT])) {
    ttEntity.description = ttEntity[RDFS.COMMENT];
    delete ttEntity[RDFS.COMMENT];
  }
  if (isObjectHasKeys(ttEntity, [IM.HAS_STATUS])) {
    ttEntity.status = ttEntity[IM.HAS_STATUS];
    delete ttEntity[IM.HAS_STATUS];
  }
  if (isObjectHasKeys(ttEntity, [IM.HAS_SCHEME])) {
    ttEntity.scheme = ttEntity[IM.HAS_SCHEME];
    delete ttEntity[IM.HAS_SCHEME];
  }
  if (isObjectHasKeys(ttEntity, [RDF.TYPE])) {
    ttEntity.entityType = ttEntity[RDF.TYPE];
    delete ttEntity[RDF.TYPE];
  }
  if (isObjectHasKeys(ttEntity, [IM.USAGE_TOTAL])) {
    ttEntity.weighting = ttEntity[IM.USAGE_TOTAL];
    delete ttEntity[IM.USAGE_TOTAL];
  }
}

export default {
  bundleToText,
  ttArrayToString,
  ttIriToString,
  ttNodeToString,
  ttValueToString,
  termToString,
  mapToObject,
  entityToAliasEntity
};
