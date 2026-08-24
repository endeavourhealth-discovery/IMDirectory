<template>
  <div class="nested-match base-type-selector">
    <span class="label">Base entity type:</span>
    <span v-if="match.typeOf" class="type-of">{{ match.typeOf?.name }}</span>
    <div v-if="editMode">
      <BaseTypeSelector
        v-model:base-cohort-query="baseCohortQuery"
        :rootBaseEntities="rootBaseEntities"
        :selected="baseType"
        :visible="editMode"
        @cancel="onCancel"
        @navigateTo="emit('navigateTo', $event)"
        @updateBaseType="updateBaseType($event)"
      />
    </div>
    <div v-if="!editMode" class="edit-button">
      <Button
        :class="!hoverEditClause && 'hover-button'"
        :outlined="!hoverEditClause"
        :severity="hoverEditClause ? 'success' : 'secondary'"
        data-testid="edit-base-type-button"
        icon="fa-solid fa-pen-to-square"
        label="Edit base type"
        type="button"
        @click="
          editMode = true;
          hoverEditClause = false;
        "
        @mouseout="hoverEditClause = false"
        @mouseover="hoverEditClause = true"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from "vue";

import { IM, NAMESPACE, SHACL } from "@endeavour/vue-library/enums";
import { type Query, type QueryRequest, type SearchResultSummary } from "@endeavour/vue-library/models";

import Button from "primevue/button";

import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";
import { buildIMQueryFromFilters } from "@/helpers/buildQuery";
import { type SearchOptions } from "@/models";
import { EntityService, QueryService } from "@/services";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Query>("match", { default: {} });
const rootBaseEntities: Ref<string[]> = ref([]);
const hoverEditClause = ref(false);
const baseType: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const baseTypeFilterOptions: Ref<SearchOptions> = ref({
  types: [{ iri: SHACL.NODESHAPE.toString() }],
  status: [{ iri: IM.ACTIVE.toString() }, { iri: IM.DRAFT.toString() }],
  schemes: [],
  sortFields: [],
  sortDirections: []
});
const baseCohortQuery: Ref<QueryRequest> = ref({} as QueryRequest);

const emit = defineEmits<{
  (event: "node-selected", query: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "cancel"): void;
}>();

onMounted(async () => {
  await init();
});

async function init() {
  rootBaseEntities.value = await EntityService.getChildEntities(IM.HEALTH_RECORDS);
  baseCohortQuery.value = buildIMQueryFromFilters(baseTypeFilterOptions.value);
  if (match.value.typeOf) {
    baseType.value.iri = match.value.typeOf!.iri!;
    baseType.value.name = match.value.typeOf.name;
  } else {
    baseType.value.iri = NAMESPACE.IM + "Patient";
    baseType.value.name = "Patients";
    match.value.typeOf = { iri: NAMESPACE.IM + "Patient", name: "Patients" };
  }
}

function onCancel() {
  editMode.value = false;
  emit("cancel");
}

async function updateBaseType(newBaseType?: SearchResultSummary) {
  if (newBaseType) {
    baseType.value.iri = newBaseType.iri;
    baseType.value.name = newBaseType.name;
    const selectedBaseType = await EntityService.getEntitySummary(baseType.value.iri);
    if (selectedBaseType.type[0].iri === IM.QUERY) {
      const parentCohort = await QueryService.getQueryFromIri(selectedBaseType.iri);
      match.value.typeOf = parentCohort.typeOf;
      const denominator = {
        is: [
          {
            iri: selectedBaseType.iri,
            name: selectedBaseType.name,
            cohort: true
          }
        ]
      } as Query;
      if (match.value.and) {
        if (match.value.and[0].is) match.value.and[0] = denominator;
        else match.value.and.unshift(denominator);
      } else match.value.and = [denominator];
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
.label {
  padding-right: 0.5rem;
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
  padding-right: 0.2rem;
  color: var(--p-green-700);
}
</style>
