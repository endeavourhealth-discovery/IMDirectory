<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <div class="include-title include">include if</div>

    <RecursiveQueryEdit
      v-for="(match, index) of query.match"
      :base-entity-match="baseEntityMatch"
      :match="match"
      :selectedMatches="selectedMatches"
      :index="index"
    />

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
import RecursiveQueryEdit from "@/components/query/edit/RecursiveQueryEdit.vue";
import { useRoute } from "vue-router";
import _ from "lodash";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
const filterStore = useFilterStore();
const query: Ref<Query> = ref({ match: [] as Match[] } as Query);
const visibleDialog: Ref<boolean> = ref(false);
const baseEntityMatch = ref({} as Match);
const selectedMatches: Ref<Match[]> = ref([]);
const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);

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
    baseEntityMatch.value = query.value.match![0];
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
