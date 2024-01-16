<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Add base type'" :style="{ width: '60vw' }">
    <DirectorySearchDialog
      v-model:selected="selected"
      v-model:show-dialog="visible"
      @update:selected="setBaseType"
      :root-entities="rootEntities"
      :searchByQuery="validationQueryRequest"
      :filter-options="filterOptions"
    />
  </Dialog>

  <Dialog v-model:visible="confirmVisible" modal header="Confirm" :style="{ width: '50vw' }">
    Are you sure you want to change the base type? All current query content will be discarded.
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" @click="confirmVisible = false" text />
      <Button label="Yes" icon="fa-solid fa-check" @click="confirm" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";

import { Query, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { FilterOptions } from "@im-library/interfaces";
import { EntityService } from "@/services";
import { IM, SHACL } from "@im-library/vocabulary";
import { isQuery } from "@im-library/helpers/ConceptTypeMethods";
import { buildInSetMatchFromCS } from "@im-library/helpers/QueryBuilder";

interface Props {
  query: Query;
  showDialog: boolean;
  validationQueryRequest: QueryRequest;
  filterOptions: FilterOptions;
  rootEntities: string[];
}

const props = defineProps<Props>();
const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean" });

const visible: Ref<boolean> = ref(false);
const confirmVisible: Ref<boolean> = ref(false);
const selected: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const returnType: Ref<string> = ref("");

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

onMounted(() => {
  if (isObjectHasKeys(props.query, ["typeOf"])) selected.value = { iri: props.query.typeOf!["@id"] } as SearchResultSummary;
});

async function save() {
  props.query.typeOf = { "@id": returnType.value };
  if (isQuery(selected.value.entityType)) {
    if (!isArrayHasLength(props.query.match)) props.query.match = [];
    props.query.match!.splice(0, 0, buildInSetMatchFromCS(selected.value));
  }

  visible.value = false;
}

function confirm() {
  props.query.match = [];
  confirmVisible.value = false;
  save();
}

async function setBaseType(cs: SearchResultSummary) {
  selected.value = cs;
  returnType.value = await getReturnType(selected.value);
  if (isArrayHasLength(props.query.match) && returnType.value !== props.query.typeOf!["@id"]) {
    confirmVisible.value = true;
  } else {
    save();
  }
}

async function getReturnType(cs: SearchResultSummary): Promise<string> {
  if (!isQuery(cs.entityType)) return cs.iri;
  else {
    const entity = await EntityService.getPartialEntity(cs.iri, [IM.RETURN_TYPE]);
    if (!isArrayHasLength(entity[IM.RETURN_TYPE])) return "";
    return entity[IM.RETURN_TYPE][0]["@id"];
  }
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
