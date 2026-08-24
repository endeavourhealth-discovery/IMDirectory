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
      data-testid="used-in-table"
    >
      <template #empty> No records found. </template>
      <template #loading> Loading data. Please wait. </template>
      <Column field="name" filter-field="name" header="Name">
        <template #body="{ data }: any">
          <div>
            <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" :style="'color:' + data.colour" class="p-mx-1 type-icon" />
            <span class="text-name" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay">{{ data.name }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
    <OverlaySummary ref="OS" />
  </div>
</template>
<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";

import { isTTIriRef } from "@endeavour/vue-library";
import { OverlaySummary } from "@endeavour/vue-library/components";
import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { useOverlay } from "@endeavour/vue-library/composables";
import { RDF, RDFS } from "@endeavour/vue-library/enums";
import { getColourFromType, getFAIconFromType, isArrayOf } from "@endeavour/vue-library/helpers";

import { isString } from "lodash-es";
import { DataTableRowSelectEvent } from "primevue/datatable";

import { useDirectService } from "@/composables/useDirectService";
import { EntityService } from "@/services";

interface Usage {
  iri: string;
  name: string;
  icon: string[];
  colour: string;
}

const props = defineProps<{
  entityIri: string;
}>();

defineEmits<{
  navigateTo: [payload: string];
}>();

const directService = useDirectService();

const usages: Ref<Usage[]> = ref([]);
const loading = ref(false);
const selected: Ref = ref({});
const recordsTotal = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");

const { OS, showOverlay, hideOverlay } = useOverlay();

onMounted(async () => {
  await init();
});

watch(
  () => props.entityIri,
  async () => await init()
);

async function init() {
  loading.value = true;
  await getUsages(props.entityIri, currentPage.value, pageSize.value);
  loading.value = false;
  await getRecordsSize(props.entityIri);
}

async function onRowSelect(event: DataTableRowSelectEvent<Usage>) {
  const mouseEvent = event.originalEvent as MouseEvent;
  if (mouseEvent.metaKey || mouseEvent.ctrlKey) {
    await directService.view(event.data.iri);
  } else {
    await directService.select(event.data.iri);
  }
}

async function getUsages(iri: string, pageIndex: number, pageSize: number): Promise<void> {
  const result = await EntityService.getEntityUsages(iri, pageIndex, pageSize);
  usages.value = [];
  result.forEach(usage => {
    if (isString(usage.iri) && isString(usage[RDFS.LABEL]) && isArrayOf(usage[RDF.TYPE], isTTIriRef)) {
      usages.value.push({
        iri: usage.iri,
        name: usage[RDFS.LABEL],
        icon: getFAIconFromType(usage[RDF.TYPE]),
        colour: getColourFromType(usage[RDF.TYPE])
      } satisfies Usage);
    }
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
  await getUsages(props.entityIri, currentPage.value, pageSize.value);
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
