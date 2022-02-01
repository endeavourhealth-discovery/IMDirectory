<template>
  <div id="usedin-table-container">
    <DataTable
      :value="usages"
      :scrollable="true"
      :scrollHeight="scrollHeight"
      showGridlines
      class="p-datatable-sm"
      :totalRecords="recordsTotal ? recordsTotal : usages.length"
      :rowsPerPageOptions="[25, 50, 100]"
      :rows="25"
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :currentPageReportTemplate="templateString"
      selectionMode="single"
      v-model:selection="selected"
      @click="handleSelected"
      :lazy="true"
      @page="handlePage($event)"
      :loading="loading"
    >
      <template #empty>
        No records found.
      </template>
      <template #loading>
        Loading data. Please wait.
      </template>
      <Column field="name" filter-field="name" header="Name">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script lang="ts">
import EntityService from "@/services/EntityService";
import { defineComponent } from "@vue/runtime-core";
import { TTIriRef } from "@/models/TripleTree";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";

export default defineComponent({
  name: "UsedIn",
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri() {
      await this.init();
    }
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    await this.init();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      usages: [] as TTIriRef[],
      loading: false,
      selected: {} as TTIriRef,
      recordsTotal: 0,
      currentPage: 0,
      pageSize: 25,
      scrollHeight: "500px",
      templateString: "Displaying {first} to {last} of [Loading...] concepts"
    };
  },
  methods: {
    async init() {
      this.loading = true;
      await this.getUsages(this.conceptIri, this.currentPage, this.pageSize);
      this.setScrollHeight();
      this.loading = false;
      await this.getRecordsSize(this.conceptIri);
    },

    async getUsages(iri: string, pageIndex: number, pageSize: number): Promise<void> {
      this.usages = await EntityService.getEntityUsages(iri, pageIndex, pageSize);
    },

    async getRecordsSize(iri: string): Promise<void> {
      this.recordsTotal = await EntityService.getUsagesTotalRecords(iri);
      this.templateString = "Displaying {first} to {last} of {totalRecords} concepts";
    },

    async handlePage(event: any): Promise<void> {
      this.loading = true;
      this.pageSize = event.rows;
      this.currentPage = event.page;
      await this.getUsages(this.conceptIri, this.currentPage, this.pageSize);
      this.scrollToTop();
      this.loading = false;
    },

    handleSelected(): void {
      if (isObjectHasKeys(this.selected, ["@id"])) {
        this.$router.push({
          name: "Concept",
          params: { selectedIri: this.selected["@id"] }
        });
      }
    },

    scrollToTop(): void {
      const resultsContainer = document.getElementById("search-results-container") as HTMLElement;
      const scrollBox = resultsContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
      if (scrollBox) {
        scrollBox.scrollTop = 0;
      }
    },

    onResize(): void {
      this.setScrollHeight();
    },

    setScrollHeight(): void {
      this.scrollHeight = getContainerElementOptimalHeight("usedin-table-container", ["p-paginator"], false, undefined, 1);
    }
  }
});
</script>

<style scoped>
#usedin-table-container {
  height: 100%;
}

/* #usedin-table-container ::v-deep(.p-datatable) {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
}

#usedin-table-container ::v-deep(.p-datatable-wrapper) {
  flex-grow: 6;
} */
</style>
