import { Query, Where } from "../models/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function summariseQuery(query: Query) {
  summariseRecursively(query, "query");
  return query;
}

function summariseRecursively(query: any, type: string) {
  if (isObjectHasKeys(query)) {
    if (type === "where") {
      query.description = getWhereSummary(query);
    }
    for (const key of Object.keys(query)) {
      if (!isPrimitiveType(query[key])) summariseRecursively(query[key], key);
    }
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      summariseRecursively(nested, type);
    }
  }
}

function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

function getWhereSummary(where: Where) {
  if (isObjectHasKeys(where, ["id", "operator", "relativeTo"])) {
    return `${where.id} ${where.operator} ${where.relativeTo}`;
  } else if (isObjectHasKeys(where, ["id", "notExist"])) {
    return `${where.id} does not exist`;
  } else if (isObjectHasKeys(where, ["id", "in"])) {
    let desc = `${where.id} is ${where.in[0].name}`;
    if (where.in.length > 1) desc += " see more...";
    return desc;
  }
}

export default { summariseQuery };
