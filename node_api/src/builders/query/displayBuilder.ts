import { QueryDisplay } from "@im-library/interfaces";
import { QueryDisplayType } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDFS } from "@im-library/vocabulary";
import * as crypto from "crypto";

export function buildQueryDisplayFromQuery(queryAPI: any) {
  const queryUI = {} as QueryDisplay;
  queryUI.children = [] as QueryDisplay[];
  buildRecursively(queryAPI, queryUI);
  return queryUI;
}

export function buildQueryDisplay(label: string, type?: any, value?: any, selectable?: boolean): QueryDisplay {
  return {
    key: Number(crypto.randomBytes(64).readBigUInt64BE()),
    label: getLabelFromKey(label),
    type: type,
    value: value,
    children: [] as QueryDisplay[],
    selectable: selectable
  } as QueryDisplay;
}

function buildRecursively(queryAPI: any, queryUI: QueryDisplay) {
  if (queryAPI !== null) {
    for (const key of Object.keys(queryAPI)) {
      if (isIncluded(key, queryAPI[key])) {
        if (isSimpleWhere(key, queryAPI[key])) {
          addSimpleWhere(queryAPI, key, queryUI);
        } else if (isSimpleWhereList(key, queryAPI[key])) {
          addSimpleWhereList(queryAPI, key, queryUI);
        } else if ("from" === key) {
          addFrom(queryAPI, key, queryUI);
        } else if (isPrimitiveType(queryAPI[key])) {
          addPrimitiveType(queryAPI, key, queryUI);
        } else if (isArrayHasLength(queryAPI[key])) {
          addArray(queryAPI, key, queryUI);
        } else if (isObject(queryAPI[key])) {
          addObject(queryAPI, key, queryUI);
        }
      }
    }
  }
}

function isIncluded(key: string, value: any) {
  if ("path" === key && IM.ROLE_GROUP === value) return false;
  const excluded = ["activeOnly"];
  return !excluded.includes(key);
}

function isPrimitiveType(object: any) {
  const primitiveTypes = ["string", "boolean"];
  return primitiveTypes.includes(typeof object);
}

function isIri(object: any) {
  if (typeof object === "string") {
    object = object as string;
    return object.startsWith("http://") || object.startsWith("https://");
  }
  return false;
}

function isSimpleWhereList(key: string, object: any) {
  const whereListClauses = ["and", "or"];
  if (whereListClauses.includes(key) && isArrayHasLength(object)) {
    const newArray = (object as []).filter(propertyIs => isPropertyIs(propertyIs));
    return object.length === newArray.length;
  }
}

function isSimpleWhere(key: string, object: any) {
  const whereClauses = ["where", "notExist"];
  if (whereClauses.includes(key)) {
    return isPropertyIs(object);
  }
  return false;
}

function isPropertyIs(object: any) {
  const keys = Object.keys(object);
  return keys.length === 2 && keys.includes("is") && keys.includes("property");
}

function isSimpleOr(key: string, object: any) {
  const simpleOr = ["or"];
  if (simpleOr.includes(key)) {
    const keys = Object.keys(object);
    return keys.length === 1 && keys.includes("from");
  }
  return false;
}

function addSimpleOr(queryAPI: any, index: number, key: string, queryUI: QueryDisplay) {
  const fromList: any[] = [];
  const element = { ...queryAPI[key][index] };
  if (isObjectHasKeys(element, ["from"])) {
    for (const from of element.from) {
      from.label = getLabelForObject(from);
      fromList.push(from);
    }
  }
  const queryDisplay = buildQueryDisplay(key, QueryDisplayType.SimpleOr, fromList);
  queryUI.children?.push(queryDisplay);
  delete queryAPI[key][index];
}

function addFrom(queryAPI: any, key: string, queryUI: QueryDisplay) {
  for (const from of queryAPI[key]) {
    const label = getLabelForObject(from);
    const queryDisplay = buildQueryDisplay(label, QueryDisplayType.From, from);
    queryUI.children?.push(queryDisplay);
  }
  if (queryUI.children?.length && queryUI.children?.length <= 1) queryUI.label = "must be a";
}

function addPrimitiveType(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const queryDisplay = buildQueryDisplay(key, getQueryDisplayType(queryAPI[key]));
  queryDisplay.value = queryAPI[key];
  queryUI.children?.push(queryDisplay);
}

function addArray(queryAPI: any, key: string, queryUI: QueryDisplay) {
  for (let index = 0; index < queryAPI[key].length; index++) {
    const element = queryAPI[key][index];
    if (isSimpleOr(key, element)) {
      addSimpleOr(queryAPI, index, key, queryUI);
    } else {
      const queryDisplay = buildQueryDisplay(key, getQueryDisplayType(element));
      queryUI.children?.push(queryDisplay);
      buildRecursively(element, queryDisplay);
    }
  }
}

function addObject(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const queryDisplay = buildQueryDisplay(key, getQueryDisplayType(queryAPI[key]));
  buildRecursively(queryAPI[key], queryDisplay);
  queryUI.children?.push(queryDisplay);
}

function addSimpleWhere(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const where = buildQueryDisplay(key, QueryDisplayType.Default);
  queryAPI[key].name = getLabelForObject(queryAPI[key]);
  where.children?.push(buildQueryDisplay(key, QueryDisplayType.PropertyIs, { ...queryAPI[key] }));
  queryUI.children?.push(where);
  delete queryAPI[key];
}

function addSimpleWhereList(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const where = buildQueryDisplay("with", QueryDisplayType.Default);
  for (const propertyIs of queryAPI[key]) {
    propertyIs.property.name = getLabelForObject(propertyIs.property);
    propertyIs.is.name = getLabelForObject(propertyIs.is);
    where.children?.push(buildQueryDisplay(key, QueryDisplayType.PropertyIs, { ...propertyIs }));
  }
  queryUI.children?.push(where);
  delete queryAPI[key];
}

function getQueryDisplayType(queryAPIObject: any) {
  if (typeof queryAPIObject === "boolean") return QueryDisplayType.Boolean;
  else if (isIri(queryAPIObject)) return QueryDisplayType.Iri;
  else if (typeof queryAPIObject === "string") return QueryDisplayType.String;
  return QueryDisplayType.Default;
}

function getLabelForObject(object: any): string {
  if (object.name) {
    return object.name;
  }
  return "no name";
}

function getLabelFromKey(key: string): string {
  let label = "";
  switch (key) {
    case "where":
      label = "any of";
      break;
    case "notExist":
      label = "excluding";
      break;

    default:
      label = key;
      break;
  }
  return label;
}
