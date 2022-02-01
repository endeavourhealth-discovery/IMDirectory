import { TTBundle, TTIriRef } from "@/models/TripleTree";
import { IM } from "@/vocabulary/IM";
import { RDFS } from "@/vocabulary/RDFS";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

// min 2 characters
const indentSize = "  ";

export function bundleToText(bundle: TTBundle, defaultPredicatenames: any, indent: number, withHyperlinks: boolean, blockedUrlIris?: string[]): string {
  let predicates = bundle.predicates;
  predicates = addDefaultPredicates(predicates, defaultPredicatenames);
  delete bundle.entity["@id"];
  delete bundle.entity[IM.IS_A];
  let result = "";
  result += ttValueToString(bundle.entity, "object", indent, withHyperlinks, predicates, blockedUrlIris);
  return result;
}

function addDefaultPredicates(predicates?: any, defaults?: any) {
  if (!isObjectHasKeys(predicates)) predicates = {} as any;
  if (!isObjectHasKeys(defaults)) return predicates;
  for (const [key, value] of Object.entries(defaults)) {
    predicates[key] = value;
  }
  return predicates;
}

export function ttValueToString(node: any, previousType: string, indent: number, withHyperlinks: boolean, iriMap?: any, blockedUrlIris?: string[]): string {
  if (isObjectHasKeys(node, ["@id"])) {
    return ttIriToString(node, previousType, indent, withHyperlinks, false, blockedUrlIris);
  } else if (isObjectHasKeys(node, [RDFS.LABEL, IM.CODE])) {
    return termToString(node, indent);
  } else if (isObjectHasKeys(node)) {
    return ttNodeToString(node, previousType, indent, withHyperlinks, iriMap, blockedUrlIris);
  } else if (isArrayHasLength(node)) {
    return ttArrayToString(node, indent, withHyperlinks, iriMap, blockedUrlIris);
  } else {
    return String(node);
  }
}

export function termToString(node: any, indent: number): string {
  return indentSize.repeat(indent) + node[IM.CODE] + "\n";
}

export function ttIriToString(iri: TTIriRef, previous: string, indent: number, withHyperlinks: boolean, inline: boolean, blockedUrlIris?: string[]): string {
  const pad = indentSize.repeat(indent);
  let result = "";
  if (!inline) result += pad;
  if (withHyperlinks && (!blockedUrlIris || !blockedUrlIris.includes(iri["@id"]))) {
    const escapedUrl = iri["@id"].replace(/\//gi, "%2F").replace(/#/gi, "%23");
    result += `<a href="${window.location.origin}/#/concept/${escapedUrl}">`;
  }
  if (iri.name) result += removeEndBrackets(iri.name);
  else result += iri["@id"];
  if (withHyperlinks && (!blockedUrlIris || !blockedUrlIris.includes(iri["@id"]))) {
    result += "</a>";
  }
  if (previous === "array") result += "\n";
  return result;
}

export function ttNodeToString(node: any, previousType: string, indent: number, withHyperlinks: boolean, iriMap?: any, blockedUrlIris?: string[]): string {
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
    result = processNode(
      key,
      value,
      result,
      nodeIndent,
      iriMap,
      { pad: pad, prefix: prefix, suffix: suffix, group: group, last: last, withHyperlinks: withHyperlinks },
      blockedUrlIris
    );
    count++;
  }
  return result;
}

function processNode(key: string, value: any, result: string, indent: number, iriMap: any, stringAdditions: any, blockedUrlIris?: string[]): string {
  const pad = stringAdditions.pad;
  const prefix = stringAdditions.prefix;
  const suffix = stringAdditions.suffix;
  const withHyperlinks = stringAdditions.withHyperlinks;
  if (isObjectHasKeys(value, ["@id"])) {
    result += getObjectName(key, iriMap, pad, prefix);
    result += ttIriToString(value as TTIriRef, "object", indent, withHyperlinks, true, blockedUrlIris);
    result += suffix;
  } else if (isArrayHasLength(value)) {
    if (value.length === 1 && isObjectHasKeys(value[0], ["@id"])) {
      result += getObjectName(key, iriMap, pad, prefix);
      result += ttIriToString(value[0] as TTIriRef, "object", indent, withHyperlinks, true, blockedUrlIris);
      result += suffix;
    } else if ((value.length === 1 && typeof value[0] === "string") || typeof value[0] === "number") {
      result += getObjectName(key, iriMap, pad, prefix);
      result += String(value[0]);
      result += suffix;
    } else {
      result += getObjectName(key, iriMap, pad, prefix);
      result += "\n";
      result += ttValueToString(value, "object", indent + 1, withHyperlinks, iriMap, blockedUrlIris);
      if (stringAdditions.group && stringAdditions.last && result.endsWith("\n"))
        result = result.substring(0, result.length - 1) + " )" + result.substring(result.length - 1);
      else if (stringAdditions.group && stringAdditions.last) result += " )\n";
    }
  } else if (isObjectHasKeys(value)) {
    result += getObjectName(key, iriMap, pad, prefix);
    result += "\n";
    result += ttValueToString(value, "object", indent + 1, withHyperlinks, iriMap, blockedUrlIris);
    if (stringAdditions.group && stringAdditions.last && result.endsWith("\n"))
      result = result.substring(0, result.length - 1) + " )" + result.substring(result.length - 1);
    else if (stringAdditions.group && stringAdditions.last) result += " )\n";
  } else {
    result += getObjectName(key, iriMap, pad, prefix);
    result += ttValueToString(value, "object", indent, withHyperlinks, iriMap, blockedUrlIris);
    result += stringAdditions.suffix;
  }
  return result;
}

function getObjectName(key: string, iriMap: any, pad: string, prefix: string) {
  if (iriMap && iriMap[key]) return pad + prefix + removeEndBrackets(iriMap[key]) + " : ";
  else return pad + prefix + removeEndBrackets(key) + " : ";
}

export function ttArrayToString(arr: any[], indent: number, withHyperlinks: boolean, iriMap?: any, blockedUrlIris?: string[]): string {
  let result = "";
  for (const item of arr) {
    result += ttValueToString(item, "array", indent, withHyperlinks, iriMap, blockedUrlIris);
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
