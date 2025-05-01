<template>
  <div id="members-table-container">
    <DataTable
      :value="members"
      showGridlines
      :scrollable="true"
      sortMode="single"
      sortField="label"
      :sortOrder="1"
      class="p-datatable-sm"
      scrollHeight="flex"
      :loading="loading"
      data-testid="table"
      :lazy="true"
      :paginator="true"
      :rowsPerPageOptions="[25, 50, 100]"
      :rows="25"
      :totalRecords="totalCount"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :currentPageReportTemplate="templateString"
      @page="getPage($event)"
    >
      <template #empty>
        No direct or entailed members found.
        <div v-if="hasDefinition">
          <Button label="Download to see query definition results" class="p-button-link" @click="emit('openDownloadDialog')" />
        </div>
      </template>
      <template #loading> Loading data. Please wait... </template>
      <Column field="member" header="Name">
        <template #body="{ data }: any">
          <span v-if="data.exclude" class="exclude">Exclude</span>
          <IMViewerLink :action="'select'" :iri="data['@id']" :label="data.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          <span class="entailment" v-html="getEntailment(data)"></span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { Node } from "@/interfaces/AutoGen";
import { EntityService, SetService } from "@/services";
import { IM } from "@/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

const props = defineProps<{
  entityIri: string;
}>();

const emit = defineEmits<{
  onOpenTab: [payload: string];
  navigateTo: [payload: string];
  openDownloadDialog: [];
}>();

const hasDefinition: Ref<boolean> = ref(false);
const loading = ref(false);
const members: Ref<Node[] | undefined> = ref([]);
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");
const totalCount: Ref<number | undefined> = ref(0);
const currentPage = ref(0);
const pageSize = ref(25);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  await getMembers();
  await setHasDefinition();
}

async function setHasDefinition() {
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.DEFINITION]);
  hasDefinition.value = isObjectHasKeys(entity, [IM.DEFINITION]);
}

async function getMembers(): Promise<void> {
  loading.value = true;
  const paged = await SetService.getMembers(props.entityIri, true, currentPage.value + 1, pageSize.value);
  members.value = paged.result;
  totalCount.value = paged.totalCount;
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
  loading.value = false;
}

async function getPage(event: any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  const pagedNewMembers = await SetService.getMembers(props.entityIri, true, currentPage.value + 1, pageSize.value);
  members.value = pagedNewMembers.result;
  loading.value = false;
}

function getEntailment(data: any) {
  if (data.descendantsOrSelfOf) return "(+ subtypes)";
  if (data.descendantsOf) return "(subtypes of only)";
  if (data.ancestorsOf) return "(+ supertypes)";
  return "";
}
</script>
<style scoped>
#members-table-container {
  height: 100%;
  width: 100%;
}

#members-table-container:deep(td) {
  width: 100%;
  overflow: auto;
  word-break: break-all;
}

#members-table-container:deep(.p-datatable) {
  width: 100%;
  height: 100%;
}

#members-table-container:deep(.p-datatable-table) {
  width: 100%;
}

#members-table-container:deep(.p-datatable-wrapper) {
  height: auto;
  flex: 0 1 auto;
}
#members-table-container:deep(.exclude) {
  color: var(--p-red-500);
  padding-right: 0.3rem;
}

.custom-button span {
  flex: 1 1 auto;
  display: block;
  width: 100%;
  height: 100%;
}

.custom-button span:before,
.custom-button span:after {
  position: absolute;
  content: "";
  background: steelblue;
}
.custom-button span:before {
  left: 0;
  top: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:after {
  right: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:hover:before {
  width: 100%;
}
.custom-button span:hover:after {
  width: 100%;
}

.entailment {
  padding-left: 0.2rem;
}
</style>
