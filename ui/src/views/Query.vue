<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Query</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="include-title include">include if</div>
    <div v-if="baseEntityMatchIri" class="type-title">{{ getNameFromRef({ "@id": baseEntityMatchIri }) }}</div>
    <RecursiveQueryEdit
      v-if="isArrayHasLength(query.match)"
      v-for="(match, index) of query.match"
      :base-entity-match-iri="baseEntityMatchIri"
      :match="match"
      :selectedMatches="selectedMatches"
      :index="index"
      @on-add="add"
      @on-remove="remove"
      @on-group="group"
      @on-ungroup="ungroup"
      @on-move-up="moveUp"
      @on-move-down="moveDown"
    />

    <div v-else-if="!baseEntityMatchIri">
      <Button label="Add base type" @click="showAddBaseType = true" />
    </div>
    <div v-if="!isArrayHasLength(query.match) && query.type">
      <Button label="Add feature" @click="showAddProperty = true" />
    </div>

    <Dialog v-model:visible="showAddProperty" modal :header="'Add rule'" :style="{ width: '60vw' }">
      <AddProperty :base-type="baseEntityMatchIri" @on-close="showAddProperty = false" @on-add-property="addProperty" />
    </Dialog>

    <Dialog v-model:visible="showAddBaseType" modal :header="'Add base type'" :style="{ width: '60vw' }">
      <AddBaseType :query="query" @on-close="showAddBaseType = false" />
    </Dialog>

    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted, computed, ComputedRef, watch } from "vue";
import { useFilterStore } from "@/stores/filterStore";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import RecursiveQueryEdit from "@/components/query/builder/RecursiveQueryEdit.vue";
import { describeMatch, describeWhere } from "@im-library/helpers/QueryDescriptor";
import { useRoute } from "vue-router";
import _ from "lodash";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
import AddBaseType from "@/components/query/builder/edit/baseType/AddBaseType.vue";
import AddProperty from "@/components/query/builder/edit/AddProperty.vue";

const filterStore = useFilterStore();
const query: Ref<Query> = ref({ match: [] as Match[] } as Query);
const visibleDialog: Ref<boolean> = ref(false);
const baseEntityMatchIri: Ref<string> = ref("");
const selectedMatches: Ref<Match[]> = ref([]);
const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);
const showAddBaseType: Ref<boolean> = ref(false);
const showAddProperty: Ref<boolean> = ref(false);

watch(
  () => queryIri.value,
  async () => await init()
);

watch(
  () => _.cloneDeep(query.value),
  () => setBaseEntityMatch()
);

onMounted(async () => {
  await filterStore.fetchFilterSettings();
  if (queryIri.value) await init();
});

async function init() {
  await setQuery();
  setBaseEntityMatch();
}

async function setQuery() {
  const queryIri = resolveIri(route.params.queryIri as string);
  query.value = await QueryService.getQueryDisplay(queryIri);
}

async function setBaseEntityMatch() {
  if (query.value.type) baseEntityMatchIri.value = query.value.type;
  else if (isArrayHasLength(query.value?.match)) {
    baseEntityMatchIri.value = (query.value.match![0]["@id"] ?? query.value.match![0]["@type"] ?? query.value.match![0]["@set"]) as string;
  }
}

function add(matchIndex: number, newMatch: Match) {
  if (isArrayHasLength(query.value.match)) {
    const indexToAdd = matchIndex + 1;
    if (indexToAdd) {
      query.value.match!.splice(indexToAdd, 0, newMatch);
    }
  }
}

function addProperty(newMatch: Match) {
  if (!isArrayHasLength(query.value.match)) query.value.match = [];
  query.value.match!.push(newMatch);
  showAddProperty.value = false;
}

function remove(matchIndex: number) {
  query.value.match!.splice(matchIndex, 1);
}

function group(matchIndex: number) {
  const firstSelected = selectedMatches.value[0];
  const indexOfFirstSelected = query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
  const groupedMatch = { boolMatch: "and", match: [] } as Match;
  for (const selectedMatch of selectedMatches.value) {
    const index = query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch));
    groupedMatch.match!.splice(index, 0, selectedMatch);
    console.log(index);
  }
  for (const selectedMatch of selectedMatches.value) remove(query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch)));
  describeMatch([groupedMatch], "match");
  query.value.match!.splice(indexOfFirstSelected, 0, groupedMatch);
}

function ungroup(matchIndex: number) {
  remove(matchIndex);
  const tempArray = selectedMatches.value[0].match!.reverse();
  for (const ungroupedMatch of tempArray) query.value.match!.splice(matchIndex, 0, ungroupedMatch);
}

function moveUp(matchIndex: number) {
  if (query.value.match && matchIndex !== 0 && matchIndex !== 1) {
    query.value.match.splice(matchIndex - 1, 0, query.value?.match[matchIndex]);
    query.value.match.splice(matchIndex + 1, 1);
  }
}

function moveDown(matchIndex: number) {
  if (query.value.match && matchIndex !== query.value.match.length - 1) {
    query.value.match.splice(matchIndex + 2, 0, query.value?.match[matchIndex]);
    query.value.match.splice(matchIndex, 1);
  }
}
</script>

<style lang="scss">
#topbar-query-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

#query-main-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #ffffff;
  display: flex;
  flex-flow: row;
  border: 2px solid #b89241;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.type-title {
  margin-left: 0.5rem;
}

.include-title {
  margin-left: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 0.1rem;
}

.variable {
  color: rgb(78, 2, 150) !important;
}

.variable-line {
  margin-left: 1rem !important;
}

.node-ref {
  color: rgb(138, 67, 138) !important;
  cursor: pointer !important;
}

.and {
  color: orange;
  cursor: pointer;
}

.or {
  color: blue;
  cursor: pointer;
}

.include {
  color: green;
  cursor: pointer;
  margin-bottom: 1rem;
}

.exclude {
  color: red;
  cursor: pointer;
  margin-bottom: 1rem;
}
</style>
