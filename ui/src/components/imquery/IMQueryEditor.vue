<template>
  <div class="im-query-container">
    <div class="base-type-container">
      <div class="base-type-title">Base type:</div>
      <AutocompleteSearchBar
        class="base-type-autocomplete"
        v-model:selected="selectedBaseType"
        :search-by-query="queryRequestForBaseType"
        :root-entities="['http://endhealth.info/im#DataModel']"
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
        <EditMatchDialog v-model:show-dialog="showDialog" :match="selectedMatch" />
      </div>
    </div>
    <Button label="Add feature" @click="queryDefinition.match?.push({} as Match)" severity="success" icon="fa-solid fa-plus" class="add-feature-button" />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { Match, Query, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { QueryService } from "@/services";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatchDialog from "./EditMatchDialog.vue";

const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const queryDefinition: Ref<Query> = ref({});
const hover: Ref<number> = ref(-1);
const showDialog = ref(false);
const selectedMatch: Ref<Match | undefined> = ref();
const queryRequestForBaseType: QueryRequest = {
  query: {
    name: "Get queries and data models",
    match: [
      {
        typeOf: { "@id": "http://www.w3.org/ns/shacl#NodeShape" }
      }
    ]
  }
};

onMounted(async () => {
  queryDefinition.value = await QueryService.getQueryDisplay("http://endhealth.info/im#Q_TestQuery");
  if (queryDefinition.value.typeOf)
    selectedBaseType.value = { iri: queryDefinition.value.typeOf?.["@id"], name: queryDefinition.value.typeOf?.name } as SearchResultSummary;
});

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
  showDialog.value = true;
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
  width: 20rem;
  margin-top: 0.5rem;
  margin-left: 1.2rem;
}

.feature-description-card {
  width: calc(94vw - 7rem);
  padding: 0.5rem;
  border: #6bb28c30 1px solid;
  border-radius: 5px;
  background-color: #6bb28c10;
  margin: 0.2rem;
  flex: 1;
}

.feature-description-card-hover {
  width: calc(94vw - 7rem);
  padding: 0.5rem;
  border-radius: 5px;
  background-color: #6bb28c10;
  margin: 0.2rem;
  flex: 1;
  border: #6bb28c 1px solid;
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
</style>

<style>
.builder-button {
  width: 2rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
</style>
