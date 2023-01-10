<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="Profile">
        <div class="profile-container">
          <span class="type-input-container">Type: <InputText v-model="selectedType.name" @click="showTypeDialog = true" /></span>
          <span class="bpop-input-container">Base population: <InputText v-model="selectedBPop.name" @click="showBPopDialog = true" /></span>
          <ListBoxDialog :list="fromList" :show-dialog="showTypeDialog" @on-close-dialog="showTypeDialog = false" @on-select="onTypeSelect" />
          <ListBoxDialog :list="fromList" :show-dialog="showBPopDialog" @on-close-dialog="showBPopDialog = false" @on-select="onBPopSelect" />
        </div>

        <TreeTable :value="treeTableItems" :expandedKeys="expandedKeys">
          <Column field="operator" header="Operator" :expander="true">
            <template #body="{ node }">
              <Dropdown v-model="node.data.operator" :options="logicOptions" />
            </template>
          </Column>
          <Column field="property" header="Property">
            <template #body="{ node }">
              <InputText v-model="node.data.propertyDisplay" @click="node.data.showPropertyDialog = true" />
              <SelectTreeDialog
                :nodes="propertyOptions"
                :table-item="node.data"
                :show-dialog="node.data.showPropertyDialog"
                :actions="propertyTreeDialogActions"
                :from="selectedType['@id']"
                :selectType="'property'"
                @on-close-dialog="node.data.showPropertyDialog = false"
                @on-filter="filterOptions"
              />
            </template>
          </Column>

          <Column field="value" header="Value">
            <template #body="{ node }">
              <InputText v-if="getTypeFromNode(node) === 'string'" type="text" v-model="node.data.value" />
              <InputNumber v-else-if="getTypeFromNode(node) === 'integer'" type="text" v-model="node.data.value" />
              <Calendar v-else-if="getTypeFromNode(node) === 'Date time'" v-model="node.data.value" dateFormat="dd/mm/yy" />
              <InputText v-else v-model="node.data.valueDisplay" @click="node.data.showValueDialog = true" />
              <SelectTreeDialog
                :nodes="node.data.valueOptions"
                :table-item="node.data"
                :show-dialog="node.data.showValueDialog"
                :actions="valueTreeDialogActions"
                :from="selectedType['@id']"
                :selectType="'value'"
                @on-close-dialog="node.data.showValueDialog = false"
                @on-filter="filterOptions"
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

      <TabPanel header="Dataset">
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
import { EntityService, QueryService } from "@/services";
import { RDFS, SHACL } from "@im-library/vocabulary";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import { onMounted, Ref, ref, watch } from "vue";
import _ from "lodash";
import {
  Query,
  TreeDialogActions,
  TreeSelectOption,
  TreeSelectOptionData,
  TreeTableItem,
  TreeTableItemData,
  TTAlias,
  UIProperty
} from "@im-library/interfaces";
import SelectTreeDialog from "./simpleQueryBuilder/SelectTreeDialog.vue";
import { buildUIProperty, convertTreeTableItemToQuery, createTreeTableItem } from "@im-library/helpers/QuickQueryBuilders";
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
import {
  onPropertyExpand,
  onPropertyFinalSelect,
  onSelect,
  onValueExpand,
  onValueFinalSelect,
  getPropertySelectionTree,
  getPropertyDescription,
  getValueSelectionTree
} from "@/composables/treeSelectDialog";
import ListBoxDialog from "./simpleQueryBuilder/ListBoxDialog.vue";

const emit = defineEmits({ updateQuery: (payload: Query) => payload });

const fromList: Ref<any[]> = ref([]);
const treeTableItems: Ref<TreeTableItem[]> = ref([]);
const propertyOptions: Ref<TreeSelectOption[]> = ref([]);
const expandedKeys: Ref<any> = ref({});
const logicOptions = ["and", "not", "or", "-"];
const showTypeDialog: Ref<boolean> = ref(false);
const showBPopDialog: Ref<boolean> = ref(false);
const selectedType: Ref<TTAlias> = ref({} as TTAlias);
const selectedBPop: Ref<TTAlias> = ref({} as TTAlias);
const fromProperties: Ref<UIProperty[]> = ref([]);
const selectSelectedProperties: Ref = ref();
const showTestQueryResults: Ref<boolean> = ref(false);
const imquery: Ref<Query> = ref({} as Query);

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

watch(
  () => _.cloneDeep(treeTableItems.value),
  async (newValue, oldValue) => {
    emit("updateQuery", convertTreeTableItemToQuery(selectedType.value, treeTableItems.value));
  }
);

watch(
  () => _.cloneDeep(selectedType.value),
  async (newValue, oldValue) => {
    emit("updateQuery", convertTreeTableItemToQuery(selectedType.value, treeTableItems.value));
  }
);

watch(
  () => selectedType.value["@id"],
  async () => {
    fromProperties.value = await getFromProperties(selectedType.value["@id"]);
    propertyOptions.value = await getPropertySelectionTree(selectedType.value["@id"]);
  }
);

async function init() {
  fromList.value = await getFromSuggestions();
  initTreeTableItems();
}

async function initTreeTableItems() {
  const topLogic = createTreeTableItem("and", "");
  treeTableItems.value.push(topLogic);
  expandLogic(topLogic.key!);
}

function onTypeSelect(selected: any) {
  selectedType.value["@id"] = selected["@id"];
  selectedType.value.name = selected.name;
}

function onBPopSelect(selected: any) {
  selectedBPop.value["@id"] = selected["@id"];
  selectedBPop.value.name = selected[RDFS.LABEL];
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

async function getFromSuggestions(): Promise<any[]> {
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

async function filterOptions(selectType: string, searchTerm: string, tableItem: TreeTableItemData) {
  if (selectType === "value") {
    await filterValueOptions(searchTerm, tableItem);
  } else if (selectType === "property") {
    await filterPropertyOptions(searchTerm);
  }
}

async function filterValueOptions(searchTerm: string, tableItem: TreeTableItemData) {
  const option = { data: { valueType: tableItem.valueType } as TreeSelectOptionData } as TreeSelectOption;
  tableItem.valueOptions = await getValueSelectionTree(option, searchTerm);
}

async function filterPropertyOptions(searchTerm: string) {
  propertyOptions.value = await getPropertySelectionTree(selectedType.value["@id"], searchTerm);
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
.type-input-container,
.bpop-input-container {
  padding: 0.5rem;
}

.profile-container {
  padding-bottom: 1rem;
}
</style>
