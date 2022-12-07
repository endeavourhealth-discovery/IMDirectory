import { QueryDisplay } from "im-library/interfaces";
import { QueryDisplayType } from "im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "im-library/helpers/DataTypeCheckers";
import { IM, RDFS } from "im-library/vocabulary";
import axios from "axios";
import EntityService from "@/services/entity.service";
import * as crypto from "crypto";

const entityService = new EntityService(axios);

export async function getQueryDefinitionDisplayByIri(iri: string): Promise<QueryDisplay> {
  const entity = (await entityService.getPartialEntity(iri, [IM.DEFINITION])).data;
  if (!entity[IM.DEFINITION]) return {} as QueryDisplay;
  return await buildQueryDisplayFromQuery(JSON.parse(entity[IM.DEFINITION]));
}

export async function buildQueryDisplayFromQuery(queryAPI: any) {
  const queryUI = {} as QueryDisplay;
  queryUI.children = [] as QueryDisplay[];
  await buildRecursively(queryAPI, queryUI);
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

async function buildRecursively(queryAPI: any, queryUI: QueryDisplay) {
  if (queryAPI !== null) {
    for (const key of Object.keys(queryAPI)) {
      if (isIncluded(key, queryAPI[key])) {
        if (isSimpleWhere(key, queryAPI[key])) {
          await addSimpleWhere(queryAPI, key, queryUI);
        } else if (isSimpleWhereList(key, queryAPI[key])) {
          await addSimpleWhereList(queryAPI, key, queryUI);
        } else if ("from" === key) {
          await addFrom(queryAPI, key, queryUI);
        } else if (isPrimitiveType(queryAPI[key])) {
          addPrimitiveType(queryAPI, key, queryUI);
        } else if (isArrayHasLength(queryAPI[key])) {
          await addArray(queryAPI, key, queryUI);
        } else if (isObject(queryAPI[key])) {
          await addObject(queryAPI, key, queryUI);
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

async function addSimpleOr(queryAPI: any, index: number, key: string, queryUI: QueryDisplay) {
  const fromList: any[] = [];
  const element = { ...queryAPI[key][index] };
  if (isObjectHasKeys(element, ["from"])) {
    for (const from of element.from) {
      from.label = await getLabelForObject(from);
      fromList.push(from);
    }
  }
  const queryDisplay = buildQueryDisplay(key, QueryDisplayType.SimpleOr, fromList);
  queryUI.children?.push(queryDisplay);
  delete queryAPI[key][index];
}

async function addFrom(queryAPI: any, key: string, queryUI: QueryDisplay) {
  for (const from of queryAPI[key]) {
    const label = await getLabelForObject(from);
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

async function addArray(queryAPI: any, key: string, queryUI: QueryDisplay) {
  for (let index = 0; index < queryAPI[key].length; index++) {
    const element = queryAPI[key][index];
    if (isSimpleOr(key, element)) {
      await addSimpleOr(queryAPI, index, key, queryUI);
    } else {
      const queryDisplay = buildQueryDisplay(key, getQueryDisplayType(element));
      queryUI.children?.push(queryDisplay);
      await buildRecursively(element, queryDisplay);
    }
  }
}

async function addObject(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const queryDisplay = buildQueryDisplay(key, getQueryDisplayType(queryAPI[key]));
  await buildRecursively(queryAPI[key], queryDisplay);
  queryUI.children?.push(queryDisplay);
}

async function addSimpleWhere(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const where = buildQueryDisplay(key, QueryDisplayType.Default);
  queryAPI[key].name = await getLabelForObject(queryAPI[key]);
  where.children?.push(buildQueryDisplay(key, QueryDisplayType.PropertyIs, { ...queryAPI[key] }));
  queryUI.children?.push(where);
  delete queryAPI[key];
}

async function addSimpleWhereList(queryAPI: any, key: string, queryUI: QueryDisplay) {
  const where = buildQueryDisplay("with", QueryDisplayType.Default);
  for (const propertyIs of queryAPI[key]) {
    propertyIs.property.name = await getLabelForObject(propertyIs.property);
    propertyIs.is.name = await getLabelForObject(propertyIs.is);
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

async function getLabelForObject(object: any): Promise<string> {
  if (object.name) {
    return object.name;
  }
  const entity = (await entityService.getPartialEntity(object["@id"], [RDFS.LABEL])).data;
  if (!isObjectHasKeys(entity, [RDFS.LABEL])) {
    return "no name";
  }

  return entity[RDFS.LABEL];
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
