<template>
  <Dialog
    :header="queryLoading ? 'Results' : 'Results: ' + params.length"
    v-model:visible="internalShowDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div v-for="param in params">
      <div v-if="'string' === param.type">{{ param.name }}: <InputText v-tooltip="param.desc" type="text" v-model="param.value" /></div>
      <div v-else-if="'IrirRef' === param.type">{{ param.name }} : <AutoComplete v-tooltip="param.desc" v-model="param.value" @complete="search" /></div>
    </div>
    {{ props.params }}
    <template #footer>
      <Button label="Cancel" icon="fa-duotone fa-ban" @click="close" class="p-button-secondary" />
      <Button label="Run" icon="pi pi-check" @click="run" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { PropType, ref, Ref } from "vue";
import { Query, QueryRequest } from "@im-library/models/AutoGen";
import AutoComplete from "primevue/autocomplete";
import { QueryService } from "@/services";

const queryLoading: Ref<boolean> = ref(false);

const props = defineProps({
  params: { type: Object as PropType<{ name: string; desc: string; type: string; minCount: number; maxCount: number; value: any }[]>, required: true },
  imquery: { type: Object as PropType<Query>, required: true },
  showDialog: { type: Boolean, required: true }
});

const emit = defineEmits({ closeDialog: () => true, onResults: (payload: any) => payload });
const internalShowDialog = ref(true);

function close() {
  emit("closeDialog");
}

function search() {}

async function run() {
  const queryString = JSON.stringify(props.imquery);
  for (const param of props.params) {
    queryString.replaceAll("$" + param.name, param.value);
  }
  const results = await QueryService.queryIM({ query: JSON.parse(queryString) } as QueryRequest);
  console.log(results);
  emit("onResults", results);
}
</script>

<style scoped></style>
