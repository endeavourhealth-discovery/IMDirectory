<template>
  <div class="nested-match base-cohort-selector">
    <DirectorySearchDialog
      v-model:show-dialog="showDialog"
      v-model:selected="cohort"
      :imQuery="cohortQuery"
      :root-entities="rootEntities"
      :searchTerm="cohort.name"
      @cancel="onCancel"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, watch } from "vue";
import { IM } from "@/vocabulary";
import { Namespace } from "@/vocabulary/Namespace";
import { Match, Node, QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { buildIMQueryFromFilters } from "@/helpers/buildQuery";
import { SearchOptions } from "@/interfaces";
import Button from "primevue/button";
import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const rootEntities: Ref<string[]> = ref([]);
const cohort: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const showDialog = ref(true);
const cohortFilterOptions: Ref<SearchOptions> = ref({
  types: [{ iri: IM.QUERY }],
  status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
  schemes: []
});
const cohortQuery: Ref<QueryRequest> = ref({} as QueryRequest);

const emit = defineEmits<{
  (event: "updateCohort"): void;
  (event: "navigateTo", iri: string): void;
  (event: "cancel"): void;
}>();

watch(
  cohort,
  (newValue, oldValue) => {
    if (newValue?.iri !== oldValue?.iri) {
      updateCohort();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await init();
});

async function init() {
  rootEntities.value = [Namespace.IM + "Q_Queries"];
  cohortQuery.value = buildIMQueryFromFilters(cohortFilterOptions.value);
  if (match.value.is) {
    cohort.value.iri = match.value.is[0].iri!;
    cohort.value.name = match.value.is[0].name;
  }
}
function onCancel() {
  editMode.value = false;
  emit("cancel");
}

async function updateCohort() {
  if (cohort.value) {
    match.value.is![0] = { iri: cohort.value.iri, name: cohort.value.name } as TTIriRef;
  }
  editMode.value = false;
  emit("updateCohort");
}
</script>

<style scoped>
.nested-match {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}
.base-cohort-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.edit-button {
  height: 100%;
  width: 8%;
  display: flex;
  margin-left: auto;
}
.instance-of {
  padding-left: 0.2rem;
  color: var(--p-green-700);
}

.delete-button {
  height: 100%;
  width: 2%;
  display: flex;
  align-items: center;
}
</style>
