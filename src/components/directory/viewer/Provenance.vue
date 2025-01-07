<template>
  <div class="provenance-container">
    <DataTable
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
      data-testid="provenance-table"
    >
      <template #empty> No provenance found. </template>
      <template #loading> Loading provenance. Please wait. </template>
      <Column field="prov" header="Provenance Id" style="width: 18rem"></Column>
      <Column field="usedEntity" header="Used Entity" style="min-width: 18rem"></Column>
      <Column field="effectiveDate" header="Effective Date" style="min-width: 18rem"></Column>
      <Column field="activityType" header="Activity Type" style="max-width: 10rem"></Column>
      <Column field="agent" header="Agent" style="max-width: 10rem"></Column>
    </DataTable>
    <Dialog
      v-model:visible="visible"
      modal
      :header="'Provenance details: ' + jsonDisplay"
      :contentStyle="{ display: 'block' }"
      :style="{
        width: '90vw',
        minHeight: '90vh'
      }"
      @hide="onClose()"
    >
      <div v-for="(value, key) in provItem" class="prov-item">
        <label v-html="getLabel(key)"></label>
        <div v-if="!Array.isArray(value) && getLabel(key)">{{ value }}</div>
        <div v-if="Array.isArray(value) && getLabel(key)">
          <div v-for="v in value" :key="v">
            <div v-if="getLabel(key) === 'Properties:'">
              <span v-if="isObjectHasKeys(v, [SHACL.PATH])">Property: {{ v[SHACL.PATH][0].name }}</span>
              <span v-if="isObjectHasKeys(v, [SHACL.NODE])">, Range: {{ v[SHACL.NODE][0].name }} </span>
              <span v-if="isObjectHasKeys(v, [IM.INHERITED_FROM])"> (inherited)</span>
            </div>
            <div v-else-if="getLabel(key) === 'Content type:'">
              <span v-if="v.name">{{ v.name }}</span>
            </div>
            <div v-else-if="getLabel(key) === 'Term codes:'">
              <span v-if="isObjectHasKeys(v, [RDFS.LABEL])">Name: {{ v[RDFS.LABEL] }}</span
              ><span v-if="isObjectHasKeys(v, [IM.CODE])">, Code: {{ v[IM.CODE] }}</span
              ><span v-if="isObjectHasKeys(v, [IM.HAS_STATUS])">, Status: {{ v[IM.HAS_STATUS][0].name }}</span>
            </div>
            <div v-else-if="getLabel(key) === 'Role groups:'">
              <div v-for="k in Object.keys(v)" :key="k">
                <span v-if="k === IM.GROUP_NUMBER"> Role group {{ v[k] }}:</span>
              </div>
              <div v-for="k in Object.keys(v)" :key="k">
                <span v-if="k !== IM.GROUP_NUMBER">{{ k }} : {{ v[k][0].name }}</span>
              </div>
            </div>
            <div v-else-if="v.name">{{ v.name }}</div>
          </div>
        </div>
      </div>
      <Panel class="provItem" header="JSON" toggleable collapsed>
        <JSONViewer :entity-iri="jsonDisplay" />
      </Panel>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { onMounted, ref, Ref, watch } from "vue";
import JSONViewer from "@/components/directory/viewer/JSONViewer.vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const provenances: Ref<any[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const visible = ref(false);

const selectedProvenance = ref();
const provItem = ref();
const jsonDisplay = ref();

const labels = ref({
  "@id": "Iri:",
  [RDF.TYPE]: "Type:",
  [RDFS.LABEL]: "Name:",
  [RDFS.COMMENT]: "Description:",
  [IM.HAS_STATUS]: "Status:",
  [RDFS.SUBCLASS_OF]: "Subclass of:",
  [IM.IS_CONTAINED_IN]: "Contained in:",
  [IM.CODE]: "Code:",
  [IM.VERSION]: "Version:",
  [SHACL.PROPERTY]: "Properties:",
  [IM.PREFERRED_NAME]: "Preferred name:",
  [IM.CONTENT_TYPE]: "Content type:",
  [IM.MATCHED_TO]: "Mapped to:",
  [IM.IS_CHILD_OF]: "Child of:",
  [IM.HAS_TERM_CODE]: "Term codes:",
  [IM.ROLE_GROUP]: "Role groups:"
});

onMounted(async () => {
  await getProvHistory(props.entityIri);
});

watch(selectedProvenance, async () => {
  if (selectedProvenance.value && isObjectHasKeys(selectedProvenance.value, ["prov"])) {
    const result = await EntityService.getProvHistory(props.entityIri);
    let matchIri = "";
    result.forEach((p: any) => {
      if (p["@id"] === selectedProvenance.value.prov && p[IM.PROVENANCE_USED]) {
        matchIri = p[IM.PROVENANCE_USED][0]["@id"].toString();
      }
    });
    if (matchIri === "") {
      visible.value = false;
    } else {
      const entity = await EntityService.getEntityByPredicateExclusions(matchIri, [IM.HAS_MEMBER]);
      if (isObjectHasKeys(entity, [IM.DEFINITION])) {
        provItem.value = JSON.parse(entity[IM.DEFINITION]);
        jsonDisplay.value = entity["@id"];
      }
      visible.value = true;
    }
  }
});

async function getProvHistory(iri: string) {
  loading.value = true;
  const result = await EntityService.getProvHistory(iri);
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

function onClose() {
  selectedProvenance.value = {};
  visible.value = false;
}

function getLabel(key: any) {
  return labels.value[key];
}

function getGroupKeyName(key: string) {
  return EntityService.getPartialEntity(key, [RDFS.LABEL]);
}
</script>

<style scoped>
.provenance-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.prov-item {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

label {
  font-weight: bold;
}
</style>
