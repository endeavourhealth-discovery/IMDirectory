<template>
  <div id="simple-maps-table-container">
    <DataTable
      id="simple-maps-table"
      :loading="loading"
      :paginator="data.length > rows ? true : false"
      :rows="rows"
      :rowsPerPageOptions="[25, 50, 100]"
      :scrollHeight="scrollHeight"
      :scrollable="true"
      :sortOrder="1"
      :value="data"
      class="p-datatable-sm"
      currentPageReportTemplate="Displaying {first} to {last} of {totalRecords} results"
      data-testid="mapTable"
      groupRowsBy="scheme"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      rowGroupMode="subheader"
      showGridlines
      sortField="scheme"
      sortMode="single"
      @page="scrollToTop"
    >
      <Column field="scheme" header="Scheme" />
      <Column field="name" header="Name" style="flex: 0 0 65%">
        <template #body="{ data }: any">
          <span
            class="cursor-pointer"
            data-testid="col-name"
            style="width: 100%; height: 100%; display: flex; align-items: center"
            @click="select(data.iri)"
            @mouseenter="toggle($event, data)"
            @mouseleave="toggle($event, data)"
            >{{ data.name }}
          </span>
        </template>
      </Column>
      <Column data-testid="col-code" field="code" header="Code" style="flex: 0 0 35%; word-break: break-all" />
      <template #groupheader="{ data }: any">
        <span data-testid="col-scheme" style="font-weight: 700; color: rgba(51, 153, 255, 0.8)">
          {{ data.scheme }}
        </span>
      </template>
      <template #empty> No simple maps found.</template>
      <template #loading> Loading data. Please wait...</template>
    </DataTable>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { SimpleMap } from "@/interfaces";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggleOverlay: [payload: { event: any; data: SimpleMap }];
  navigateTo: [payload: string];
}>();

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
  emit("toggleOverlay", { event: event, data: data });
}

function select(iri: string) {
  emit("navigateTo", iri);
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
