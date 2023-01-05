<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="From">
        <EntityAutocomplete class="multi-select" :ttAlias="selectedFrom" :getSuggestionsMethod="getFromSuggestions" />
      </TabPanel>
      <TabPanel header="Where">
        <TreeTable :value="treeTableItems" :expandedKeys="expandedKeys">
          <Column field="operator" header="Operator" :expander="true">
            <template #body="{ node }">
              <Dropdown v-model="node.data.operator" :options="logicOptions" />
            </template>
          </Column>
          <Column field="property" header="Property">
            <template #body="{ node }">
              <TreeSelect
                v-model="node.data.propertyDisplay"
                :options="propertyOptions"
                placeholder="Select Item"
                :lazy="true"
                @node-select="onPropertySelect($event as TreeSelectOption, node.data)"
                @node-expand="onPropertyExpand($event as TreeSelectOption)"
              >
                <template #header>
                  <span class="p-input-icon-right search-term-input">
                    <i class="pi pi-search" />
                    <InputText type="text" class="" v-model="propertySearchTerm" placeholder="Search all properties" />
                  </span>
                </template>
                <template #value="{ value, placeholder }">
                  <div v-if="isArrayHasLength(value) && isObjectHasKeys(value[0], ['label'])">
                    <span :style="value[0]?.styleClass">
                      <i :class="value[0]?.icon" class="fa-fw"></i>
                    </span>
                    {{ value[0]?.label }}
                  </div>
                  <div v-else>
                    {{ placeholder }}
                  </div>
                </template>
              </TreeSelect>
            </template>
          </Column>

          <Column field="value" header="Value">
            <template #body="{ node }">
              <InputText v-if="getTypeFromNode(node) === 'string'" type="text" v-model="node.data.value" />
              <InputNumber v-else-if="getTypeFromNode(node) === 'integer'" type="text" v-model="node.data.value" />
              <Calendar v-else-if="getTypeFromNode(node) === 'Date time'" v-model="node.data.value" dateFormat="dd/mm/yy" />
              <InputText v-else v-model="node.data.valueDisplay" @click="showValueDialog = true" />
              <ValueTreeDialog
                :nodes="node.data.valueOptions"
                :table-item="node.data"
                :show-dialog="showValueDialog"
                @on-close-dialog="showValueDialog = false"
              />
            </template>
          </Column>

          <Column headerStyle="width: 10rem" headerClass="text-center" bodyClass="text-center">
            <template #body="{ node }">
              <Button type="button" icon="pi pi-plus" class="p-button-success" style="margin-right: 0.5em" @click="addLogic(node)"></Button>
              <Button type="button" icon="pi pi-times" class="p-button-danger" @click="removeLogic(node)"></Button>
            </template>
          </Column>
        </TreeTable>
      </TabPanel>
      <TabPanel header="Select">
        <MultiSelect
          class="multi-select"
          v-model="selectSelectedProperties"
          :options="fromProperties"
          optionLabel="label"
          placeholder="Select output properties"
          display="chip"
        />
      </TabPanel>
      <TabPanel header="Preview">
        <Button icon="pi pi-bolt" label="Test query" class="p-button-help" @click="testQuery" />
        <TestQueryResults v-if="showTestQueryResults" :showDialog="showTestQueryResults" :imquery="imquery" @close-dialog="showTestQueryResults = false" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import { useStore } from "vuex";
import { onMounted, Ref, ref, watch } from "vue";
import { computed, ComputedRef } from "@vue/reactivity";
import _ from "lodash";
import { isConcept, isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import {
  DisplayTTIriRef,
  Query,
  QueryRequest,
  SuggestionInfo,
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
} from "@im-library/interfaces";
import { byKey } from "@im-library/helpers/Sorters";
import ValueTreeDialog from "./simpleQueryBuilder/ValueTreeDialog.vue";
import {
  buildUIProperty,
  convertTreeTableItemToQuery,
  createTreeSelectOption,
  createTreeSelectOptionDataFromTTProperty,
  createTreeTableItem
} from "@im-library/helpers/QuickQueryBuilders";
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import TreeSelect from "primevue/treeselect";
import TreeTable from "primevue/treetable";

const emit = defineEmits({ updateQuery: (payload: Query) => payload });

const treeTableItems: Ref<TreeTableItem[]> = ref([]);
const propertyOptions: Ref<TreeSelectOption[]> = ref([]);
const propertySearchTerm: Ref<string> = ref("");
const expandedKeys: Ref<any> = ref({});

const store = useStore();
const suggestionInfo: ComputedRef<SuggestionInfo> = computed(() => store.state.suggestionInfo);
const logicOptions = ["and", "not", "or", "-"];

const selectedFrom: Ref<TTAlias> = ref({} as TTAlias);
const fromProperties: Ref<UIProperty[]> = ref([]);
const selectSelectedProperties: Ref = ref();
const showTestQueryResults: Ref<boolean> = ref(false);
const imquery: Ref<Query> = ref({} as Query);

const showValueDialog = ref(false);

onMounted(async () => await init());

watch(
  () => _.cloneDeep(treeTableItems.value),
  async (newValue, oldValue) => {
    emit("updateQuery", convertTreeTableItemToQuery(selectedFrom.value, treeTableItems.value));
  }
);

watch(
  () => _.cloneDeep(selectedFrom.value),
  async (newValue, oldValue) => {
    emit("updateQuery", convertTreeTableItemToQuery(selectedFrom.value, treeTableItems.value));
  }
);

watch(
  () => propertySearchTerm.value,
  async () => await filterPropertyOptions(propertySearchTerm.value)
);

watch(
  () => selectedFrom.value["@id"],
  async () => {
    fromProperties.value = await getFromProperties(selectedFrom.value["@id"]);
    propertyOptions.value = await getPropertySelectionTree(selectedFrom.value["@id"]);
  }
);

watch(
  () => _.cloneDeep(suggestionInfo.value),
  async (currentValue, oldValue) => {
    updatePropertyValue(currentValue.propertyId, currentValue.propertyValue);
  }
);

async function init() {
  const mainRecords = await getFromSuggestions();
  selectedFrom.value["@id"] = mainRecords[0]["@id"];
  selectedFrom.value.name = mainRecords[0].name;
  propertyOptions.value = await getPropertySelectionTree(selectedFrom.value["@id"]);
  initTreeTableItems();
}

async function initTreeTableItems() {
  const topLogic = createTreeTableItem("and", "");
  treeTableItems.value.push(topLogic);
  expandLogic(topLogic.key!);
}

async function getFromProperties(iri: string): Promise<UIProperty[]> {
  const properties = [];
  const bundle = await EntityService.getPartialEntityBundle(iri, [SHACL.PROPERTY]);
  for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
    const description = await getPropertyDescription(ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"]);
    properties.push(buildUIProperty(ttProperty, description));
  }
  return properties;
}

async function getFromSuggestions(term?: string): Promise<TTIriRef[]> {
  let mainRecords = await EntityService.getEntityChildren("http://endhealth.info/im#MainRecordType");
  if (term) mainRecords = mainRecords.filter(record => record.name.toUpperCase().includes(term.toUpperCase()));
  return mainRecords.map(filt => {
    return { "@id": filt["@id"], name: filt.name } as TTIriRef;
  });
}

async function getDataModelTree(iri: string): Promise<TreeSelectOption[]> {
  return await getChildrenSelectionTree(iri);
}

async function getChildrenSelectionTree(iri: string): Promise<TreeSelectOption[]> {
  const children = await EntityService.getEntityChildren(iri);
  return children.map(child => {
    const option = createTreeSelectOption(child["@id"], child.name, child.type, child.hasChildren);
    return option;
  });
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

async function filterPropertyOptions(searchTerm: string) {
  if (searchTerm) propertyOptions.value = propertyOptions.value.filter(option => option.data.name.includes(searchTerm));
  else propertyOptions.value = await getPropertySelectionTree(selectedFrom.value["@id"]);
}

function getTypeFromNode(node: TreeTableItem) {
  return node?.data?.valueType?.name;
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

function isSimpleFromList(definition: Query) {
  return (
    isObjectHasKeys(definition, ["where"]) &&
    isArrayHasLength(definition.where.from) &&
    !isObjectHasKeys(definition.where, ["notExist"]) &&
    !isObjectHasKeys(definition.where, ["and"])
  );
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
  if (suggestionInfo.value.searchTerm) queryRequest.textSearch = suggestionInfo.value.searchTerm;

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

function addLogic(node: TreeTableItem) {
  const newLogicItem = createTreeTableItem("and", node.key!);
  expandLogic(newLogicItem.key!);
  node.children.push(newLogicItem);
}

function removeLogic(node: any) {
  const parentNode = findNode(node.parent, treeTableItems.value[0]) as TreeTableItem;
  if (parentNode) {
    parentNode.children = parentNode.children.filter(child => child.key !== node.key);
  }
}

function expandLogic(key: string) {
  expandedKeys.value[key!] = true;
  expandedKeys.value = { ...expandedKeys.value };
}

function findNode(key: string, currentNode: any): TreeTableItem | boolean {
  if (key === currentNode.key) {
    return currentNode;
  } else {
    for (const currentChild of currentNode.children) {
      const found = findNode(key, currentChild);
      if (found !== false) {
        return found;
      }
    }
    return false;
  }
}

async function onPropertySelect(selected: TreeSelectOption, tableItem: TreeTableItemData) {
  tableItem.property["@id"] = selected.key!;
  tableItem.property.name = selected.label!;
  tableItem.valueType = selected.data.valueType;
  tableItem.valueOptions = await getValueSelectionTree(selected);
}

function updatePropertyValue(propertyId: string, propertyValue: DisplayTTIriRef[]) {
  const foundProperty = fromProperties.value.find(property => property.label === propertyId);
  if (foundProperty) {
    foundProperty.value = propertyValue;
  }
}

async function onPropertyExpand(option: TreeSelectOption) {
  option.children = await getPropertySelectionTree(option.data.valueType["@id"]);
}

function testQuery() {
  // if (editorEntity?.value?.[IM.DEFINITION]) showTestQueryResults.value = true;
}

async function getPropertyDescription(iri: string) {
  const descriptionEntity = await EntityService.getPartialEntity(iri, [RDFS.COMMENT]);
  if (!descriptionEntity[RDFS.COMMENT]) return "No description";
  return descriptionEntity[RDFS.COMMENT];
}
</script>

<style scoped>
.multi-select {
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
}
.quick-query-builder-container {
  width: 100%;
  height: 100vh;
  overflow: auto;
  padding: 0 1rem;
  display: flex;
  flex-flow: column;
}

.search-term-input {
  display: flex;
  flex-flow: column;
  width: 100%;
}
</style>
