<template>
  <Dialog v-model:visible="visible" v-model:selected="selected" modal maximizable :header="'Add base type'" :style="{ width: '60vw' }">
    <DirectorySearchDialog
      v-model:show-dialog="visible"
      @update:selected="setBaseType"
      :root-entities="rootEntities"
      :searchByQuery="cohortOrDataModelQueryRequest"
    />
  </Dialog>

  <Dialog v-model:visible="confirmVisible" modal header="Confirm" :style="{ width: '50vw' }">
    Are you sure you want to change the base type? All current query content will be discarded.
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="confirmVisible = false" text />
      <Button label="Yes" icon="pi pi-check" @click="confirm" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";

import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { isQuery } from "@im-library/helpers/ConceptTypeMethods";
import { buildMatchFromCS } from "@im-library/helpers/QueryBuilder";

interface Props {
  query: Query;
  showDialog: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, "update:showDialog": payload => typeof payload === "boolean" });

const visible: Ref<boolean> = ref(false);
const confirmVisible: Ref<boolean> = ref(false);
const selected: Ref<ConceptSummary> = ref({} as ConceptSummary);
const rootEntities: Ref<string[]> = ref(["http://endhealth.info/im#DataModel", "http://endhealth.info/im#Q_Queries"]);
const cohortOrDataModelQueryRequest: Ref<QueryRequest> = ref({
  query: {
    name: "Get queries and data models",
    match: [
      {
        bool: "or",
        match: [
          {
            "@type": "http://endhealth.info/im#CohortQuery"
          },
          {
            "@type": "http://www.w3.org/ns/shacl#NodeShape"
          }
        ]
      }
    ]
  }
} as QueryRequest);

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

async function save() {
  if (isObjectHasKeys(selected.value)) {
    if (isQuery(selected.value.entityType)) {
      props.query["@type"] = await getReturnType(selected.value.iri);
      const newMatch = buildMatchFromCS(selected.value);
      props.query.match = [newMatch];
    } else {
      props.query["@type"] = selected.value.iri;
    }
  }
  visible.value = false;
}

function confirm() {
  props.query.match = [];
  confirmVisible.value = false;
  save();
}

function setBaseType(cs: ConceptSummary) {
  selected.value = cs;

  if (isArrayHasLength(props.query.match)) {
    confirmVisible.value = true;
  } else {
    save();
  }
}

async function getReturnType(queryIri: string) {
  const entity = await EntityService.getPartialEntity(queryIri, [IM.NAMESPACE + "returnType"]);
  if (!isArrayHasLength(entity[IM.NAMESPACE + "returnType"])) return "";
  return entity[IM.NAMESPACE + "returnType"][0]["@id"];
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.add-base-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.query-nav-tree {
  height: 70vh;
}
</style>
