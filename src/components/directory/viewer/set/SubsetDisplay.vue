<template>
  <div v-if="!subsets.length">No subsets found.</div>
  <DataTable
    v-else
    :value="subsets"
    showGridlines
    :scrollable="true"
    sortMode="single"
    sortField="label"
    :sortOrder="1"
    class="p-datatable-sm"
    scrollHeight="flex"
    data-testid="table"
    :lazy="true"
  >
    <Column field="member" header="Name">
      <template #body="{ data }: any">
        <IMViewerLink :action="'select'" :iri="data.iri" :label="data.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import type { TTIriRef } from "vue-library/interfaces";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { SetService } from "@/services";

const props = defineProps<{
  entityIri: string;
}>();

const emit = defineEmits<{
  onOpenTab: [payload: string];
  navigateTo: [payload: string];
}>();

const subsets: Ref<TTIriRef[]> = ref([]);

onMounted(async () => {
  subsets.value = await SetService.getSubsets(props.entityIri);
});
</script>
