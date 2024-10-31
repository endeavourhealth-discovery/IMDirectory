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
        <IMViewerLink :action="'select'" :iri="data['@id']" :label="data.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { SetService } from "@/services";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { TTIriRef } from "@/interfaces/AutoGen";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();
const subsets: Ref<TTIriRef[]> = ref([]);

const emit = defineEmits({ onOpenTab: (payload: string) => payload, navigateTo: (_payload: string) => true });

onMounted(async () => {
  subsets.value = await SetService.getSubsets(props.entityIri);
});
</script>
