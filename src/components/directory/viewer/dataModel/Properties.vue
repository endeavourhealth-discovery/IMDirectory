<template>
  <div id="properties-table-container" class="properties-table-wrapper">
    <div v-if="!properties.length && !groupedProperties.length && !loading">No records found</div>
    <DataTable
      :value="properties"
      :scrollable="true"
      ref="propertiesTable"
      :loading="loading"
      data-testid="ungrouped-display-table"
      rowGroupMode="subheader"
      groupRowsBy="group.name"
      sortMode="single"
      sortField="group.name"
      :sortOrder="1"
      class="ungrouped-display-table"
      :exportFilename="entityName + ' properties'"
    >
      <template #loading> Loading data. Please wait... </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>

      <Column field="property" header="Name">
        <template #body="{ data }">
          <div class="link" @click="navigate($event, data.property[0]['@id'])" data-testid="name">
            {{ data.property[0].name || data.property[0]["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }">
          <div class="link" @click="navigate($event, data.type[0]['@id'])">
            {{ data.type[0].name || data.type[0]["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="cardinality" header="Cardinality">
        <template #body="{ data }">
          {{ data.cardinality }}
        </template>
      </Column>
    </DataTable>
    <DataTable
      v-if="isArrayHasLength(groupedProperties) && isObjectHasKeys(groupedProperties[0], ['group'])"
      :value="groupedProperties"
      ref="propertiesTable"
      :loading="loading"
      data-testid="grouped-display-table"
      rowGroupMode="subheader"
      groupRowsBy="group.name"
      :expandableRowGroups="true"
      v-model:expandedRowGroups="expandedRowGroups"
      sortMode="single"
      sortField="group.name"
      :sortOrder="1"
      class="grouped-display-table"
    >
      <template #groupheader="{ data }: any">
        <span v-if="isObjectHasKeys(data, ['group'])">{{ data.group.name }}</span>
      </template>

      <Column field="group.name" header="Group">
        <template #body="{ data }: any"> {{ data.group.name }}</template>
      </Column>

      <Column field="property" header="Name">
        <template #body="{ data }: any">
          <div class="link" @click="navigate($event, data.property[0]['@id'])" data-testid="name">
            {{ data.property[0].name || data.property[0]["@id"] }}
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }: any">
          <div class="link" @click="navigate($event, data.type[0]['@id'])">
            {{ data.type[0].name || data.type[0]["@id"] }}
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
  {{ properties }} -
  <div>{{ groupedProperties }}</div>
</template>
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { PropertyDisplay } from "@/interfaces";
import { DataModelService, DirectService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { DataTableExpandedRows } from "primevue/datatable";

const props = defineProps<{
  entityIri: string;
  entityName: string;
}>();

defineEmits<{
  navigateTo: [payload: string];
}>();

const directService = new DirectService();

const loading = ref(false);
const properties: Ref<PropertyDisplay[]> = ref([]);
const groupedProperties: Ref<PropertyDisplay[]> = ref([]);
const propertiesTable = ref();
const expandedRowGroups: Ref<DataTableExpandedRows[]> = ref([]);

watch(
  () => props.entityIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  await getDataModelProps(props.entityIri);
});

async function getDataModelProps(iri: string): Promise<void> {
  loading.value = true;
  const results = await DataModelService.getPropertiesDisplay(iri);
  if (results && results.length !== 0) {
    results.forEach((result: PropertyDisplay) => {
      if (result.isOr) {
        results[results.indexOf(result)] = getProperty(result);
      }
      result.property[0].name = result.property[0].name?.slice(0, result.property[0].name?.indexOf("(")) as string;
      if (isObjectHasKeys(result, ["group"])) groupedProperties.value.push(result);
      else properties.value.push(result);
    });
  }
  loading.value = false;
}

function getProperty(result: PropertyDisplay): PropertyDisplay {
  let propId = "";
  let propName = "";
  let typeName = "";
  let typeId = "";
  result.property.forEach(p => {
    propId = `${propId}${propId !== "" ? "OR" : ""}${p["@id"]}`;
    propName = `${propName} ${propName !== "" ? "OR" : ""} ${p.name?.slice(0, p.name?.indexOf("(")) as string}`;
  });
  const ranges = Array.from(new Set(result.type?.map(type => JSON.stringify(type)))).map(item => JSON.parse(item));
  ranges.forEach(t => {
    typeId = `${typeId}${typeId !== "" ? "OR" : ""}${t["@id"]}`;
    typeName = `${typeName} ${typeName !== "" ? "OR" : ""} ${t.name as string}`;
  });
  return {
    property: [{ "@id": propId, name: propName }],
    type: [{ "@id": typeId, name: typeName }],
    cardinality: result.cardinality
  } as PropertyDisplay;
}

function navigate(event: MouseEvent, iri: string): void {
  if (!iri.includes("OR")) {
    if (event.metaKey || event.ctrlKey) {
      directService.view(iri);
    } else {
      directService.select(iri);
    }
  }
}

function exportCSV(): void {
  let csvValue;
  let allProperties = properties.value.concat(groupedProperties.value);
  if (isArrayHasLength(allProperties)) {
    csvValue = allProperties.map(property => {
      if (isObjectHasKeys(property, ["group"])) {
        return {
          group: { name: property?.group?.["@id"] },
          property: property.property[0]["@id"],
          type: property?.type?.[0]["@id"],
          cardinality: property.cardinality
        };
      } else {
        return {
          property: property.property[0]["@id"],
          type: property.type?.[0]["@id"],
          cardinality: property.cardinality
        };
      }
    });
  }
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

.grouped-display-table:deep(.p-datatable-header-cell),
.ungrouped-display-table:deep(.p-datatable-empty-message) {
  display: none;
}

.properties-table-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
