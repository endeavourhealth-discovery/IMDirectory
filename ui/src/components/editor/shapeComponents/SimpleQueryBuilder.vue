<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="From">
        <div class="from-list-container">
          <div class="from-list-box">
            <Listbox v-model="selectedFrom" :options="fromList" :filter="true" optionLabel="name"> </Listbox>
          </div>
          <div class="selected-from-property-table" v-if="isObjectHasKeys(selectedFrom, ['@id'])">
            <Properties :conceptIri="selectedFrom['@id']" />
          </div>
        </div>
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
              <InputText v-model="node.data.propertyDisplay" @click="showPropertyDialog = true" />
              <SelectTreeDialog
                :nodes="propertyOptions"
                :table-item="node.data"
                :show-dialog="showPropertyDialog"
                :actions="propertyTreeDialogActions"
                :from="selectedFrom['@id']"
                @on-close-dialog="showPropertyDialog = false"
              />
            </template>
          </Column>

          <Column field="value" header="Value">
            <template #body="{ node }">
              <InputText v-if="getTypeFromNode(node) === 'string'" type="text" v-model="node.data.value" />
              <InputNumber v-else-if="getTypeFromNode(node) === 'integer'" type="text" v-model="node.data.value" />
              <Calendar v-else-if="getTypeFromNode(node) === 'Date time'" v-model="node.data.value" dateFormat="dd/mm/yy" />
              <InputText v-else v-model="node.data.valueDisplay" @click="showValueDialog = true" />
              <SelectTreeDialog
                :nodes="node.data.valueOptions"
                :table-item="node.data"
                :show-dialog="showValueDialog"
                :actions="valueTreeDialogActions"
                :from="selectedFrom['@id']"
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
import Properties from "@/components/directory/viewer/dataModel/Properties.vue";
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import { onMounted, Ref, ref, watch } from "vue";
import _ from "lodash";
import { Query, QueryRequest, TreeDialogActions, TreeSelectOption, TreeTableItem, TTAlias, TTIriRef, UIProperty } from "@im-library/interfaces";
import SelectTreeDialog from "./simpleQueryBuilder/SelectTreeDialog.vue";
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
import TreeTable from "primevue/treetable";
import { onPropertyExpand, onPropertyFinalSelect, onSelect, onValueExpand, onValueFinalSelect } from "@/composables/treeSelectDialog";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const emit = defineEmits({ updateQuery: (payload: Query) => payload });

const fromList: Ref<any[]> = ref([]);
const treeTableItems: Ref<TreeTableItem[]> = ref([]);
const propertyOptions: Ref<TreeSelectOption[]> = ref([]);
const propertySearchTerm: Ref<string> = ref("");
const expandedKeys: Ref<any> = ref({});
const logicOptions = ["and", "not", "or", "-"];

const selectedFrom: Ref<TTAlias> = ref({} as TTAlias);
const fromProperties: Ref<UIProperty[]> = ref([]);
const selectSelectedProperties: Ref = ref();
const showTestQueryResults: Ref<boolean> = ref(false);
const imquery: Ref<Query> = ref({} as Query);

const showValueDialog = ref(false);
const showPropertyDialog = ref(false);

const propertyTreeDialogActions = {
  onSelect: onSelect,
  onExpand: onPropertyExpand,
  onFinalSelect: onPropertyFinalSelect
} as TreeDialogActions;

const valueTreeDialogActions = {
  onSelect: onSelect,
  onExpand: onValueExpand,
  onFinalSelect: onValueFinalSelect
} as TreeDialogActions;

onMounted(async () => await init());

// watch

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

async function init() {
  fromList.value = await getFromSuggestions();
  // selectedFrom.value["@id"] = mainRecords[10]["@id"];
  // selectedFrom.value.name = mainRecords[10][RDFS.LABEL];
  // propertyOptions.value = await getPropertySelectionTree(selectedFrom.value["@id"]);
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

async function getFromSuggestions(term?: string): Promise<any[]> {
  const allRecordsQuery = {
    query: {
      name: "Get all data models",
      where: {
        property: {
          "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        is: {
          "@id": "http://www.w3.org/ns/shacl#NodeShape"
        }
      },
      select: [
        {
          property: {
            "@id": "http://www.w3.org/2000/01/rdf-schema#label"
          }
        },
        {
          property: {
            "@id": "http://endhealth.info/im#weighting"
          }
        }
      ],
      orderBy: [
        {
          "@id": "http://endhealth.info/im#weighting"
        }
      ],
      direction: "DESC"
    }
  };

  const allRecordsResult = await QueryService.queryIM(allRecordsQuery as any);
  for (const entity of allRecordsResult.entities) {
    entity.name = entity[RDFS.LABEL];
  }
  return allRecordsResult.entities;
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

.from-list-container {
  display: flex;
  flex-flow: row wrap;
  height: calc(100vh - 13rem);
  overflow-y: hidden;
  width: 100%;
}

.from-list-box {
  height: 100%;
  width: 35%;
}

.p-listbox {
  height: 100%;
  overflow-y: auto;
}

.selected-from-property-table {
  height: 100%;
  width: 65%;
  overflow-y: auto;
}
</style>
