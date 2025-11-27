<template>
  <div class="nested-match base-cohort-selector">
    <span>bla</span>
    <div>Is in the cohort :</div>
    <div v-if="editMode">
      <BaseTypeSelector
        :visible="editMode"
        :selected="baseType"
        :rootBaseEntities="rootBaseEntities"
        v-model:base-cohort-query="cohortQuery"
        @updateBaseType="updateCohort($event)"
        @onCancel="editMode = false"
        @navigateTo="emit('navigateTo', $event)"
      />
    </div>

    <div v-else>
      <span v-if="match.is" class="instance-of">{{ match.is![0].name }}</span>
    </div>
    <div v-if="!editMode" class="edit-button">
      <Button
        type="button"
        icon="fa-solid fa-pen-to-square"
        label="Edit cohort"
        data-testid="edit-cohort-button"
        :severity="hoverEditCohort ? 'success' : 'secondary'"
        :outlined="!hoverEditCohort"
        :class="!hoverEditCohort && 'hover-button'"
        @click="editMode = true"
        @mouseover="hoverEditCohort = true"
        @mouseout="hoverEditCohort = false"
      />
    </div>
    <div v-if="!editMode" class="delete-button">
      <Button
        @click.stop="deleteCohort()"
        class="builder-button"
        :severity="hoverDeleteCohort ? 'danger' : 'secondary'"
        :outlined="!hoverDeleteCohort"
        :class="!hoverDeleteCohort && 'hover-button'"
        icon="fa-solid fa-trash"
        @mouseover="hoverDeleteCohort = true"
        @mouseout="hoverDeleteCohort = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import { IM } from "@/vocabulary";
import { Namespace } from "@/vocabulary/Namespace";
import { Match, Node, QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { buildIMQueryFromFilters } from "@/composables/buildQuery";
import { SearchOptions } from "@/interfaces";
import Button from "primevue/button";
import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const rootBaseEntities: Ref<string[]> = ref([]);
const hoverEditCohort = ref(false);
const hoverDeleteCohort = ref(false);
const baseType: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const cohortFilterOptions: Ref<SearchOptions> = ref({
  types: [{ iri: IM.QUERY }],
  status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
  schemes: []
});
const cohortQuery: Ref<QueryRequest> = ref({} as QueryRequest);

const emit = defineEmits<{
  (event: "updateProperty"): void;
  (event: "navigateTo", iri: string): void;
  (event: "onCancel", visible: boolean): void;
}>();

onMounted(async () => {
  await init();
});

async function init() {
  rootBaseEntities.value = [Namespace.IM + "Q_Queries"];
  cohortQuery.value = buildIMQueryFromFilters(cohortFilterOptions.value);
}

async function updateCohort(cohort?: SearchResultSummary) {
  if (cohort) {
    match.value.is![0] = { iri: cohort.iri, name: cohort.name } as TTIriRef;
  }
  editMode.value = false;
  emit("updateProperty");
}
function deleteCohort() {
  delete match.value.is![0];
  editMode.value = false;
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
