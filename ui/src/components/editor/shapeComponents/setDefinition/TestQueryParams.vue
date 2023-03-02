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
import { Query, QueryRequest, Argument } from "@im-library/models/AutoGen";
import AutoComplete from "primevue/autocomplete";
import { QueryService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

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

function search() {
  console.log(isArrayHasLength("test"));
}

async function run() {
  const queryRequest = { argument: [] as Argument[], query: props.imquery } as QueryRequest;

  for (const param of props.params) {
    if ("text" === param.name) {
      queryRequest.textSearch = param.value;
    } else {
      const argument = {
        parameter: param.name
      } as Argument;

      if (isArrayHasLength(param.value)) {
        argument.valueIriList = param.value;
      } else {
        argument.valueIri = param.value;
      }
      queryRequest.argument.push(argument);
    }
  }
  const results = await QueryService.queryIM(queryRequest);
  console.log(results);
  emit("onResults", results);
}
</script>

<style scoped></style>
