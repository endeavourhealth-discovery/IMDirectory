<template>
  <div class="im-query-container">
    <div class="base-type-container">
      <div class="base-type-title">Base type:</div>
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
      <div class="feature-title">Features:</div>
      <div class="feature-list">
        <div class="feature-list-container">
          <div v-for="(feature, index) in editQueryDefinition.match" class="feature">
            <div
              :class="[hover === index ? 'feature-description-card-hover' : 'feature-description-card']"
              class="clickable"
              @mouseover="mouseover($event, index)"
              @mouseout="mouseout($event, index)"
              @click="editMatch(index)"
            >
              <MatchDisplay class="feature-description" :match="feature" />
            </div>

            <Button @click="deleteFeature(index)" severity="danger" icon="fa-solid fa-trash" class="builder-button expanding-button" />
          </div>
        </div>
        <EditMatchDialog
          v-model:show-dialog="showDialog"
          :match="selectedMatch"
          :index="selectedIndex"
          :query-base-type-iri="selectedBaseType?.iri!"
          @save-changes="(editMatch: Match | undefined) => onSaveChanges(editMatch, selectedMatch!['@id']!, selectedIndex)"
        />
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

    <div class="add-buttons">
      <Button label="Add population" @click="showAddPopulation = true" severity="help" icon="fa-solid fa-user-group" class="add-feature-button" />
      <Button label="Add existing feature" @click="showAddFeature = true" severity="success" icon="fa-solid fa-plus" class="add-feature-button" />
      <Button
        label="Add new feature"
        v-if="selectedBaseType?.iri"
        @click="showBuildFeature = true"
        severity="warning"
        icon="fa-solid fa-screwdriver-wrench"
        class="add-feature-button"
      />
      <Button
        label="Add feature group"
        @click="editQueryDefinition.match?.push({ boolMatch: Bool.and })"
        severity="primary"
        icon="fa-solid fa-layer-group"
        class="add-feature-button"
      />
    </div>
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
import { SortDirection } from "@im-library/enums";
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
const hover: Ref<number> = ref(-1);
const showDialog = ref(false);
const selectedMatch: Ref<Match | undefined> = ref();
const selectedIndex: Ref<number> = ref(-1);
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

function mouseover(event: Event, index: number) {
  event.stopPropagation();
  hover.value = index;
}

function mouseout(event: Event, index: number) {
  event.stopPropagation();
  hover.value = -1;
}

function deleteFeature(index: number) {
  editQueryDefinition.value.match?.splice(index, 1);
}

function editMatch(index: number) {
  selectedMatch.value = editQueryDefinition.value.match?.[index];
  selectedIndex.value = index;
  showDialog.value = true;
}

async function onSaveChanges(editMatch: Match | undefined, id: string, index: number) {
  if (!editMatch) editQueryDefinition.value.match = editQueryDefinition.value.match?.filter(rootMatch => rootMatch["@id"] !== id);
  else {
    editQueryDefinition.value.match![index] = cloneDeep(editMatch);
    editQueryDefinition.value = await QueryService.getQueryDisplayFromQuery(editQueryDefinition.value, false);
  }
}
</script>

<style scoped>
.im-query-container {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 0.5rem;
  flex-flow: column;
}

.base-type-container {
  display: flex;
  align-items: baseline;
}

.feature-container {
  display: flex;
  align-items: baseline;
  width: 100%;
}

.feature-list {
  display: flex;
  flex-flow: row;
  padding: 1rem;
  height: 100%;
  width: 100%;
}

.feature-list-container {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
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
  margin: 0.2rem;
  flex: 1;
}

.feature-description-card-hover {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  background-color: var(--imquery-editor-background-color);
  margin: 0.2rem;
  flex: 1;
  border: var(--imquery-editor-hover-border-color) 1px solid;
}

.base-type-autocomplete {
  margin-left: 1.5rem;
  margin-right: 1rem;
}

.clickable {
  cursor: pointer;
}

.feature-title {
  display: flex;
  align-self: center;
}

.add-buttons {
  margin-left: 5.8rem;
  display: flex;
  flex-flow: row;
}

.expanding-button {
  align-self: stretch;
}
</style>

<style>
.builder-button {
  width: 2rem;
  margin: 0.1rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
</style>
