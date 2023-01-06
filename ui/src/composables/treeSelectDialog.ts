import { EntityService, QueryService } from "@/services";
import { isConcept, isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byKey } from "@im-library/helpers/Sorters";
import { Query, QueryRequest, TreeSelectOption, TreeTableItemData, TTIriRef } from "@im-library/interfaces";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { createTreeSelectOption, createTreeSelectOptionDataFromTTProperty } from "@im-library/helpers/QuickQueryBuilders";
import { Ref } from "vue";

export function onSelect(selectedVariable: Ref<TreeSelectOption>, selectedValue: TreeSelectOption) {
  selectedVariable.value = selectedValue;
}

export async function onValueExpand(option: TreeSelectOption) {
  option.children = await getChildrenSelectionTree(option.key!);
}

export function onValueFinalSelect(tableItem: TreeTableItemData, selectedNode: Ref<TreeSelectOption>) {
  tableItem.value = { "@id": selectedNode.value.key, name: selectedNode.value.label } as TTIriRef;
  tableItem.valueDisplay = selectedNode.value.label;
}

export async function onPropertyExpand(option: TreeSelectOption) {
  option.children = await getPropertySelectionTree(option.data.valueType["@id"]);
}

export async function onPropertyFinalSelect(tableItem: TreeTableItemData, selectedNode: Ref<TreeSelectOption>) {
  tableItem.property["@id"] = selectedNode.value.key!;
  tableItem.property.name = selectedNode.value.label!;
  tableItem.valueType = selectedNode.value.data.valueType;
  tableItem.valueOptions = await getValueSelectionTree(selectedNode.value);
  tableItem.propertyDisplay = selectedNode.value.label;
}

async function getPropertySelectionTree(iri: string): Promise<TreeSelectOption[]> {
  const options = [] as TreeSelectOption[];

  if (iri) {
    const bundle = await EntityService.getPartialEntityBundle(iri, [SHACL.PROPERTY]);
    for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
      const type = [{ "@id": RDF.PROPERTY }] as TTIriRef[];
      const description = await getPropertyDescription(ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"]);
      const data = createTreeSelectOptionDataFromTTProperty(ttProperty, description);
      const option = createTreeSelectOption(data["@id"], data.name, type, data.componentType === "node", data);
      options.push(option);
    }
  }

  return options;
}

async function getPropertyDescription(iri: string) {
  const descriptionEntity = await EntityService.getPartialEntity(iri, [RDFS.COMMENT]);
  if (!descriptionEntity[RDFS.COMMENT]) return "No description";
  return descriptionEntity[RDFS.COMMENT];
}

async function getValueSelectionTree(option: TreeSelectOption) {
  const iri = option.data.valueType["@id"];
  let options = [] as TreeSelectOption[];
  const typeEntity = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
  if (isValueSet(typeEntity[RDF.TYPE])) {
    const definitionEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(definitionEntity, [IM.DEFINITION])) {
      options = isSimpleFromList(definitionEntity[IM.DEFINITION])
        ? await getNodesFromSet(JSON.parse(definitionEntity[IM.DEFINITION]))
        : await getNodesFromQuery(JSON.parse(definitionEntity[IM.DEFINITION]));
    }
  } else if (isQuery(typeEntity[RDF.TYPE])) {
    const definitionEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(definitionEntity, [IM.DEFINITION])) {
      options = await getNodesFromQuery(JSON.parse(definitionEntity[IM.DEFINITION]));
    }
  } else if (isConcept(typeEntity[RDF.TYPE])) {
    options = await getChildrenSelectionTree(iri);
  } else if (isRecordModel(typeEntity[RDF.TYPE])) {
    console.log("record model");
  }
  options.sort(byKey);
  return options;
}

function isSimpleFromList(definition: Query) {
  return (
    isObjectHasKeys(definition, ["where"]) &&
    isArrayHasLength(definition.where.from) &&
    !isObjectHasKeys(definition.where, ["notExist"]) &&
    !isObjectHasKeys(definition.where, ["and"])
  );
}

async function getChildrenSelectionTree(iri: string) {
  const children = await EntityService.getEntityChildren(iri);
  return children.map(child => {
    const option = createTreeSelectOption(child["@id"], child.name, child.type, child.hasChildren);
    return option;
  });
}

async function getNodesFromQuery(query: Query): Promise<TreeSelectOption[]> {
  const options = [] as TreeSelectOption[];
  const selectedProperties = [RDFS.LABEL, RDF.TYPE, IM.HAS_CHILDREN];
  const querySelect: any = [];
  for (const selectedProperty of selectedProperties) {
    querySelect.push({ property: { "@id": selectedProperty } });
  }
  query.select = querySelect;
  const queryRequest: QueryRequest = { query: query } as QueryRequest;

  let result = await QueryService.queryIM(queryRequest);

  if (!isArrayHasLength(result.entities)) {
    delete (queryRequest as any).textSearch;
    result = await QueryService.queryIM(queryRequest);
  }

  for (const entity of result.entities) {
    const hasChildren = await EntityService.getHasChildren(entity["@id"]);
    const option = createTreeSelectOption(entity["@id"], entity[RDFS.LABEL], entity[RDF.TYPE], hasChildren);
    options.push(option);
  }

  return options;
}

async function getNodesFromSet(query: Query): Promise<TreeSelectOption[]> {
  const options = [] as TreeSelectOption[];

  if (isObjectHasKeys(query, ["where"]) && isArrayHasLength(query.where.from)) {
    for (const from of query.where.from) {
      const hasChildren = await EntityService.getHasChildren(from["@id"]);
      const type = (await EntityService.getPartialEntity(from["@id"], [RDF.TYPE]))[RDF.TYPE];
      const option = createTreeSelectOption(from["@id"], from.name, type, hasChildren);
      options.push(option);
    }
  }
  return options;
}
