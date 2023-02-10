import { From, Query, Where, With } from "../models/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function summariseQuery(query: Query) {
  summariseRecursively(query, "query");
  return query;
}

function summariseRecursively(query: any, type: string) {
  if (isObjectHasKeys(query)) {
    const summary = getSummary(query, type);
    if (summary) query.description = summary;
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

function getSummary(query: any, type: string) {
  switch (type) {
    case "where":
      return getWhereSummary(query);
    case "from":
      return getFromSummary(query);
    case "with":
      return getWithSummary(query);
    default:
      break;
  }
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
  } else if (isObjectHasKeys(where, ["id", "range"])) {
    const from = where.range.from;
    const to = where.range.to;
    return `${where.id} from ${from.operator} ${from.value} ${from.unit} to ${to.operator} ${to.value} ${to.unit}`;
  }
}

function getFromSummary(from: From) {
  if (isObjectHasKeys(from, ["from", "bool"]) && isArrayHasLength(from.from)) {
    let desc = `${from.from[0].name}`;
    if (from.from.length > 1) desc += " see more...";
    return desc;
  }
}

function getWithSummary(vith: With) {
  if (isObjectHasKeys(vith, ["latest", "id", "in"])) {
    let desc = `latest ${vith.latest} ${vith.id} is ${vith.in[0].name}`;
    if (vith.in.length > 1) desc += " see more...";
    return desc;
  }
}

export default { summariseQuery };
