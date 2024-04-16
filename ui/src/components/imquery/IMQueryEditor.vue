<template>
  <div class="im-query-container">
    <div class="base-type-container">
      <div class="base-type-title">Base type:</div>
      <AutocompleteSearchBar
        class="base-type-autocomplete"
        v-model:selected="selectedBaseType"
        :os-query="osQueryForBaseType"
        :root-entities="['http://endhealth.info/im#DataModelClasses']"
      />
    </div>
    <div class="feature-container">
      <div class="feature-title">Features:</div>
      <div class="feature-list">
        <div class="feature-list-container">
          <div v-for="(feature, index) in queryDefinition.match" class="feature">
            <Button
              v-if="index && index > 0"
              :severity="feature.exclude ? 'danger' : 'secondary'"
              :outlined="!feature.exclude"
              label="NOT"
              @click="feature.exclude = !feature.exclude"
              class="builder-button exclude-button vertical-button not-button"
              :class="!feature.exclude && 'hover-button'"
              v-tooltip="'Exclude'"
              size="small"
            />
            <div
              :class="[hover === index ? 'feature-description-card-hover' : 'feature-description-card']"
              class="clickable"
              @mouseover="mouseover($event, index)"
              @mouseout="mouseout($event, index)"
              @click="editMatch(index)"
            >
              <MatchDisplay class="feature-description" :match="feature" />
            </div>

            <Button @click="deleteFeature(index)" severity="danger" icon="fa-solid fa-trash" class="builder-button" />
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
    <DirectorySearchDialog
      v-model:show-dialog="showAddPopulationDialog"
      :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
      :os-query="osQueryForPopulation"
      @update:selected="onPopulationSelect"
    />

    <DirectorySearchDialog
      v-model:show-dialog="showAddFeatureDialog"
      :root-entities="[IM.MODULE_FEATURES]"
      :os-query="osQueryForFeature"
      @update:selected="onFeatureSelect"
    />

    <AddPropertyDialog
      v-model:show-dialog="showBuildFeatureDialog"
      :dataModelIri="selectedBaseType?.iri ?? ''"
      :header="'Build feature'"
      :show-variable-options="false"
      @on-property-add="(properties: Where[]) => onFeatureBuild(properties)"
    />

    <div class="add-buttons">
      <Button label="Add population" @click="showAddPopulationDialog = true" severity="help" icon="fa-solid fa-plus" class="add-feature-button" />
      <Button label="Add existing feature" @click="showAddFeatureDialog = true" severity="success" icon="fa-solid fa-plus" class="add-feature-button" />
      <Button
        label="Build feature"
        @click="showBuildFeatureDialog = true"
        severity="warning"
        icon="fa-solid fa-screwdriver-wrench"
        class="add-feature-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { Match, Query, SearchRequest, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import { EntityService, QueryService } from "@/services";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatchDialog from "./EditMatchDialog.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { SortDirection } from "@im-library/enums";
import { cloneDeep } from "lodash";
import AddPropertyDialog from "../query/builder/edit/dialogs/AddPropertyDialog.vue";
import { v4 } from "uuid";
import DirectorySearchDialog from "../shared/dialogs/DirectorySearchDialog.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";

const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const queryDefinition: Ref<Query> = ref({});
const hover: Ref<number> = ref(-1);
const showDialog = ref(false);
const selectedMatch: Ref<Match | undefined> = ref();
const selectedIndex: Ref<number> = ref(-1);
const osQueryForBaseType: Ref<SearchRequest | undefined> = ref();
const showBuildFeatureDialog: Ref<boolean> = ref(false);
const showAddPopulationDialog: Ref<boolean> = ref(false);
const showAddFeatureDialog: Ref<boolean> = ref(false);
const osQueryForPopulation: Ref<SearchRequest> = ref({ typeFilter: [IM.COHORT_QUERY] });
const osQueryForFeature: Ref<SearchRequest> = ref({ typeFilter: [IM.MATCH_CLAUSE] });

onMounted(async () => {
  queryDefinition.value = await QueryService.getQueryDisplay("http://endhealth.info/im#Q_TestQuery");
  if (queryDefinition.value.typeOf)
    selectedBaseType.value = { iri: queryDefinition.value.typeOf?.["@id"], name: queryDefinition.value.typeOf?.name } as SearchResultSummary;

  osQueryForBaseType.value = {
    statusFilter: [IM.ACTIVE, IM.DRAFT],
    typeFilter: [SHACL.NODESHAPE],
    sortDirection: SortDirection.DESC,
    sortField: "weighting"
  } as SearchRequest;
});

function onPopulationSelect(selected: SearchResultSummary) {
  const match: Match = { "@id": v4(), instanceOf: { "@id": selected.iri, name: selected.name, memberOf: true } };
  describeMatch(match, 0);
  if (!queryDefinition.value.match) queryDefinition.value.match = [];
  queryDefinition.value.match.push(match);
}

async function onFeatureSelect(selected: SearchResultSummary) {
  const featureEntity = await EntityService.getPartialEntity(selected.iri, [IM.DEFINITION]);
  if (!featureEntity || !featureEntity[IM.DEFINITION]) return;
  const featureDefinition: Query = JSON.parse(featureEntity[IM.DEFINITION]);
  describeMatch(featureDefinition, 0);
  if (!queryDefinition.value.match) queryDefinition.value.match = [];
  queryDefinition.value.match.push(featureDefinition);
}

function onFeatureBuild(properties: Where[]) {
  const match: Match = { "@id": v4(), where: properties };
  if (!queryDefinition.value.match) queryDefinition.value.match = [];
  queryDefinition.value.match.push(match);
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
  queryDefinition.value.match?.splice(index, 1);
}

function editMatch(index: number) {
  selectedMatch.value = queryDefinition.value.match?.[index];
  selectedIndex.value = index;
  showDialog.value = true;
}

async function onSaveChanges(editMatch: Match | undefined, id: string, index: number) {
  if (!editMatch) queryDefinition.value.match = queryDefinition.value.match?.filter(rootMatch => rootMatch["@id"] !== id);
  else {
    queryDefinition.value.match![index] = cloneDeep(editMatch);
    queryDefinition.value = await QueryService.getQueryDisplayFromQuery(queryDefinition.value);
  }
}
</script>

<style scoped>
.im-query-container {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 1rem;
  flex-flow: column;
}

.base-type-container {
  display: flex;
  align-items: baseline;
}

.feature-container {
  display: flex;
  align-items: baseline;
  overflow: hidden;
}

.feature-list {
  display: flex;
  flex-flow: row;
  padding: 1rem;
}

.feature-list-container {
  display: flex;
  flex-flow: column;
}

.feature {
  display: flex;
  flex-flow: row;
}

.feature-description {
  width: calc(94vw - 2rem);
}

.add-feature-button {
  margin: 0.1rem;
}

.feature-description-card {
  width: calc(94vw - 7rem);
  padding: 0.5rem;
  border: var(--imquery-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--imquery-editor-background-color);
  margin: 0.2rem;
  flex: 1;
}

.feature-description-card-hover {
  width: calc(94vw - 7rem);
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
