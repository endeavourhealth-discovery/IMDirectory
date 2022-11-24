<template>
  <div id="usedin-table-container" class="used-in-container">
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
      @row-select="onRowSelect"
      :lazy="true"
      @page="handlePage($event)"
      :loading="loading"
      data-testid="table"
    >
      <template #empty> No records found. </template>
      <template #loading> Loading data. Please wait. </template>
      <Column field="name" filter-field="name" header="Name">
        <template #body="{ data }">
          <span :style="'color:' + data.colour" class="p-mx-1 type-icon">
            <i :class="data.icon" aria-hidden="true" />
          </span>
          <span class="text-name">{{ data.name }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { DataTypeCheckers, ContainerDimensionGetters, ConceptTypeMethods } from "@/im_library/helpers";
import { DirectService, EntityService } from "@/im_library/services";
import { RDF, RDFS } from "@/im_library/vocabulary";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
const { isObjectHasKeys } = DataTypeCheckers;
const { getContainerElementOptimalHeight } = ContainerDimensionGetters;
const { getColourFromType, getFAIconFromType } = ConceptTypeMethods;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const router = useRouter();
const store = useStore();
const route = useRoute();
const directService = new DirectService(store, router, route);

const usages: Ref<any[]> = ref([]);
const loading = ref(false);
const selected: Ref = ref({});
const recordsTotal = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);
const scrollHeight = ref("500px");
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");

onMounted(async () => {
  window.addEventListener("resize", onResize);
  await init();
});

onUnmounted(() => window.removeEventListener("resize", onResize));

watch(
  () => props.conceptIri,
  async () => await init()
);

async function init() {
  loading.value = true;
  await getUsages(props.conceptIri, currentPage.value, pageSize.value);
  setScrollHeight();
  loading.value = false;
  await getRecordsSize(props.conceptIri);
}

function onRowSelect(event: any) {
  directService.select(event.data["@id"]);
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

function onResize(): void {
  setScrollHeight();
}

function setScrollHeight(): void {
  scrollHeight.value = getContainerElementOptimalHeight("usedin-table-container", ["p-paginator"], false, undefined, 1);
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
