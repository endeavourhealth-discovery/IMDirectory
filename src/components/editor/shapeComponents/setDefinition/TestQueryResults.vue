<template>
  <Dialog
    :header="queryLoading ? 'Results' : 'Results: ' + testQueryResults.length"
    v-model:visible="showDialog"
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
      <Button label="OK" icon="pi pi-check" @click="close" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Query, QueryRequest, TTIriRef } from "@/im_library/interfaces";
import { onMounted, PropType, ref, Ref } from "vue";
import { isArrayHasLength } from "@/im_library/helpers/modules/DataTypeCheckers";
import { EntityService, QueryService } from "@/im_library/services";

const queryLoading: Ref<boolean> = ref(false);

const testQueryResults: Ref<TTIriRef[]> = ref([]);

const props = defineProps({
  imquery: { type: Object as PropType<Query>, required: true },
  showDialog: { type: Boolean, required: true }
});

const emit = defineEmits({ closeDialog: () => true });

onMounted(async () => {
  if (props.imquery) await testQuery();
});

function close() {
  emit("closeDialog");
}

async function testQuery() {
  queryLoading.value = true;
  const result = await QueryService.queryIM({ query: props.imquery } as QueryRequest);
  if (isArrayHasLength(result.entities)) {
    testQueryResults.value = await EntityService.getNames(result.entities.map(entity => entity["@id"]));
  }
  queryLoading.value = false;
}
</script>

<style scoped></style>
