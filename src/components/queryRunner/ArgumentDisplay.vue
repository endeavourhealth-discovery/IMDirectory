<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Argument values"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="argument-selector"
    :pt="{ content: { class: 'flex-auto' } }"
  >
    <DataTable :value="arguments" :lazy="true" :loading="loading">
      <Column field="parameter" header="Parameter">
        <template #body="{ data }">{{ formatArgumentDisplayName(data) }}</template>
      </Column>
      <Column field="parameter" header="Raw Parameter"></Column>
      <Column v-if="includeIri" field="referenceIri.iri" header="Reference Iri"></Column>
      <Column field="valueData" header="Value">
        <template #body="{ data }">{{ formatArgumentDisplayName(data) }}</template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { Argument } from "@/interfaces/AutoGen";
import { onMounted, ref } from "vue";
import Column from "primevue/column";

interface Props {
  arguments: any[] | undefined;
}

const props = defineProps<Props>();

const showDialog = defineModel<boolean>("showDialog");

const loading = ref(false);
const includeIri = ref(false);

onMounted(() => {
  if (props.arguments) {
    for (let arg of props.arguments) {
      if (arg.referenceIri) {
        includeIri.value = true;
        break;
      }
    }
  }
});

function formatArgumentDisplayName(arg: Argument) {
  const result = arg
    .parameter!.replace("$", "")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
</script>

<style scoped></style>
