<template>
  <Dialog
    header="Parameters"
    v-model:visible="internalShowDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div v-for="param in params">
      <div v-if="'string' === param.type" class="parameter-input">{{ param.name }}: <InputText v-tooltip="param.desc" type="text" v-model="param.value" /></div>
      <div v-else-if="'IrirRef' === param.type">
        {{ param.name }} :
        <AutoComplete
          :multiple="param.maxCount > 1"
          v-tooltip="param.desc"
          :suggestions="suggestions"
          option-label="name"
          v-model="param.value"
          @complete="debounceForSearch"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-duotone fa-ban" @click="close" severity="secondary" />
      <Button label="Run" icon="pi pi-check" @click="run" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { PropType, ref, Ref, computed, ComputedRef } from "vue";
import { QueryRequest, Argument, TTIriRef } from "@im-library/interfaces/AutoGen";
import AutoComplete from "primevue/autocomplete";
import { EntityService } from "@/services";
import { isArrayHasLength, isObject } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { useFilterStore } from "@/stores/filterStore";

const filterStore = useFilterStore();
const controller: Ref<AbortController> = ref({} as AbortController);

const queryLoading: Ref<boolean> = ref(false);
const debounce = ref(0);
const filterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);
const suggestions: Ref<ConceptSummary[]> = ref([]);

interface Props {
  params: { name: string; desc: string; type: string; minCount: number; maxCount: number; value: any }[];
  queryRequest: QueryRequest;
  showDialog: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({ closeDialog: () => true, onParamsPopulated: () => true });
const internalShowDialog = ref(true);

function close() {
  emit("closeDialog");
}

async function search(searchTerm: any) {
  if (!isObject(controller.value)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, controller.value);
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}

async function run() {
  props.queryRequest.argument = [];
  for (const param of props.params) {
    if ("text" === param.name) {
      if (param.value) props.queryRequest.textSearch = param.value;
    } else {
      const argument = {
        parameter: param.name
      } as Argument;

      if (isArrayHasLength(param.value)) {
        argument.valueIriList = (param.value as []).map((summary: ConceptSummary) => {
          return { "@id": summary.iri, name: summary.name } as TTIriRef;
        });
      } else {
        argument.valueIri = { "@id": param.value.iri, name: param.value.name } as TTIriRef;
      }
      props.queryRequest.argument.push(argument);
    }
  }
  emit("onParamsPopulated");
}
</script>

<style scoped>
.parameter-input {
  padding-top: 0.2rem;
}
</style>
