<template>
  <div class="nested-match base-type-selector">
    <div>Query Base entity type</div>
    <div v-if="editMode">
      <BaseTypeSelector
        :visible="editMode"
        :selected="baseType"
        :rootBaseEntities="rootBaseEntities"
        v-model:base-cohort-query="baseCohortQuery"
        @updateBaseType="updateBaseType($event)"
        @cancel="editMode = false"
        @navigateTo="emit('navigateTo', $event)"
      />
    </div>

    <div v-else>
      <span class="type-of">{{ match.typeOf?.name }}</span>
    </div>
    <div v-if="!editMode" class="edit-button">
      <Button
        type="button"
        icon="fa-solid fa-pen-to-square"
        label="Edit base type"
        data-testid="edit-base-type-button"
        :severity="hoverEditClause ? 'success' : 'secondary'"
        :outlined="!hoverEditClause"
        :class="!hoverEditClause && 'hover-button'"
        @click="
          editMode = true;
          hoverEditClause = false;
        "
        @mouseover="hoverEditClause = true"
        @mouseout="hoverEditClause = false"
      />
    </div>
    <div v-if="!editMode && !hasBoolGroups(match)" class="add-button">
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
import { EntityService, QueryService } from "@/services";
import { buildIMQueryFromFilters, hasBoolGroups } from "@/helpers/IMQueryBuilder";
import { SearchOptions } from "@/interfaces";
import Button from "primevue/button";
import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const rootBaseEntities: Ref<string[]> = ref([]);
const hoverEditClause = ref(false);
const hoverAddClause = ref(false);
const baseType: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
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
    baseType.value.iri = match.value.typeOf!.iri!;
    baseType.value.name = match.value.typeOf.name;
  } else {
    baseType.value.iri = IM.NAMESPACE + "Patient";
    baseType.value.name = "Patients";
    match.value.typeOf = { iri: IM.NAMESPACE + "Patient", name: "Patients" };
  }
}

function addMatch() {}

async function updateBaseType(newBaseType?: SearchResultSummary) {
  if (newBaseType) {
    baseType.value.iri = newBaseType.iri;
    baseType.value.name = newBaseType.name;
    const selectedBaseType = await EntityService.getEntitySummary(baseType.value.iri);
    if (selectedBaseType.type[0].iri === IM.QUERY) {
      const parentCohort = await QueryService.getQueryFromIri(selectedBaseType.iri);
      match.value.typeOf = parentCohort.typeOf;
      if (match.value.rule) {
        if (match.value.rule[0].instanceOf)
          match.value.rule[0].instanceOf = [
            {
              iri: selectedBaseType.iri,
              name: selectedBaseType.name
            }
          ];
      }
    } else match.value!.typeOf = { iri: newBaseType.iri, name: newBaseType.name };
  }
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
</style>
