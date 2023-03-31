<template>
  <Dialog
    :header="queryLoading ? 'Results' : 'Results: ' + testQueryResults.length"
    v-model:visible="internalShowDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div v-if="queryLoading" class="flex flex-row justify-contents-center align-items-center">
      <ProgressSpinner />
    </div>
    <div v-else-if="!queryLoading && isArrayHasLength(testQueryResults)">
      <div v-for="iriRef of testQueryResults">
        <IMViewerLink :iri="iriRef['@id']" :label="iriRef.name" />
      </div>
    </div>
    <div v-else>No concepts found</div>
    <template #footer>
      <Button label="Download" icon="pi pi-download" @click="exportCSV" severity="help" />
      <Button label="OK" icon="pi pi-check" @click="close" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, Ref } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityService, QueryService } from "@/services";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import setupDownloadFile from "@/composables/downloadFile";
import { byName } from "@im-library/helpers/Sorters";
import { QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

const toast = useToast();

const queryLoading: Ref<boolean> = ref(false);
const { downloadFile } = setupDownloadFile(window, document);
const testQueryResults: Ref<TTIriRef[]> = ref([]);

const props = defineProps({
  queryRequest: { type: Object as PropType<QueryRequest>, required: true },
  showDialog: { type: Boolean, required: true },
  results: { type: Array as PropType<TTIriRef[]>, required: false }
});

const emit = defineEmits({ closeDialog: () => true });
const internalShowDialog = ref(true);

onMounted(async () => {
  if (props.queryRequest) await testQuery();
});

function close() {
  emit("closeDialog");
}

async function testQuery() {
  queryLoading.value = true;
  try {
    const result = await QueryService.queryIM(props.queryRequest, undefined, true);
    if (isObjectHasKeys(result, ["entities"]) && isArrayHasLength(result.entities)) {
      const results = await EntityService.getNames(result.entities.map(entity => entity["@id"]));
      if (results) testQueryResults.value = results.sort(byName);
    }
  } catch (error: any) {
    if (error?.response?.data) toast.add(new ToastOptions(ToastSeverity.ERROR, "An error occurred: " + error?.response?.data.debugMessage));
    else throw error;
  }

  queryLoading.value = false;
}

function exportCSV(): void {
  const heading = ["name", "iri"].join(",");
  const body = testQueryResults.value.map((row: any) => '"' + [row.name, row["@id"]].join('","') + '"').join("\n");
  const csv = [heading, body].join("\n");
  downloadFile(csv, "results.csv");
}
</script>

<style scoped></style>
