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
        No direct members found.
        <div v-if="hasDefintion">
          <Button label="Download to see query defintion results" class="p-button-link" @click="emit('openDownloadDialog')" />
        </div>
      </template>
      <template #loading> Loading data. Please wait... </template>
      <Column field="member" header="Name">
        <template #body="{ data }: any">
          <IMViewerLink :action="'select'" :iri="data['@id']" :label="data.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { useToast } from "primevue/usetoast";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({ onOpenTab: (payload: string) => payload, navigateTo: (_payload: string) => true, openDownloadDialog: () => true });
const toast = useToast();

const hasDefintion: Ref<boolean> = ref(false);

const loading = ref(false);
const members: Ref<TTIriRef[]> = ref([]);

const menu = ref();
const templateString = ref("Displaying {first} to {last} of [Loading...] concepts");
const totalCount = ref(0);
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
  hasDefintion.value = isObjectHasKeys(entity, [IM.DEFINITION]);
}

async function getMembers(): Promise<void> {
  loading.value = true;
  const paged = await EntityService.getPartialAndTotalCount(props.entityIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = paged.result;
  totalCount.value = paged.totalCount;
  templateString.value = "Displaying {first} to {last} of {totalRecords} concepts";
  loading.value = false;
}

async function getPage(event: any) {
  loading.value = true;
  pageSize.value = event.rows;
  currentPage.value = event.page;
  let pagedNewMembers = await EntityService.getPartialAndTotalCount(props.entityIri, IM.HAS_MEMBER, currentPage.value + 1, pageSize.value);
  members.value = pagedNewMembers.result;
  loading.value = false;
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

.html-container ::v-deep(p) {
  margin-bottom: 0 !important;
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
</style>
