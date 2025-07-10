<template>
  <div class="nested-match base-type-selector">
    <div>Query Base entity type</div>
    <div v-if="editMode" class="auto-complete-container">
      <AutocompleteSearchBar
        ref="searchBar"
        v-model:selected="selected"
        v-model:imQuery="baseCohortQuery"
        :rootEntities="rootBaseEntities"
        @update-selected="updateQuery"
      />
    </div>
    <div v-else>
      <span class="type-of">{{ match.typeOf?.name }}</span>
    </div>
    <div class="edit-button">
      <Button
        type="button"
        icon="fa-solid fa-pen-to-square"
        label="Edit base type"
        data-testid="edit-base-type-button"
        :severity="hoverEditClause ? 'success' : 'secondary'"
        :outlined="!hoverEditClause"
        :class="!hoverEditClause && 'hover-button'"
        @click="editMode = true"
        @mouseover="hoverEditClause = true"
        @mouseout="hoverEditClause = false"
      />
    </div>
    <div class="add-button">
      <Button
        type="button"
        icon="fa-solid fa-plus"
        label="Add clause"
        data-testid="add-clause-button"
        :severity="hoverAddClause ? 'success' : 'secondary'"
        :outlined="!hoverAddClause"
        :class="!hoverAddClause && 'hover-button'"
        @click="addMatch()"
        @mouseover="hoverAddClause = true"
        @mouseout="hoverAddClause = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, ref, watch, computed, onMounted } from "vue";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { Match, SearchResultSummary, QueryRequest } from "@/interfaces/AutoGen";
import { TreeSelectionKeys } from "primevue/tree";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { EntityService, QueryService } from "@/services";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { SearchOptions } from "@/interfaces";
import Button from "primevue/button";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const rootBaseEntities: Ref<string[]> = ref([]);
const selected: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const hoverEditClause = ref(false);
const hoverAddClause = ref(false);
const cohortFilterOptions: Ref<SearchOptions> = ref({
  types: [{ iri: IM.QUERY }, { iri: SHACL.NODESHAPE }],
  status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
  schemes: []
});
const baseCohortQuery: Ref<QueryRequest> = ref({} as QueryRequest);

const emit = defineEmits<{
  (event: "node-selected", query: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "onCancel", visible: boolean): void;
}>();

onMounted(async () => {
  await init();
});

async function init() {
  rootBaseEntities.value = await EntityService.getChildEntities(IM.DEFAULT_COHORTS);
  baseCohortQuery.value = buildIMQueryFromFilters(cohortFilterOptions.value);
  if (match.value.typeOf) {
    selected.value.iri = match.value.typeOf!.iri!;
    selected.value.name = match.value.typeOf.name;
  } else {
    selected.value.iri = IM.NAMESPACE + "Patient";
    selected.value.name = "Patients";
  }
}
function editBaseType() {}

function addMatch() {}

async function updateQuery(selected: SearchResultSummary) {
  console.log("updateQuery");
  const selectedBaseType = await EntityService.getEntitySummary(selected.iri);
  if (selectedBaseType.type[0].iri === IM.QUERY) {
    const parentCohort = await QueryService.getQueryFromIri(selectedBaseType.iri);
    match.value.typeOf = parentCohort.typeOf;
    if (match.value.rule) {
      if (match.value.rule[0].instanceOf) match.value.rule[0].instanceOf = [{ iri: selectedBaseType.iri, name: selectedBaseType.name }];
    }
  } else match.value!.typeOf = selectedBaseType.type[0];
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
.base-type-selector {
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
.type-of {
  padding-left: 0.2rem;
  color: var(--p-green-700);
}

.auto-complete-container {
  flex: 1 1 0%;
  min-width: 0;
}
</style>
