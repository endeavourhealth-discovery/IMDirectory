<template>
  <div id="properties-table-container" class="properties-table-wrapper">
    <DataTable
      v-if="isArrayHasLength(properties) && isObjectHasKeys(properties[0], ['group'])"
      :value="properties"
      :scrollable="true"
      ref="propertiesTable"
      :loading="loading"
      scroll-height="flex"
      data-testid="table"
      rowGroupMode="subheader"
      groupRowsBy="group.name"
      :expandableRowGroups="true"
      v-model:expandedRowGroups="expandedRowGroups"
      sortMode="single"
      sortField="group.name"
      :sortOrder="1"
    >
      <template #empty> No records found </template>
      <template #loading> Loading data. Please wait... </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>

      <template #groupheader="{ data }: any">
        <span v-if="isObjectHasKeys(data, ['group'])">{{ data.group.name }}</span>
      </template>

      <Column field="group.name" header="Group">
        <template #body="{ data }: any"> {{ data.group.name }}</template>
      </Column>

      <Column field="property" header="Name">
        <template #body="{ data }: any">
          <div class="link" @click="directService.select(data.property['@id'])" data-testid="name">
            {{ data.property.name || data.property["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }: any">
          <div class="link" @click="directService.select(data.type['@id'])">
            {{ data.type.name || data.type["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="cardinality" header="Cardinality">
        <template #body="{ data }: any">
          {{ data.cardinality }}
        </template>
      </Column>
    </DataTable>

    <DataTable v-else :value="properties" :scrollable="true" ref="propertiesTable" :loading="loading" scroll-height="flex" data-testid="table">
      <template #empty> No records found </template>
      <template #loading> Loading data. Please wait... </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>

      <Column field="property" header="Name">
        <template #body="{ data }: any">
          <div class="link" @click="directService.select(data.property['@id'])" data-testid="name">
            {{ data.property.name || data.property["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }: any">
          <div class="link" @click="directService.select(data.type['@id'])">
            {{ data.type.name || data.type["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="cardinality" header="Cardinality">
        <template #body="{ data }: any">
          {{ data.cardinality }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { PropertyDisplay } from "@im-library/interfaces";
import { DirectService, EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const props = defineProps({
  conceptIri: { type: String, required: true }
});
const directService = new DirectService();
const loading = ref(false);
const properties: Ref<PropertyDisplay[]> = ref([]);
const propertiesTable = ref();
const expandedRowGroups = ref();

watch(
  () => props.conceptIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  await getDataModelProps(props.conceptIri);
});

async function getDataModelProps(iri: string): Promise<void> {
  loading.value = true;
  properties.value = await EntityService.getPropertiesDisplay(iri);
  loading.value = false;
}

function exportCSV(): void {
  let csvValue;
  const hasGroup = isArrayHasLength(properties.value) && isObjectHasKeys(properties.value[0], ["group"]);

  csvValue = hasGroup
    ? properties.value.map(property => {
        return {
          group: { name: property.group["@id"] },
          property: property.property["@id"],
          type: property.type["@id"],
          cardinality: property.cardinality
        };
      })
    : properties.value.map(property => {
        return {
          property: property.property["@id"],
          type: property.type["@id"],
          cardinality: property.cardinality
        };
      });
  propertiesTable.value.exportCSV({}, csvValue);
}
</script>

<style scoped>
#properties-table-container {
  height: 100%;
}

div.link {
  cursor: pointer;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.properties-table-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
