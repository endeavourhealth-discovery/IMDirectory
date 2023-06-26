<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <div class="include-title include">include if</div>
    <div v-if="query.type" class="type-title">{{ getNameFromRef({ "@id": query.type }) }}</div>

    <RecursiveQueryEdit
      v-if="isArrayHasLength(query.match)"
      v-for="(match, index) of query.match"
      :base-entity-match-iri="baseEntityMatchIri"
      :match="match"
      :selectedMatches="selectedMatches"
      :index="index"
      @on-add="add"
    />

    <Button v-else-if="!query.type" label="Add base type" @click="showAddBaseType = true" />
    <Button v-if="!isArrayHasLength(query.match) && query.type" label="Add feature" @click="showAddMatch = true" />

    <Dialog v-model:visible="showAddMatch" modal :header="'Add rule'" :style="{ width: '60vw' }">
      <AddFeature :base-type="query.type ?? baseEntityMatchIri" @on-close="showAddMatch = false" />
    </Dialog>

    <Dialog v-model:visible="showAddBaseType" modal :header="'Add base type'" :style="{ width: '60vw' }">
      <AddBaseType :query="query" @on-close="showAddBaseType = false" />
    </Dialog>

    <div class="button-bar">
      <Button label="showDialog" @click="showSearchDialog = true" />
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>

  <DirectorySearchDialog v-model:showDialog="showSearchDialog" />
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted, computed, ComputedRef, watch } from "vue";
import { useFilterStore } from "@/stores/filterStore";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import RecursiveQueryEdit from "@/components/query/edit/RecursiveQueryEdit.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { useRoute } from "vue-router";
import _ from "lodash";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
import AddBaseType from "@/components/query/edit/AddBaseType.vue";
import AddFeature from "@/components/query/edit/AddFeature.vue";

const filterStore = useFilterStore();
const query: Ref<Query> = ref({ match: [] as Match[] } as Query);
const visibleDialog: Ref<boolean> = ref(false);
const baseEntityMatchIri: Ref<string> = ref("");
const selectedMatches: Ref<Match[]> = ref([]);
const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);
const showAddBaseType: Ref<boolean> = ref(false);
const showAddMatch: Ref<boolean> = ref(false);

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
  if (isArrayHasLength(query.value?.match)) {
    baseEntityMatchIri.value = (query.value.match![0]["@id"] ?? query.value.match![0]["@type"] ?? query.value.match![0]["@set"]) as string;
  }
}

function add(matchIndex: number) {
  if (isArrayHasLength(query.value.match)) {
    const indexToAdd = matchIndex + 1;
    if (indexToAdd) {
      const newMatch = {} as Match;
      query.value.match!.splice(indexToAdd, 0, newMatch);
    }
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
