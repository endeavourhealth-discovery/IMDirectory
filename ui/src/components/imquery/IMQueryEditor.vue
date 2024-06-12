<template>
  <div id="im-query-editor-container">
    <div class="base-type-container">
      <div class="base-type-title side-title">Base type:</div>
      <div class="base-type-value">
        <AutocompleteSearchBar
          class="base-type-autocomplete"
          v-model:selected="selectedBaseType"
          :im-query="imQueryForBaseType"
          :root-entities="['http://endhealth.info/im#DataModelClasses']"
        />
      </div>
    </div>
    <div class="feature-container">
      <div class="feature-title side-title">Features:</div>
      <div class="feature-list">
        <div class="feature-list-container">
          <div class="feature">
            <MatchDisplay
              class="feature-description clickable"
              :match="editQueryDefinition"
              :class="[hover ? 'feature-description-card-hover' : 'feature-description-card']"
              @mouseover="mouseover"
              @mouseout="mouseout"
              @click="editMatch"
            />
          </div>
        </div>
        <div class="add-buttons">
          <Button label="Add parent cohort" @click="showAddPopulation = true" severity="help" icon="fa-solid fa-user-group" class="add-feature-button" />
          <Button
            label="Add existing feature"
            @click="showAddFeature = true"
            severity="success"
            icon="fa-solid fa-plus"
            class="add-feature-button"
            v-tooltip.bottom="'Add definition from existing feature'"
          />
          <Button
            label="Add new feature"
            v-if="selectedBaseType?.iri"
            @click="showBuildFeature = true"
            severity="warning"
            icon="fa-solid fa-screwdriver-wrench"
            class="add-feature-button"
          />
        </div>
      </div>
    </div>
    <AddMatch
      v-model:show-add-feature="showAddFeature"
      v-model:show-add-population="showAddPopulation"
      v-model:show-build-feature="showBuildFeature"
      v-model:show-build-then-feature="showBuildThenFeature"
      :edit-match="editQueryDefinition"
      :match-type-of-iri="selectedBaseType?.iri!"
    />
    <EditMatchDialog
      v-model:show-dialog="showDialog"
      :match="selectedMatch"
      :query-base-type-iri="selectedBaseType?.iri!"
      @save-changes="(editMatch: Match | undefined) => onSaveChanges(editMatch!)"
    />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, provide, ref, watch } from "vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { Match, Query, SearchResultSummary, Bool, QueryRequest } from "@im-library/interfaces/AutoGen";
import { QueryService } from "@/services";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatchDialog from "./EditMatchDialog.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { cloneDeep } from "lodash-es";
import AddMatch from "./AddMatch.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { SearchOptions } from "@im-library/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";

interface Props {
  queryDefinition?: Query;
}

const props = defineProps<Props>();

const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const editQueryDefinition: Ref<Query> = ref({});
const hover: Ref<boolean> = ref(false);
const showDialog = ref(false);
const selectedMatch: Ref<Match | undefined> = ref();
const imQueryForBaseType: Ref<QueryRequest | undefined> = ref();
const showAddPopulation: Ref<boolean> = ref(false);
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const showAddFeature: Ref<boolean> = ref(false);
const variableMap: Ref<{ [key: string]: any }> = ref({});
provide("selectedBaseType", selectedBaseType);
provide("variableMap", variableMap);
provide("fullQuery", editQueryDefinition);
const { populateVariableMap } = setupIMQueryBuilderActions();

watch(
  () => cloneDeep(editQueryDefinition.value),
  () => populateVariableMap(variableMap.value, editQueryDefinition.value)
);

onMounted(async () => {
  if (props.queryDefinition) {
    editQueryDefinition.value = cloneDeep(props.queryDefinition);
    editQueryDefinition.value = await QueryService.getQueryDisplayFromQuery(editQueryDefinition.value, false);
    if (editQueryDefinition.value.typeOf)
      selectedBaseType.value = { iri: editQueryDefinition.value.typeOf?.["@id"], name: editQueryDefinition.value.typeOf?.name } as SearchResultSummary;

    buildImQueryForBaseType();

    populateVariableMap(variableMap.value, editQueryDefinition.value);
  }
});

function buildImQueryForBaseType() {
  const searchOptions: SearchOptions = {
    status: [{ "@id": IM.ACTIVE }, { "@id": IM.DRAFT }],
    types: [{ "@id": SHACL.NODESHAPE }],
    sortDirections: [{ "@id": IM.DESCENDING }],
    sortFields: [{ "@id": IM.USAGE_TOTAL }]
  } as SearchOptions;
  imQueryForBaseType.value = buildIMQueryFromFilters(searchOptions);
}

function mouseover(event: Event) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function editMatch() {
  selectedMatch.value = editQueryDefinition.value;
  showDialog.value = true;
}

async function onSaveChanges(editMatch: Match) {
  editQueryDefinition.value = await QueryService.getQueryDisplayFromQuery(editMatch, false);
}
</script>

<style scoped>
#im-query-editor-container {
  flex: 1 1 auto;
  display: flex;
  width: 100%;
  padding: 0.5rem;
  flex-flow: column nowrap;
  overflow: auto;
}

.base-type-container {
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  padding: 0.5rem;
}

.feature-container {
  flex: 1 1 auto;
  display: flex;
  width: 100%;
  overflow: auto;
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.feature-list {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.2rem;
  width: 100%;
  overflow: auto;
}

.feature-list-container {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
  overflow: auto;
}

.feature {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
}

.feature-description {
  width: 100%;
}

.add-feature-button {
  margin: 0.1rem;
}

.feature-description-card {
  padding: 0.5rem;
  border: var(--imquery-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--imquery-editor-background-color);
  flex: 1;
}

.feature-description-card-hover {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  background-color: var(--imquery-editor-background-color);
  flex: 1;
  border: var(--imquery-editor-hover-border-color) 1px solid;
}

.clickable {
  cursor: pointer;
}

.side-title {
  width: 5rem;
}

.feature-title {
  flex: 0 0 auto;
  padding-top: 0.5rem;
}

.add-buttons {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
}

.expanding-button {
  align-self: stretch;
}
</style>
