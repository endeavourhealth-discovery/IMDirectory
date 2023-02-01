import { QueryDisplay } from "@im-library/interfaces";
import { QueryDisplayType } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import * as crypto from "crypto";

export function buildQueryDisplayFromQuery(queryAPI: any) {
  const queryUI = {} as QueryDisplay;
  queryUI.children = [] as QueryDisplay[];
  buildQueryDisplay(queryAPI, queryUI);
  return queryUI;
}

export function buildQueryDisplayItem(label: string, type?: any, value?: any, selectable?: boolean): QueryDisplay {
  return {
    key: Number(crypto.randomBytes(64).readBigUInt64BE()),
    label: label,
    type: type,
    value: value,
    children: [] as QueryDisplay[],
    selectable: selectable
  } as QueryDisplay;
}

function buildQueryDisplay(queryAPI: any, queryUI: QueryDisplay) {
  if (isObjectHasKeys(queryAPI, ["from"])) {
    if (hasOrList(queryAPI.from)) {
      addOrList(queryAPI, queryUI);
    } else if (hasWhere(queryAPI.from)) {
      addWhere(queryAPI, queryUI);
    } else if (hasSingleFrom(queryAPI.from)) {
      addSingleFrom(queryAPI, queryUI);
    }
  }
}

function hasOrList(queryObject: any) {
  return isObjectHasKeys(queryObject, ["from", "bool"]) && queryObject.bool === "or";
}

function hasWhere(queryObject: any) {
  return isObjectHasKeys(queryObject, ["where"]);
}

function hasSingleFrom(queryObject: any) {
  return isObjectHasKeys(queryObject, ["@id", "name"]) && !isObjectHasKeys(queryObject, ["bool", "where"]);
}

function addOrList(queryAPI: any, queryUI: any) {
  const parent = buildQueryDisplayItem("any of");
  for (const from of queryAPI.from.from) {
    if (!hasWhere(from)) {
      parent.children?.push(buildQueryDisplayItem(from.name || from["@id"], QueryDisplayType.From, from, false));
    } else if (hasWhere(from)) {
      const whereParent = addSingleType(from, parent);
      addCondition(whereParent, from.where);
    }
  }
  queryUI.children?.push(parent);
}

function addWhere(queryAPI: any, queryUI: any) {
  const parent = addSingleFrom(queryAPI, queryUI);
  const where = buildQueryDisplayItem("with");
  if (hasWhere(queryAPI.from.where)) {
    addCondition(where, queryAPI.from.where.where);
  }

  parent.children?.push(where);
}

function addCondition(whereDisplay: QueryDisplay, where: any) {
  if (isArrayHasLength(where)) {
    for (const whereItem of where) {
      addCondition(whereDisplay, whereItem);
    }
  } else {
    const property = { "@id": where["@id"], name: where.name || where["@id"], includeSubtypes: where.includeSubtypes };
    const is = { "@id": where.in[0]["@id"], name: where.in[0].name || where.in[0]["@id"], includeSubtypes: where.in[0].includeSubtypes };
    const propertyIs = { property: property, is: is };
    whereDisplay.children?.push(buildQueryDisplayItem(where.name || where["@id"], QueryDisplayType.PropertyIs, propertyIs, false));
  }
}

function addSingleFrom(queryAPI: any, queryUI: any) {
  const parent = buildQueryDisplayItem("must be a");
  parent.children?.push(buildQueryDisplayItem(queryAPI.from.name || queryAPI.from["@id"], QueryDisplayType.From, queryAPI.from, false));
  queryUI.children?.push(parent);
  return parent;
}

function addSingleType(queryAPI: any, queryUI: any) {
  const parent = buildQueryDisplayItem(queryAPI.type.name || queryAPI.type["@id"], QueryDisplayType.From, queryAPI.type, false);
  queryUI.children?.push(parent);
  return parent;
}
