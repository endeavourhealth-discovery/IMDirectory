<template>
  <div id="properties-table-container" class="properties-table-wrapper">
    <DataTable :value="dataModelPropsData" :scrollable="true" ref="propertiesTable" :loading="loading" data-testid="table">
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
import { onMounted, onUnmounted, Ref, ref, watch } from "vue";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { DataModelProperty, ProcessedDataModelProperty } from "@/im_library/interfaces";
import { ContainerDimensionGetters } from "@/im_library/helpers";
import { DirectService, EntityService } from "@/im_library/services";
import { useStore } from "vuex";
const { getContainerElementOptimalHeight } = ContainerDimensionGetters;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const directService = new DirectService();

const loading = ref(false);
const dataModelPropsData: Ref<ProcessedDataModelProperty[]> = ref([]);
const scrollHeight = ref("500px");

const propertiesTable = ref();

watch(
  () => props.conceptIri,
  async newValue => getDataModelProps(newValue)
);

onMounted(async () => {
  window.addEventListener("resize", onResize);
  onResize();
  await getDataModelProps(props.conceptIri);
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  setScrollHeight();
}

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

function setScrollHeight(): void {
  scrollHeight.value = getContainerElementOptimalHeight("properties-table-container", ["p-paginator"], false, undefined, 1);
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
