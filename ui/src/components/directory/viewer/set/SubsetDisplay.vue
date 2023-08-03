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
      <template #body="{ data }: any"><IMViewerLink :iri="data['@id']" :label="data.name" @navigateTo="(iri:string) => emit('navigateTo', iri)"  /></template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();
const subsets: Ref<{ "@id": string; name: string }[]> = ref([]);

const emit = defineEmits({ onOpenTab: (payload: string) => payload, navigateTo: (_payload: string) => true });


onMounted(async () => {
  const entity = await EntityService.getPartialEntity(props.entityIri, [IM.HAS_SUBSET]);
  if (entity[IM.HAS_SUBSET]) subsets.value = entity[IM.HAS_SUBSET].filter((subset: any) => subset["@id"] !== props.entityIri);
});
</script>

<style scoped></style>
