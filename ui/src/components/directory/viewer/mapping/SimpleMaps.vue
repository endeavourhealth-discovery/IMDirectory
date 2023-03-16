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
      data-testid="mapTable"
    >
      <Column field="scheme" header="Scheme" />
      <Column field="name" header="Name" style="flex: 0 0 65%">
        <template #body="slotProps">
          <span
            data-testid="col-name"
            style="width: 100%; height: 100%; display: flex; align-items: center"
            @mouseenter="toggle($event, slotProps.data)"
            @mouseleave="toggle($event, slotProps.data)"
            >{{ slotProps.data.name }}</span
          >
        </template>
      </Column>
      <Column field="code" header="Code" style="flex: 0 0 35%; word-break: break-all" data-testid="col-code" />
      <template #groupheader="slotProps">
        <span style="font-weight: 700; color: rgba(51, 153, 255, 0.8)" data-testid="col-scheme">
          {{ slotProps.data.scheme }}
        </span>
      </template>
      <template #empty> No simple maps found. </template>
      <template #loading> Loading data. Please wait... </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { SimpleMap } from "@im-library/interfaces";

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const emit = defineEmits({
  toggleOverlay: (event: any, data: SimpleMap) => true
});

const loading = ref(false);
const scrollHeight = ref("500px");
const rows = ref(25);

onMounted(() => {
  window.addEventListener("resize", onResize);
  onResize();
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize(): void {
  setTableWidth();
}

function setTableWidth(): void {
  const container = document.getElementById("simple-maps-table-container") as HTMLElement;
  const table = container?.getElementsByClassName("p-datatable-table")[0] as HTMLElement;
  if (table) {
    table.style.width = "100%";
  }
}

function scrollToTop(): void {
  const tableContainer = document.getElementById("simple-maps-table-container") as HTMLElement;
  const scrollBox = tableContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
  if (scrollBox) {
    scrollBox.scrollTop = 0;
  }
}

function toggle(event: any, data: any) {
  emit("toggleOverlay", event, data);
}
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
