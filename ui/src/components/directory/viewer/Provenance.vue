<template>
  <div class="provenance-container">
    <DataTable
      @row-click="onRowClick()"
      :value="provenances"
      show-gridlines
      :scrollable="true"
      :sortOrder="1"
      class="p-datatable-sm"
      scrollHeight="flex"
      :loading="loading"
      :style="'cursor:pointer;'"
      selectionMode="single"
      v-model:selection="selectedProvenance"
    >
      <Column field="prov" header="Provenance Id" style="width: 18rem"></Column>
      <Column field="usedEntity" header="Used Entity" style="min-width: 18rem"></Column>
      <Column field="effectiveDate" header="Effective Date" style="min-width: 18rem"></Column>
      <Column field="activityType" header="Activity Type" style="max-width: 10rem"></Column>
      <Column field="agent" header="Agent" style="max-width: 10rem"></Column>
    </DataTable>
    <Dialog
      v-model:visible="visible"
      modal
      header="Test!"
      :style="{
        minWidth: '90vw',
        minHeight: '90vh',
        display: 'flex',
        flexFlow: 'column nowrap'
      }"
      @hide="onClose()"
    >
      <Panel header="JSON" toggleable>
        <JSONViewer :entity-iri="jsonDisplay"></JSONViewer>
      </Panel>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { EntityService, ProvService } from "@/services";
import { IM, RDFS } from "@im-library/vocabulary";
import { onMounted, ref, Ref, watch } from "vue";
import JSONViewer from "@/components/directory/viewer/JSONViewer.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const provenances: Ref<any[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const visible = ref(false);
const selectedProvenance = ref();
const jsonDisplay = ref();

onMounted(async () => await getProvHistory(props.entityIri));

watch(selectedProvenance, async () => {
  if (selectedProvenance.value && isObjectHasKeys(selectedProvenance.value, ["prov"])) {
    const result = await ProvService.getProvHistory(props.entityIri);
    let matchIri = "";
    result.forEach((p: any) => {
      if (p["@id"] === selectedProvenance.value.prov) {
        matchIri = p[IM.PROVENANCE_USED][0]["@id"].toString();
      }
    });
    const a = await EntityService.getFullEntity(matchIri);
    if (a[IM.DEFINITION]) jsonDisplay.value = a["@id"];
  }
});

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

function onRowClick() {
  visible.value = true;
}
function onClose() {
  selectedProvenance.value = {};
}
</script>

<style scoped>
.provenance-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
