import { isObjectHasKeys } from "./DataTypeCheckers";

export function byPriority(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["priority"]) || !isObjectHasKeys(b, ["priority"])) return 0;
  if (a.priority < b.priority) {
    return -1;
  } else if (a.priority > b.priority) {
    return 1;
  } else {
    return 0;
  }
}

export function byScheme(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["scheme"]) || !isObjectHasKeys(b, ["scheme"])) return 0;
  if (a.scheme < b.scheme) {
    return -1;
  } else if (a.scheme > b.scheme) {
    return 1;
  } else {
    return 0;
  }
}

export function byLabel(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["label"] || !isObjectHasKeys(b, ["label"]))) return 0;
  if (a.label < b.label) {
    return -1;
  } else if (a.label > b.label) {
    return 1;
  } else {
    return 0;
  }
}

export function byName(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["name"] || !isObjectHasKeys(b, ["name"]))) return 0;
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  } else {
    return 0;
  }
}

export function byPosition(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["position"] || !isObjectHasKeys(b, ["position"]))) return 0;
  if (a.position < b.position) {
    return -1;
  } else if (a.position > b.position) {
    return 1;
  } else {
    return 0;
  }
}

export function byOrder(a: any, b: any): number {
  if (!isObjectHasKeys(a, ["order"] || !isObjectHasKeys(b, ["order"]))) return 0;
  if (a.order < b.order) {
    return -1;
  } else if (a.order > b.order) {
    return 1;
  } else {
    return 0;
  }
}
