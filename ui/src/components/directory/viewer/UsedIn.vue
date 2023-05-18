<template>
  <div id="usedin-table-container" class="used-in-container">
    <DataTable
      :value="usages"
      :scrollable="true"
      scrollHeight="flex"
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
      @row-select="onRowSelect"
      :lazy="true"
      @page="handlePage($event)"
      :loading="loading"
      data-testid="table"
    >
      <template #empty> No records found. </template>
      <template #loading> Loading data. Please wait. </template>
      <Column field="name" filter-field="name" header="Name">
        <template #body="{ data }: any">
          <div>
            <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" :style="'color:' + data.colour" class="p-mx-1 type-icon" />
            <span class="text-name" @mouseover="showOverlay($event, data)" @mouseleave="hideOverlay($event)">{{ data.name }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
    <OverlaySummary ref="OS" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { DirectService, EntityService } from "@/services";
import { RDF, RDFS } from "@im-library/vocabulary";
import rowClick from "@/composables/rowClick";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getColourFromType, getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";

interface Props {
  conceptIri: string;
}
const props = defineProps<Props>();

const directService = new DirectService();

const usages: Ref<any[]> = ref([]);
const loading = ref(false);
const selected: Ref = ref({});
const recordsTotal = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");
const { onRowClick }: { onRowClick: Function } = rowClick();
const OS = ref();

onMounted(async () => {
  await init();
});

watch(
  () => props.conceptIri,
  async () => await init()
);

async function init() {
  loading.value = true;
  await getUsages(props.conceptIri, currentPage.value, pageSize.value);
  loading.value = false;
  await getRecordsSize(props.conceptIri);
}

function onRowSelect(event: any) {
  onRowClick(event.data["@id"]);
}

async function getUsages(iri: string, pageIndex: number, pageSize: number): Promise<void> {
  const result = await EntityService.getEntityUsages(iri, pageIndex, pageSize);
  usages.value = result.map((usage: any) => {
    return {
      "@id": usage["@id"],
      name: usage[RDFS.LABEL],
      icon: getFAIconFromType(usage[RDF.TYPE]),
      colour: getColourFromType(usage[RDF.TYPE])
    };
  });
}

async function getRecordsSize(iri: string): Promise<void> {
  recordsTotal.value = await EntityService.getUsagesTotalRecords(iri);
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
}

async function handlePage(event: any): Promise<void> {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  await getUsages(props.conceptIri, currentPage.value, pageSize.value);
  scrollToTop();
  loading.value = false;
}

function scrollToTop(): void {
  const resultsContainer = document.getElementById("search-results-container") as HTMLElement;
  const scrollBox = resultsContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
  if (scrollBox) {
    scrollBox.scrollTop = 0;
  }
}

async function showOverlay(event: any, data: any): Promise<void> {
  await OS.value.showOverlay(event, data["@id"]);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}
</script>

<style scoped>
#usedin-table-container {
  height: 100%;
}

.type-icon {
  padding-right: 0.5rem;
}

.used-in-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
