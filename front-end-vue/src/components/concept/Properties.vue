<template>
  <div id="properties-table-container">
    <DataTable :value="dataModelPropsData" :scrollable="true" ref="propertiesTable" :loading="loading">
      <template #empty>
        No records found
      </template>
      <template #loading>
        Loading data. Please wait...
      </template>
      <template #header>
        <div class="table-header">
          Data model properties
          <Button label="Download" @click="exportCSV()" />
        </div>
      </template>
      <Column field="propertyDisplay" header="Name" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.propertyId)">
            {{ slotProps.data.propertyDisplay }}
          </div>
        </template>
      </Column>
      <Column field="typeDisplay" header="Type" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.typeId)">
            {{ slotProps.data.typeDisplay }}
          </div>
        </template>
      </Column>
      <Column field="inheritedDisplay" header="Inherited From" :sortable="true">
        <template #body="slotProps">
          <div class="link" @click="navigate(slotProps.data.inheritedId)">
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
<script lang="ts">
import EntityService from "@/services/EntityService";
import { defineComponent } from "@vue/runtime-core";
import { RouteRecordName } from "vue-router";
import { DataModelProperty, ProcessedDataModelProperty } from "@/models/properties/DataModelProperty";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";

export default defineComponent({
  name: "Properties",
  components: {},
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri(newValue) {
      await this.getDataModelProps(newValue);
    }
  },
  data() {
    return {
      loading: false,
      dataModelPropsData: [] as ProcessedDataModelProperty[],
      scrollHeight: "500px"
    };
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
    await this.getDataModelProps(this.conceptIri);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      this.setScrollHeight();
    },

    async getDataModelProps(iri: string): Promise<void> {
      this.loading = true;
      const result = await EntityService.getDataModelProperties(iri);
      this.dataModelPropsData = result.map((prop: DataModelProperty) => {
        return {
          propertyId: prop.property["@id"],
          propertyName: prop.property.name,
          propertyDisplay: prop.property.name,
          typeId: prop.type["@id"],
          typeName: prop.type.name,
          typeDisplay: prop.type.name || prop.type["@id"],
          inheritedId: prop.inheritedFrom["@id"],
          inheritedName: prop.inheritedFrom.name,
          inheritedDisplay: prop.inheritedFrom.name || "-",
          cardinality: `${prop.minExclusive || prop.minInclusive || 0} : ${prop.maxExclusive || prop.maxInclusive || "*"}`
        };
      });
      this.loading = false;
    },

    navigate(iri: any): void {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (iri)
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: iri }
        });
    },

    setScrollHeight(): void {
      this.scrollHeight = getContainerElementOptimalHeight("properties-table-container", ["p-paginator"], false, undefined, 1);
    },

    exportCSV(): void {
      (this.$refs as any).propertiesTable.exportCSV();
    }
  }
});
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
</style>
