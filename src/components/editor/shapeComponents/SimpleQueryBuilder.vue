<template>
  <div class="quick-query-builder-container">
    <TabView ref="tabview1">
      <TabPanel header="From">
        <EntityAutocomplete class="multi-select" :ttAlias="selectedFrom" :getSuggestionsMethod="getFromSuggestions" />
      </TabPanel>
      <TabPanel header="Where">
        <DataTable :value="properties" responsiveLayout="scroll" class="p-datatable-sm" v-model:selection="whereSelectedProperties">
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
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
              <div v-else-if="data.componentType === 'class'">
                <EntityAutocomplete :ttAlias="data.value" />
              </div>
              <div v-else-if="data.componentType === 'node'">
                <EntityAutocomplete :ttAlias="data.value" />
              </div>
            </template>
          </Column>
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
        <TestQueryResults
          v-if="showTestQueryResults"
          :showDialog="showTestQueryResults"
          :imquery="JSON.parse(editorEntity[IM.DEFINITION])"
          @close-dialog="showTestQueryResults = false"
      /></TabPanel>
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
</script>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";

interface TTProperty {
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#class": TTIriRef[];
  "http://www.w3.org/ns/shacl#datatype": TTIriRef[];
  "http://www.w3.org/ns/shacl#node": TTIriRef[];
  "http://www.w3.org/ns/shacl#maxCount": number;
  "http://www.w3.org/ns/shacl#minCount": number;
}

const selectedFrom: Ref<TTAlias> = ref({} as TTAlias);
const properties: Ref<{ property: TTProperty; componentType: string; valueType: TTIriRef; value: any }[]> = ref([]);
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
  selectedFrom.value["@id"] = mainRecords[0]["@id"];
  selectedFrom.value.name = mainRecords[0].name;
}

async function getProperties() {
  properties.value = [];
  const bundle = await EntityService.getPartialEntityBundle(selectedFrom.value["@id"], [SHACL.PROPERTY]);
  for (const ttProperty of bundle.entity[SHACL.PROPERTY]) {
    properties.value.push(await buildUIProperty(ttProperty));
  }
}

async function buildUIProperty(ttProperty: TTProperty) {
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
      value: {} as TTAlias
    };
  if (isObjectHasKeys(ttProperty, [SHACL.NODE]))
    return {
      label: label,
      tooltip: "node: " + ttProperty["http://www.w3.org/ns/shacl#node"]?.[0]?.name,
      description: description,
      property: ttProperty,
      componentType: "node",
      valueType: ttProperty["http://www.w3.org/ns/shacl#node"][0],
      value: {} as TTAlias
    };
  if (isObjectHasKeys(ttProperty, [SHACL.DATATYPE]))
    return {
      label: label,
      tooltip: "datatype: " + ttProperty["http://www.w3.org/ns/shacl#datatype"]?.[0]?.name,
      description: description,
      property: ttProperty,
      componentType: "datatype",
      valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0],
      value: ""
    };
  return {
    label: label,
    tooltip: "datatype: " + ttProperty["http://www.w3.org/ns/shacl#datatype"]?.[0]?.name,
    description: description,
    property: ttProperty,
    componentType: "datatype",
    valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0],
    value: ""
  };
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
