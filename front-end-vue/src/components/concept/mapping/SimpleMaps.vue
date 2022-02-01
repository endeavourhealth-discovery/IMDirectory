<template>
  <div id="simple-maps-table-container">
    <DataTable
      :value="data"
      :rowsPerPageOptions="[25, 50, 100]"
      :paginator="data.length > rows ? true : false"
      :rows="rows"
      rowGroupMode="subheader"
      groupRowsBy="scheme"
      sortMode="single"
      sortField="scheme"
      :sortOrder="1"
      :scrollable="true"
      showGridlines
      :scrollHeight="scrollHeight"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="Displaying {first} to {last} of {totalRecords} results"
      class="p-datatable-sm"
      id="simple-maps-table"
      @page="scrollToTop"
      :loading="loading"
    >
      <Column field="scheme" header="Scheme" />
      <Column field="name" header="Name" style="flex: 0 0 65%">
        <template #body="slotProps">
          <span
            style="width: 100%; height: 100%; display: flex; align-items: center;"
            @mouseenter="toggle($event, slotProps.data)"
            @mouseleave="toggle($event, slotProps.data)"
            >{{ slotProps.data.name }}</span
          >
        </template>
      </Column>
      <Column field="code" header="Code" style="flex: 0 0 35%; word-break: break-all;" />
      <template #groupheader="slotProps">
        <span style="font-weight: 700; color:rgba(51,153,255,0.8)">
          {{ slotProps.data.scheme }}
        </span>
      </template>
      <template #empty>
        No simple maps found.
      </template>
      <template #loading>
        Loading data. Please wait...
      </template>
    </DataTable>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { SimpleMap } from "@/models/mappings/SimpleMap";

export default defineComponent({
  name: "SimpleMaps",
  props: {
    data: {
      type: Object as () => SimpleMap,
      required: true
    }
  },
  emits: ["toggleOverlay"],
  async mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      loading: false,
      scrollHeight: "500px",
      rows: 25
    };
  },
  methods: {
    onResize(): void {
      this.setTableWidth();
    },

    setTableWidth(): void {
      const container = document.getElementById("simple-maps-table-container") as HTMLElement;
      const table = container?.getElementsByClassName("p-datatable-table")[0] as HTMLElement;
      if (table) {
        table.style.width = "100%";
      }
    },

    scrollToTop(): void {
      const tableContainer = document.getElementById("simple-maps-table-container") as HTMLElement;
      const scrollBox = tableContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
      if (scrollBox) {
        scrollBox.scrollTop = 0;
      }
    },

    toggle(event: any, data: any) {
      this.$emit("toggleOverlay", event, data);
    }
  }
});
</script>

<style scoped>
#simple-maps-table-container {
  height: 100%;
  overflow-y: auto;
}

#simple-maps-table-container ::v-deep(.p-datatable) {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
}

#simple-maps-table-container ::v-deep(.p-datatable-wrapper) {
  flex-grow: 6;
}
</style>
