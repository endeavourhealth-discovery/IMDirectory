import { getColourFromType, getFAIconFromType } from "../helpers/ConceptTypeMethods";
import {
  DatasetObject,
  Query,
  Select,
  TreeSelectOption,
  TreeSelectOptionData,
  TreeTableItem,
  TreeTableItemData,
  TTAlias,
  TTIriRef,
  TTProperty,
  UIProperty,
  Value,
  Where
} from "../interfaces";
import { SHACL } from "../vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function addDatasetToQuery(query: Query, dataset: DatasetObject) {
  delete query.select;
  delete query.direction;
  delete query.orderBy;
  delete query.groupBy;
  delete query.limit;

  if (dataset.selectedLimit) {
    query.limit = dataset.selectedLimit;
  }

  if (dataset.selectedProperties) {
    query.select = [];
    for (const property of dataset.selectedProperties) {
      const select = { property: {} } as Select;
      select.property["@id"] = property.property["http://www.w3.org/ns/shacl#path"][0]["@id"];
      select.property.name = property.property["http://www.w3.org/ns/shacl#path"][0].name;
      query.select.push(select);
    }
  }

  if (dataset.selectedGroupBy) {
    query.groupBy = [];
    for (const property of dataset.selectedGroupBy) {
      const ttAlias = {} as TTAlias;
      ttAlias["@id"] = property.property["http://www.w3.org/ns/shacl#path"][0]["@id"];
      ttAlias.name = property.property["http://www.w3.org/ns/shacl#path"][0].name;
      query.groupBy.push(ttAlias);
    }
  }

  if (dataset.selectedOrderBy && dataset.selectedDirection) {
    query.direction = dataset.selectedDirection;
    query.orderBy = [];
    for (const property of dataset.selectedOrderBy) {
      const ttAlias = {} as TTAlias;
      ttAlias["@id"] = property.property["http://www.w3.org/ns/shacl#path"][0]["@id"];
      ttAlias.name = property.property["http://www.w3.org/ns/shacl#path"][0].name;
      query.orderBy.push(ttAlias);
    }
  }
}

export function createTreeSelectOption(iri: string, name: string, type: TTIriRef[], hasChildren: boolean, optionData?: TreeSelectOptionData): TreeSelectOption {
  const data = optionData || createTreeSelectOptionData(iri, name, type);
  const option = {
    key: iri,
    label: name,
    icon: getFAIconFromType(type).join(" "),
    styleClass: "color:" + getColourFromType(type),
    data: data,
    leaf: !hasChildren,
    selectable: data.componentType !== "node"
  } as TreeSelectOption;
  return option;
}

export function createTreeSelectOptionData(iri: string, name: string, type: TTIriRef[]): TreeSelectOptionData {
  return { "@id": iri, name: name, type: type } as TreeSelectOptionData;
}

export function convertTreeTableItemToQuery(selectedFrom: TTAlias, treeTableItems: TreeTableItem[]) {
  const query = { from: [selectedFrom], where: {} as Where } as Query;
  for (const tableItem of treeTableItems) {
    recursevilyAddClauses(query.where, tableItem);
  }
  return query;
}

export function createTreeTableItem(operator: string, parent: string): TreeTableItem {
  const data = createTreeTableItemData(operator);
  return { key: String(Math.floor(Math.random() * 1000000)), data: data, children: [] as TreeTableItem[], parent: parent } as TreeTableItem;
}

function createTreeTableItemData(operator: string): TreeTableItemData {
  return {
    operator: operator,
    property: {} as TTIriRef,
    propertyDisplay: {},
    value: null,
    valueDisplay: {}
  } as TreeTableItemData;
}

function recursevilyAddClauses(parentClause: Where, tableItem: TreeTableItem) {
  const where = createWhereFromTreeTableItem(tableItem);
  switch (tableItem.data.operator) {
    case "and":
      parentClause.and = [where];
      break;
    case "not":
      parentClause.notExist = where;
      break;
    case "or":
      parentClause.or = [where];
      break;
    default:
      parentClause.and = [where];
      break;
  }

  if (isArrayHasLength(tableItem.children)) {
    for (const child of tableItem.children) {
      recursevilyAddClauses(where, child);
    }
  }
}

function createWhereFromTreeTableItem(tableItem: TreeTableItem): Where {
  const where = { property: tableItem.data.property } as Where;
  console.log(tableItem.data.valueType);
  if (isObjectHasKeys(tableItem.data, ["valueType"]))
    if (tableItem.data?.valueType.name === "string" || tableItem.data.valueType.name === "integer") {
      where.value = { value: tableItem.data.value } as Value;
    } else if (tableItem.data?.valueType.name === "Date time") {
      where.value = { value: new Date(tableItem.data.value).toLocaleDateString("en-GB") } as Value;
    } else {
      where.is = tableItem.data.value as TTAlias;
    }

  return where;
}

export function buildUIProperty(ttProperty: TTProperty, description: string): UIProperty {
  const label = ttProperty["http://www.w3.org/ns/shacl#path"][0].name || ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"];

  if (isObjectHasKeys(ttProperty, [SHACL.CLASS]))
    return {
      label: label,
      tooltip: "class: " + ttProperty["http://www.w3.org/ns/shacl#class"]?.[0]?.name,
      description: description,
      property: ttProperty,
      componentType: "class",
      valueType: ttProperty["http://www.w3.org/ns/shacl#class"][0],
      value: {} as TTAlias,
      logic: "and"
    };
  if (isObjectHasKeys(ttProperty, [SHACL.NODE]))
    return {
      label: label,
      tooltip: "node: " + ttProperty["http://www.w3.org/ns/shacl#node"]?.[0]?.name,
      description: description,
      property: ttProperty,
      componentType: "node",
      valueType: ttProperty["http://www.w3.org/ns/shacl#node"][0],
      value: {} as TTAlias,
      logic: "not"
    };
  if (isObjectHasKeys(ttProperty, [SHACL.DATATYPE]))
    return {
      label: label,
      tooltip: "datatype: " + ttProperty["http://www.w3.org/ns/shacl#datatype"]?.[0]?.name,
      description: description,
      property: ttProperty,
      componentType: "datatype",
      valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0],
      value: "",
      logic: "or"
    };
  return {
    label: label,
    tooltip: "datatype: " + ttProperty["http://www.w3.org/ns/shacl#datatype"]?.[0]?.name,
    description: description,
    property: ttProperty,
    componentType: "datatype",
    valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0],
    value: "",
    logic: "and"
  };
}

export function createTreeSelectOptionDataFromTTProperty(ttProperty: TTProperty, description: string): TreeSelectOptionData {
  const data = {
    "@id": ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"],
    name: ttProperty["http://www.w3.org/ns/shacl#path"][0].name || ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"],
    description: description
  } as any;

  if (isObjectHasKeys(ttProperty, [SHACL.CLASS])) {
    data.componentType = "class";
    data.valueType = ttProperty["http://www.w3.org/ns/shacl#class"][0];
  } else if (isObjectHasKeys(ttProperty, [SHACL.NODE])) {
    data.componentType = "node";
    data.valueType = ttProperty["http://www.w3.org/ns/shacl#node"][0];
  } else if (isObjectHasKeys(ttProperty, [SHACL.DATATYPE])) {
    data.componentType = "datatype";
    data.valueType = ttProperty["http://www.w3.org/ns/shacl#datatype"][0];
  }

  return data;
}

export default {
  createTreeSelectOption,
  createTreeSelectOptionData,
  createTreeSelectOptionDataFromTTProperty,
  convertTreeTableItemToQuery,
  createTreeTableItem,
  buildUIProperty,
  addDatasetToQuery
};
