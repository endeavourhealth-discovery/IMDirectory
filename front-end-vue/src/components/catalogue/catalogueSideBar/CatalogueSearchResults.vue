<template>
  <div id="catalogue-search-results-container">
    <DataTable
      v-model:selection="selected"
      :value="searchResults"
      @row-select="setSelectedInstance"
      selectionMode="single"
      class="p-datatable-sm"
      :scrollable="true"
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :rowsPerPageOptions="[25, 50, 75]"
      currentPageReportTemplate="Displaying {first} to {last} of {totalRecords}"
      :rows="25"
      @page="scrollToTop"
      :loading="loading"
    >
      <template #empty>None</template>
      <template #loading>Loading...</template>
      <Column field="name" header="Results">
        <template #body="slotProps">
          <div v-if="slotProps.data.name">
            <span>{{ slotProps.data.name }}</span>
          </div>
          <div v-else>
            <span>{{ slotProps.data["@id"] }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { InstanceSearchResult } from "@/models/catalogue/InstanceSearchResult";
import { defineComponent, PropType } from "@vue/runtime-core";

export default defineComponent({
  name: "CatalogueSearchResults",
  props: { searchResults: { type: Array as PropType<InstanceSearchResult[]> }, loading: { type: Boolean, required: true } },
  emits: { searchResultSelected: (payload: InstanceSearchResult) => true },
  data() {
    return {
      selected: {} as InstanceSearchResult
    };
  },
  methods: {
    setSelectedInstance(): void {
      if (isObjectHasKeys(this.selected, ["@id"])) {
        this.$emit("searchResultSelected", this.selected);
        this.$router.push({
          name: "Individual",
          params: { selectedIri: this.selected["@id"] }
        });
      }
    },

    scrollToTop(): void {
      const resultsContainer = document.getElementById("catalogue-search-results-container") as HTMLElement;
      const scrollBox = resultsContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
      if (scrollBox) {
        scrollBox.scrollTop = 0;
      }
    }
  }
});
</script>

<style scoped>
#catalogue-search-results-container {
  flex-grow: 5;
  overflow-y: auto;
}

#catalogue-search-results-container ::v-deep(.p-datatable) {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}

#catalogue-search-results-container ::v-deep(.p-datatable-wrapper) {
  flex-grow: 6;
}
</style>
