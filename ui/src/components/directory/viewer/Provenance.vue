<template>
  <div class="provenance-container">
    <DataTable :value="provenances" show-gridlines :scrollable="true" :sortOrder="1" class="p-datatable-sm" scrollHeight="flex" :loading="loading">
      <Column field="prov" header="Provenance Id" style="width: 18rem"></Column>
      <Column field="usedEntity" header="Used Entity" style="min-width: 18rem"></Column>
      <Column field="effectiveDate" header="Effective Date" style="min-width: 18rem"></Column>
      <Column field="activityType" header="Activity Type" style="max-width: 10rem"></Column>
      <Column field="agent" header="Agent" style="max-width: 10rem"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ProvService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { onMounted, ref, Ref } from "vue";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const provenances: Ref<any[]> = ref([]);
const loading: Ref<boolean> = ref(false);

onMounted(async () => await getProvHistory(props.entityIri));

async function getProvHistory(iri: string) {
  loading.value = true;
  const result = await ProvService.getProvHistory(iri);
  result.forEach((p: any) =>
    provenances.value.push({
      prov: p["@id"],
      usedEntity: p[IM.PROVENANCE_USED]?.[0].name || p[IM.PROVENANCE_USED]?.[0]["@id"] || "---",
      effectiveDate: p[IM.EFFECTIVE_DATE],
      activityType: p[IM.PROV_ACTIVITY_TYPE][0].name || p[IM.PROV_ACTIVITY_TYPE][0]["@id"],
      agent: p[IM.PROVENANCE_AGENT]?.[0].name || p[IM.PROVENANCE_AGENT]?.[0]["@id"] || "---"
    })
  );
  loading.value = false;
}
</script>

<style scoped>
.provenance-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
