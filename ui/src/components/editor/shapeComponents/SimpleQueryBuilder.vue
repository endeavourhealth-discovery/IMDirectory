<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="From">
        <EntityAutocomplete class="multi-select" :ttAlias="selectedFrom" :getSuggestionsMethod="getFromSuggestions" />
      </TabPanel>
      <TabPanel header="Where">
        <TreeTable :value="treeTableItems" :expandedKeys="expandedKeys">
          <!-- <Column field="operator" header="Operator" > </Column> -->
          <Column field="operator" header="Operator" :expander="true">
            <template #body="{ node }">
              <Dropdown v-model="node.data.operator" :options="logicOptions" />
            </template>
          </Column>
          <Column field="dataModel" header="Data model">
            <template #body="{ node }">
              <TreeSelect
                v-model="node.data.dataModelDisplay"
                :options="dataModelOptions"
                placeholder="Select Item"
                :lazy="true"
                @node-select="onDataModelSelect($event as TreeSelectOption, node.data)"
                @node-expand="onDatamodelExpand($event as TreeSelectOption)"
              >
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
          <!-- <Column field="property" header="Property">
            <template #body="{ node }">
              <TreeSelect v-model="selectedDataModel" :options="dataModelOptions" placeholder="Select Item" @node-select="onDataModelSelect($event, node)">
                <template #value="{ value, placeholder }">
                  <div v-if="isArrayHasLength(value) && isObjectHasKeys(value[0], ['label'])">
                    <span :style="value[0]?.style">
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
          </Column> -->
          <Column field="type" header="Type">
            <template #body="slotProps">
              {{ slotProps.node.data }}
            </template>
          </Column>

          <Column field="node" header="Node">
            <template #body="slotProps">
              {{ slotProps.node }}
            </template>
          </Column>
          <Column headerStyle="width: 10rem" headerClass="text-center" bodyClass="text-center">
            <template #body="{ node }">
              <Button type="button" icon="pi pi-plus" class="p-button-success" style="margin-right: 0.5em" @click="addLogic(node)"></Button>
              <Button type="button" icon="pi pi-times" class="p-button-danger" @click="removeLogic(node)"></Button>
            </template>
          </Column>
        </TreeTable>

        <!-- <DataTable
          :value="properties"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          selectionMode="single"
          v-model:selection="whereSelectedProperties"
          @row-reorder="onRowReorder"
          @row-select="onRowSelect"
          sortMode="single"
          sortField="logic"
          :sortOrder="1"
        >
          <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false" />
          <Column field="logic" header="Logic">
            <template #body="{ data }">
              <Dropdown v-model="data.logic" :options="logicOptions" />
            </template>
          </Column>
          <Column field="propertyName" header="Property">
            <template #body="{ data }">
              <div v-tooltip.top="data.tooltip">{{ data.label }}</div>
            </template>
          </Column>
          <Column field="propertyValue" header="Value">
            <template #body="{ data }">
              <div v-if="data.componentType === 'datatype'">
                <InputNumber v-if="data.valueType.name === 'integer'" v-model="data.value" />
                <InputText v-if="data.valueType.name === 'string'" v-model="data.value" />
                <Calendar v-if="data.valueType.name === 'Date time'" v-model="data.value" autocomplete="off" dateFormat="mm-dd-yy" />
              </div>
              <div v-else>
                <Chip v-for="value of data.value" :label="value.name" />
              </div>
            </template>
          </Column>
          <Column field="propertyDescription" header="Description" style="width: 50%">
            <template #body="{ data }">
              <div v-if="data.description">{{ data.description }}</div>
              <div v-else>No description</div>
            </template>
          </Column>
        </DataTable> -->
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
        <TestQueryResults
          v-if="showTestQueryResults"
          :showDialog="showTestQueryResults"
          :imquery="JSON.parse(editorEntity[IM.DEFINITION])"
          @close-dialog="showTestQueryResults = false"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { EntityService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import { setupEntity } from "@/views/EditorMethods";
import { useStore } from "vuex";
import { onMounted, PropType, Ref, ref, watch } from "vue";
import { computed, ComputedRef } from "@vue/reactivity";
import _ from "lodash";
import { TreeNode } from "primevue/tree";
import { getColourFromType, getFAIconFromType, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { TTAlias, TTIriRef } from "@im-library/interfaces";

const treeTableItems: Ref<TreeTableItem[]> = ref([]);
const dataModelOptions: Ref<TreeSelectOption[]> = ref([]);
const propertyOptions: Ref<TreeSelectOption[]> = ref([]);
const expandedKeys: Ref<any> = ref({});

const store = useStore();
const suggestionInfo: ComputedRef<SuggestionInfo> = computed(() => store.state.suggestionInfo);
const logicOptions = ["and", "not", "or", "-"];

const selectedFrom: Ref<TTAlias> = ref({} as TTAlias);
const fromProperties: Ref<UIProperty[]> = ref([]);
const whereSelectedProperties: Ref = ref();
const selectSelectedProperties: Ref = ref();
const showTestQueryResults: Ref<boolean> = ref(false);
const { editorEntity } = setupEntity();

onMounted(async () => await init());

watch(
  () => selectedFrom.value["@id"],
  async () => await getFromProperties(selectedFrom.value["@id"])
);

watch(
  () => _.cloneDeep(suggestionInfo.value),
  async (currentValue, oldValue) => {
    updatePropertyValue(currentValue.propertyId, currentValue.propertyValue);
  }
);

function createTreeTableItem(operator: string, parent: string): TreeTableItem {
  const data = createTreeTableItemData(operator);
  return { key: String(Math.floor(Math.random() * 1000000)), data: data, children: [] as TreeTableItem[], parent: parent } as TreeTableItem;
}

function createTreeTableItemData(operator: string): TreeTableItemData {
  return {
    operator: operator,
    dataModel: {} as TTIriRef,
    dataModelDisplay: {},
    property: {} as TTIriRef,
    propertyDisplay: {},
    value: {} as TTIriRef,
    valueDisplay: {}
  } as TreeTableItemData;
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

async function init() {
  initTreeTableItems();
  dataModelOptions.value = await getDataModelTree("http://endhealth.info/im#HealthRecordEntry");
  const mainRecords = await getFromSuggestions();
  selectedFrom.value["@id"] = mainRecords[3]["@id"];
  selectedFrom.value.name = mainRecords[3].name;
}

async function onDataModelSelect(selected: TreeSelectOption, tableItem: TreeTableItemData) {
  tableItem.dataModel["@id"] = selected.key!;
  tableItem.dataModel.name = selected.label!;

  propertyOptions.value = await getPropertySelectionTree(selected.key!);
}

function onPropertySelect(selected: TreeSelectOption, tableItem: TreeTableItemData) {
  tableItem.property["@id"] = selected.key!;
  tableItem.property.name = selected.label!;
}

async function getDataModelTree(iri: string) {
  const children = await EntityService.getEntityChildren(iri);
  return children.map(child => {
    const option = createTreeSelectOption(child["@id"], child.name, child.type, child.hasChildren);
    return option;
  });
}

async function initTreeTableItems() {
  const topLogic = createTreeTableItem("and", "");
  treeTableItems.value.push(topLogic);
  expandLogic(topLogic.key!);
}

function updatePropertyValue(propertyId: string, propertyValue: DisplayTTIriRef[]) {
  const foundProperty = fromProperties.value.find(property => property.label === propertyId);
  if (foundProperty) {
    foundProperty.value = propertyValue;
  }
}

async function getFromProperties(iri: string): Promise<UIProperty[]> {
  const properties = [];
  const bundle = await EntityService.getPartialEntityBundle(iri, [SHACL.PROPERTY]);
  for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
    properties.push(await buildUIProperty(ttProperty));
  }
  return properties;
}

async function buildUIProperty(ttProperty: TTProperty): Promise<UIProperty> {
  const label = ttProperty["http://www.w3.org/ns/shacl#path"][0].name || ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"];
  const description = await getPropertyDescription(ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"]);

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

function testQuery() {
  if (editorEntity?.value?.[IM.DEFINITION]) showTestQueryResults.value = true;
}

async function getPropertyDescription(iri: string) {
  const descriptionEntity = await EntityService.getPartialEntity(iri, [RDFS.COMMENT]);
  if (!descriptionEntity[RDFS.COMMENT]) return "No description";
  return descriptionEntity[RDFS.COMMENT];
}

async function getFromSuggestions(term?: string): Promise<TTIriRef[]> {
  let mainRecords = await EntityService.getEntityChildren("http://endhealth.info/im#MainRecordType");
  if (term) mainRecords = mainRecords.filter(record => record.name.toUpperCase().includes(term.toUpperCase()));
  return mainRecords.map(filt => {
    return { "@id": filt["@id"], name: filt.name } as TTIriRef;
  });
}

function onRowSelect(row: any) {
  const uiProperty = row.data as UIProperty;
  store.commit("updateSuggestionInfo", {
    propertyId: uiProperty.label,
    suggestionIri: uiProperty.valueType["@id"],
    propertyValue: uiProperty.value
  } as SuggestionInfo);
}

async function createTreeSelectOptionDataFromTTProperty(ttProperty: TTProperty): Promise<TreeSelectOptionData> {
  const data = {
    "@id": ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"],
    name: ttProperty["http://www.w3.org/ns/shacl#path"][0].name || ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"],
    description: await getPropertyDescription(ttProperty["http://www.w3.org/ns/shacl#path"][0]["@id"])
  } as TreeSelectOptionData;

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

function createTreeSelectOptionData(iri: string, name: string, type: TTIriRef[]): TreeSelectOptionData {
  return { "@id": iri, name: name, type: type } as TreeSelectOptionData;
}

function createTreeSelectOption(iri: string, name: string, type: TTIriRef[], hasChildren: boolean, optionData?: TreeSelectOptionData): TreeSelectOption {
  const data = optionData || createTreeSelectOptionData(iri, name, type);
  const option = {
    key: iri,
    label: name,
    icon: getFAIconFromType(type).join(" "),
    styleClass: "color:" + getColourFromType(type),
    data: data,
    leaf: !hasChildren
  } as TreeSelectOption;
  return option;
}

async function getPropertySelectionTree(iri: string): Promise<TreeSelectOption[]> {
  const options = [] as TreeSelectOption[];

  const bundle = await EntityService.getPartialEntityBundle(iri, [SHACL.PROPERTY]);
  for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
    const type = [{ "@id": RDF.PROPERTY }] as TTIriRef[];
    const data = await createTreeSelectOptionDataFromTTProperty(ttProperty);
    const option = createTreeSelectOption(data["@id"], data.name, type, data.componentType === "node", data);
    options.push(option);
  }

  return options;
}

async function onDatamodelExpand(option: TreeSelectOption) {
  option.children = await getDataModelTree(option.key!);
}

async function onPropertyExpand(option: TreeSelectOption) {
  option.children = await getPropertySelectionTree(option.data.valueType["@id"]);
}
</script>

<script lang="ts">
export interface SuggestionInfo {
  propertyId: string;
  suggestionIri: string;
  searchTerm: string;
  propertyValue: DisplayTTIriRef[];
}

export interface DisplayTTIriRef extends TTIriRef {
  types: TTIriRef[];
}

interface TTProperty {
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#class": TTIriRef[];
  "http://www.w3.org/ns/shacl#datatype": TTIriRef[];
  "http://www.w3.org/ns/shacl#node": TTIriRef[];
  "http://www.w3.org/ns/shacl#maxCount": number;
  "http://www.w3.org/ns/shacl#minCount": number;
}

interface UIProperty {
  label: string;
  tooltip: string;
  description: string;
  property: TTProperty;
  componentType: string;
  valueType: TTIriRef;
  value: any;
  logic: string;
}

interface TreeTableItemData {
  operator: string;
  dataModel: TTIriRef;
  dataModelDisplay: any;
  property: TTIriRef;
  propertyDisplay: any;
  value: TTIriRef;
  valueDisplay: any;
}

interface TreeTableItem extends TreeNode {
  data: TreeTableItemData;
  children: TreeTableItem[];
  parent: string;
}

interface TreeSelectOption extends TreeNode {
  data: TreeSelectOptionData;
  children: TreeSelectOption[];
}

interface TreeSelectOptionData extends TTIriRef {
  type: TTIriRef[];
  componentType: string;
  valueType: TTIriRef;
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
</style>
