<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="From">
        <EntityAutocomplete class="multi-select" :ttAlias="selectedFrom" :getSuggestionsMethod="getFromSuggestions" />
      </TabPanel>
      <TabPanel header="Where">
        <DataTable
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
          <Column>
            <template #body="{ data }"> {{ data.value }} </template>
          </Column>
          <!-- <Column field="propertyValue" header="Value">
            <template #body="{ data }">
              <div v-if="data.componentType === 'datatype'">
                <InputNumber v-if="data.valueType.name === 'integer'" v-model="data.value" />
                <InputText v-if="data.valueType.name === 'string'" v-model="data.value" />
                <Calendar v-if="data.valueType.name === 'Date time'" v-model="data.value" autocomplete="off" dateFormat="mm-dd-yy" />
              </div>
              <div v-else-if="data.componentType === 'class'">
                <EntityAutocomplete
                  :property-label="data.label"
                  :tt-alias="data.value"
                  :suggestion-tree-iri="data.valueType['@id']"
                  @search-term-updated="onSearchTermUpdate"
                />
              </div>
              <div v-else-if="data.componentType === 'node'">
                <EntityAutocomplete
                  :property-label="data.label"
                  :tt-alias="data.value"
                  :suggestion-tree-iri="data.valueType['@id']"
                  @search-term-updated="onSearchTermUpdate"
                />
              </div>
            </template>
          </Column> -->
          <Column field="propertyDescription" header="Description" style="width: 50%">
            <template #body="{ data }">
              <div v-if="data.description">{{ data.description }}</div>
              <div v-else>No description</div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
      <TabPanel header="Select">
        <MultiSelect
          class="multi-select"
          v-model="selectSelectedProperties"
          :options="properties"
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

<script lang="ts">
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { EntityService } from "@/im_library/services";
import { TTAlias, TTIriRef } from "@/im_library/interfaces";
import { IM, RDFS, SHACL } from "@/im_library/vocabulary";
import { isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import { setupEntity } from "@/views/EditorMethods";
import { useStore } from "vuex";
</script>

<script setup lang="ts">
import { onMounted, PropType, Ref, ref, watch } from "vue";

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

const store = useStore();
const logicOptions = ["and", "not", "or", "-"];

const selectedFrom: Ref<TTAlias> = ref({} as TTAlias);
const properties: Ref<UIProperty[]> = ref([]);
const whereSelectedProperties: Ref = ref();
const selectSelectedProperties: Ref = ref();
const showTestQueryResults: Ref<boolean> = ref(false);
const { editorEntity } = setupEntity();

onMounted(async () => await init());

watch(
  () => selectedFrom.value["@id"],
  async () => await getProperties()
);

async function init() {
  const mainRecords = await getFromSuggestions();
  selectedFrom.value["@id"] = mainRecords[3]["@id"];
  selectedFrom.value.name = mainRecords[3].name;
}

function onRowReorder(event: any) {
  properties.value = event.value;
}

function onSearchTermUpdate(searchTermUpdate: { propertyLabel: string; searchTerm: string }) {
  store.commit("updateSuggestionTreeTerm", searchTermUpdate.searchTerm);
}

async function getProperties() {
  properties.value = [];
  const bundle = await EntityService.getPartialEntityBundle(selectedFrom.value["@id"], [SHACL.PROPERTY]);
  for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
    properties.value.push(await buildUIProperty(ttProperty));
  }
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
    return { "@id": filt["@id"], name: filt.name };
  });
}

function onRowSelect(row: any) {
  // (row.data as UIProperty).valueType["@id"];
  console.log(row.data as UIProperty);
  console.log((row.data as UIProperty).valueType["@id"]);

  store.commit("updateSuggestionTreeTerm", "");
  store.commit("updateSuggestionTreeIri", (row.data as UIProperty).valueType["@id"]);
  // console.log(row);
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
