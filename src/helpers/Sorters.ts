import { GenericObject } from "@/interfaces/GenericObject";
import { isObjectHasKeys } from "./DataTypeCheckers";

export function stringAscending(a: string, b: string): number {
  return a.localeCompare(b);
}

export function stringDescending(a: string, b: string): number {
  return b.localeCompare(a);
}

export function numberAscending(a: number, b: number): number {
  return a - b;
}

export function numberDescending(a: number, b: number): number {
  return b - a;
}

export function byPriority(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["priority"]) || !isObjectHasKeys(b, ["priority"])) return 0;
  if (a.priority < b.priority) {
    return -1;
  } else if (a.priority > b.priority) {
    return 1;
  } else {
    return 0;
  }
}

export function byScheme(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["scheme"]) || !isObjectHasKeys(b, ["scheme"])) return 0;
  if (a.scheme.toLowerCase() < b.scheme.toLowerCase()) {
    return -1;
  } else if (a.scheme.toLowerCase() > b.scheme.toLowerCase()) {
    return 1;
  } else {
    return 0;
  }
}

export function byLabel(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["label"]) || !isObjectHasKeys(b, ["label"])) return 0;
  if (a.label.toLowerCase() < b.label.toLowerCase()) {
    return -1;
  } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
    return 1;
  } else {
    return 0;
  }
}

export function byName(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["name"]) || !isObjectHasKeys(b, ["name"])) return 0;
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } else {
    return 0;
  }
}

export function byPosition(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["position"]) || !isObjectHasKeys(b, ["position"])) return 0;
  if (a.position < b.position) {
    return -1;
  } else if (a.position > b.position) {
    return 1;
  } else {
    return 0;
  }
}

export function byOrder(a: GenericObject, b: GenericObject): number {
  if (!isObjectHasKeys(a, ["order"]) || !isObjectHasKeys(b, ["order"])) return 0;
  if (a.order < b.order) {
    return -1;
  } else if (a.order > b.order) {
    return 1;
  } else {
    return 0;
  }
}

export function byKey(a: GenericObject, b: GenericObject): number {
  if (isObjectHasKeys(a, ["key"]) || !isObjectHasKeys(b, ["key"])) return 0;
  if (a.key < b.key) {
    return -1;
  } else if (a.key > b.key) {
    return 1;
  } else {
    return 0;
  }
}

export default {
  byLabel,
  byName,
  byOrder,
  byPosition,
  byPriority,
  byScheme,
  byKey,
  stringAscending,
  stringDescending,
  numberAscending,
  numberDescending
};
