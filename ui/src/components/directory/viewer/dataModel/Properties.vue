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
</template>
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { PropertyDisplay } from "@im-library/interfaces";
import { DirectService, EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const directService = new DirectService();

const loading = ref(false);
const properties: Ref<any[]> = ref([]);
const propertiesTable = ref();
const expandedRowGroups = ref();

watch(
  () => props.entityIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  await getDataModelProps(props.entityIri);
});

async function getDataModelProps(iri: string): Promise<void> {
  loading.value = true;
  const results = await EntityService.getPropertiesDisplay(iri);
  if (results && results.length !== 0) {
    results.forEach((result: PropertyDisplay) => {
      if (result.isOr) {
        results[results.indexOf(result)] = getProperty(result);
      }
      result.property[0].name = result.property[0].name?.slice(0, result.property[0].name?.indexOf("(")) as string;
    });
  }
  properties.value = results;
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
  const ranges = (Array.from(new Set((result.type as any)?.map(JSON.stringify))) as any).map(JSON.parse);
  ranges.forEach((t: any) => {
    typeId = `${typeId}${typeId !== "" ? "OR" : ""}${t["@id"]}`;
    typeName = `${typeName} ${typeName !== "" ? "OR" : ""} ${t.name as string}`;
  });
  return {
    property: [{ "@id": propId, name: propName }],
    type: [{ "@id": typeId, name: typeName }],
    cardinality: result.cardinality
  } as PropertyDisplay;
}

function navigate(event: MouseEvent, iri: any): void {
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
  const hasGroup = isArrayHasLength(properties.value) && isObjectHasKeys(properties.value[0], ["group"]);

  csvValue = hasGroup
    ? properties.value.map(property => {
        return {
          group: { name: property.group["@id"] },
          property: property.property[0]["@id"],
          type: property.type[0]["@id"],
          cardinality: property.cardinality
        };
      })
    : properties.value.map(property => {
        return {
          property: property.property[0]["@id"],
          type: property.type[0]["@id"],
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
