import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

interface DisplayQuery {
  key: string;
  label: string;
  data: any;
  type: string;
  children: DisplayQuery[];
  icon?: string;
  style?: any;
  styleClass?: string;
  selectable?: boolean;
  leaf?: boolean;
  expandedIcon?: string;
  collapsedIcon?: string;
  [key: string]: any;
}

export function buildDisplayQuery(query: any) {
  const nodes = [] as DisplayQuery[];
  buildRecursively(query, nodes, "query");
  console.log(JSON.stringify(nodes));
  return nodes;
}

function buildRecursively(query: any, children: DisplayQuery[], type: string) {
  if (isObjectHasKeys(query)) {
    const label = query.name || query.id || query.bool || query.description;
    const displayQuery = createDisplayQuery(label, type, query);
    children.push(displayQuery);
    for (const key of Object.keys(query)) {
      if (!isPrimitiveType(query[key])) buildRecursively(query[key], displayQuery.children, key);
    }
  } else if (isArrayHasLength(query)) {
    for (const nested of query) {
      buildRecursively(nested, children, type);
    }
  }
}

function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "number", "boolean"];
  return primitiveTypes.includes(typeof object);
}

function createDisplayQuery(label: string, type?: string, data?: any): DisplayQuery {
  return {
    key: String(Math.floor(Math.random() * 9999999999999999)),
    label: label,
    type: type,
    data: data,
    children: []
  };
}

export default { buildDisplayQuery };
