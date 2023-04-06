import { QueryDisplayType } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import * as crypto from "crypto";
import { TreeNode } from "primevue/tree";

export function buildQueryDisplayFromQuery(queryAPI: any): TreeNode {
  const queryUI = {} as TreeNode;
  queryUI.children = [] as TreeNode[];
  buildQueryDisplay(queryAPI, queryUI);
  return queryUI;
}

export function buildQueryDisplayItem(label: string, type?: any, value?: any, selectable?: boolean): TreeNode {
  return {
    key: Number(crypto.randomBytes(64).readBigUInt64BE()).toString(),
    label: label,
    type: type,
    value: value,
    children: [] as TreeNode[],
    selectable: selectable
  } as TreeNode;
}

function buildQueryDisplay(queryAPI: any, queryUI: TreeNode) {
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
  return isObjectHasKeys(queryObject, ["from", "boolFrom"]) && queryObject.boolFrom === "or";
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
  if (hasWhere(queryAPI.from)) {
    addCondition(where, queryAPI.from.where);
  }

  parent.children?.push(where);
}

function addCondition(whereDisplay: TreeNode, where: any) {
  if (isObjectHasKeys(where, ["bool"])) {
    addCondition(whereDisplay, where.where);
  } else if (isArrayHasLength(where)) {
    for (const whereItem of where) {
      addCondition(whereDisplay, whereItem);
    }
  } else {
    const property = { "@id": where["@id"], name: where.name || where["@id"], descendantsOrSelfOf: where.descendantsOrSelfOf };
    const is = { "@id": where.in[0]["@id"], name: where.in[0].name || where.in[0]["@id"], descendantsOrSelfOf: where.in[0].descendantsOrSelfOf };
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
  const label = queryAPI.type?.name || queryAPI.type?.["@id"] || queryAPI.name || queryAPI["@id"];
  const parent = buildQueryDisplayItem(label, QueryDisplayType.From, queryAPI.type || queryAPI, false);
  queryUI.children?.push(parent);
  return parent;
}
