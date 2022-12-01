<template>
  <Card id="main-container">
    <template #title>Quick query builder</template>
    <template #content>
      <h5>Select</h5>
      From: <EntityAutocomplete inputId="integeronly" :ttAlias="selectedFrom" :getSuggestionsMethod="getFromSuggestions" />
      <h5>Where</h5>
      <div v-for="property of properties" class="where-clause">
        {{ property.property["http://www.w3.org/ns/shacl#path"][0].name || property.property["http://www.w3.org/ns/shacl#path"][0]["@id"] }}:
        <div v-if="property.componentType === 'datatype'">
          <InputNumber v-if="property.valueType.name === 'integer'" v-model="property.value" />
          <InputText v-if="property.valueType.name === 'string'" v-model="property.value" />
          <Calendar v-if="property.valueType.name === 'Date time'" v-model="property.value" autocomplete="off" dateFormat="mm-dd-yy" />
          {{ property.property["http://www.w3.org/ns/shacl#datatype"]?.[0]?.name + " - datatype" }}
        </div>
        <div v-else-if="property.componentType === 'class'">
          <EntityAutocomplete :ttAlias="property.value" />
          {{ property.property["http://www.w3.org/ns/shacl#class"]?.[0]?.name + " - class" }}
        </div>
        <div v-else-if="property.componentType === 'node'">
          <EntityAutocomplete :ttAlias="property.value" />
          {{ property.property["http://www.w3.org/ns/shacl#node"]?.[0]?.name + " - node" }}
        </div>
      </div>
    </template>
    <template #footer><Button @click="runQuery">Run</Button></template>
  </Card>
</template>

<script lang="ts">
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { EntityService, QueryService } from "@/im_library/services";
import { TTAlias, TTIriRef } from "@/im_library/interfaces";
import { SHACL } from "@/im_library/vocabulary";
import { isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
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
    properties.value.push(buildUIProperty(ttProperty));
  }
}

function buildUIProperty(ttProperty: TTProperty) {
  if (isObjectHasKeys(ttProperty, [SHACL.CLASS]))
    return { property: ttProperty, componentType: "class", valueType: ttProperty["http://www.w3.org/ns/shacl#class"][0], value: {} as TTAlias };
  if (isObjectHasKeys(ttProperty, [SHACL.NODE]))
    return { property: ttProperty, componentType: "node", valueType: ttProperty["http://www.w3.org/ns/shacl#node"][0], value: {} as TTAlias };
  if (isObjectHasKeys(ttProperty, [SHACL.DATATYPE]))
    return { property: ttProperty, componentType: "datatype", valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0], value: "" };
  return { property: ttProperty, componentType: "datatype", valueType: ttProperty["http://www.w3.org/ns/shacl#datatype"][0], value: "" };
}

async function getFromSuggestions(term?: string): Promise<TTIriRef[]> {
  let mainRecords = await EntityService.getEntityChildren("http://endhealth.info/im#MainRecordType");
  if (term) mainRecords = mainRecords.filter(record => record.name.toUpperCase().includes(term.toUpperCase()));
  return mainRecords.map(filt => {
    return { "@id": filt["@id"], name: filt.name };
  });
}

async function runQuery() {}
</script>

<style scoped>
#main-container {
  width: 100%;
  height: 100vh;
  overflow: auto;
  padding: 0 1rem;
  display: flex;
  flex-flow: column;
}

.where-clause {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
