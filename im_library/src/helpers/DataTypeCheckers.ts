export function isArrayHasLength(array: unknown): boolean {
  if (array && Array.isArray(array) && array.length) {
    return true;
  } else {
    return false;
  }
}

export function isObjectHasKeys(object: any, keys?: string[]): boolean {
  if (!isObject(object)) return false;
  if (!Object.keys(object).length) return false;
  if (keys) {
    const objectKeys = Object.keys(object);
    let result = true;
    keys.forEach(key => {
      if (!objectKeys.includes(key)) result = false;
    });
    return result;
  }
  return true;
}

export function isObject(object: any): boolean {
  if (!object) return false;
  if (Object.prototype.toString.call(object) === "[object Object]") return true;
  return false;
}

export default {
  isArrayHasLength,
  isObjectHasKeys,
  isObject
};
