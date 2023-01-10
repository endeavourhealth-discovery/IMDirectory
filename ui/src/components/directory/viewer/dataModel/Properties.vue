<template>
  <div id="properties-table-container" class="properties-table-wrapper">
    <DataTable
        :value="dataModelPropsData"
        :scrollable="true"
        ref="propertiesTable"
        :loading="loading"
        scroll-height="flex"
        data-testid="table">
      <template #empty> No records found </template>
      <template #loading> Loading data. Please wait... </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>
      <Column field="propertyDisplay" header="Name" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="directService.select(slotProps.data.propertyId)" data-testid="name">
            {{ slotProps.data.propertyDisplay }}
          </div>
        </template>
      </Column>
      <Column field="typeDisplay" header="Type" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="directService.select(slotProps.data.typeId)">
            {{ slotProps.data.typeDisplay }}
          </div>
        </template>
      </Column>
      <Column field="inheritedDisplay" header="Inherited From" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="directService.select(slotProps.data.inheritedId)">
            {{ slotProps.data.inheritedDisplay }}
          </div>
        </template>
      </Column>
      <Column field="cardinality" header="Cardinality">
        <template #body="slotProps">
          {{ slotProps.data.cardinality }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelProperty, ProcessedDataModelProperty } from "@im-library/interfaces";
import { DirectService, EntityService } from "@/services";

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const directService = new DirectService();

const loading = ref(false);
const dataModelPropsData: Ref<ProcessedDataModelProperty[]> = ref([]);

const propertiesTable = ref();

watch(
  () => props.conceptIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  await getDataModelProps(props.conceptIri);
});

async function getDataModelProps(iri: string): Promise<void> {
  loading.value = true;
  const result = await EntityService.getDataModelProperties(iri);
  dataModelPropsData.value = result.map((prop: DataModelProperty) => {
    return {
      propertyId: prop.property["@id"],
      propertyName: prop.property.name,
      propertyDisplay: prop.property.name,
      typeId: prop.type ? prop.type["@id"] : "",
      typeName: prop.type ? prop.type.name : "",
      typeDisplay: prop.type ? prop.type.name || prop.type["@id"] : "",
      inheritedId: prop.inheritedFrom["@id"],
      inheritedName: prop.inheritedFrom.name,
      inheritedDisplay: prop.inheritedFrom.name || "-",
      cardinality: `${prop.minExclusive || prop.minInclusive || 0} : ${prop.maxExclusive || prop.maxInclusive || "*"}`
    };
  });
  loading.value = false;
}

function exportCSV(): void {
  propertiesTable.value.exportCSV();
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
