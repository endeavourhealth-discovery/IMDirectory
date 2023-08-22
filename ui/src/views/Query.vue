<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Query</strong></span>
        </div>
      </template>
    </TopBar>
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div class="include-title include">include if</div>
      <div v-if="queryTypeIri" class="type-title" @click="showAddBaseTypeDialog = true">{{ getNameFromRef({ "@id": queryTypeIri }) }}</div>

      <EditDisplayMatch
        v-if="isArrayHasLength(query.match)"
        v-for="(match, index) of query.match"
        :match="match"
        :index="index"
        :query-type-iri="queryTypeIri"
        :parentMatchList="query.match"
      />

      <div v-else-if="!queryTypeIri">
        <Button class="base-type-button" label="Add base type" @click="showAddBaseTypeDialog = true" />
      </div>
      <div v-if="!isArrayHasLength(query.match) && query['typeOf']">
        <Button class="base-type-button" label="Add property" @click="showAddDialog = true" />
      </div>

      <AddPropertyDialog v-model:show-dialog="showAddDialog" :base-type="queryTypeIri" :add-mode="'addAfter'" @on-add-or-edit="add" />
      <AddBaseTypeDialog v-model:show-dialog="showAddBaseTypeDialog" :query="query" />
    </div>
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
import { Match, Property, Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useRoute } from "vue-router";
import _ from "lodash";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
import EditDisplayMatch from "@/components/query/builder/display/EditDisplayMatch.vue";
import setupQueryBuilderActions from "@/composables/setupQueryBuilderActions";
import AddBaseTypeDialog from "@/components/query/builder/edit/dialogs/AddBaseTypeDialog.vue";
import AddPropertyDialog from "@/components/query/builder/edit/dialogs/AddPropertyDialog.vue";
import { describeQuery } from "@im-library/helpers/QueryDescriptor";
import { useQueryStore } from "@/stores/queryStore";

const queryStore = useQueryStore();
const filterStore = useFilterStore();
const validationQueryRequest: ComputedRef<QueryRequest> = computed(() => queryStore.$state.validationQueryRequest);
const query: Ref<any> = ref({ match: [] as Match[] } as Query);
const visibleDialog: Ref<boolean> = ref(false);
const queryTypeIri: Ref<string> = ref("");
const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);
const { showAddDialog, showAddBaseTypeDialog } = setupQueryBuilderActions();
const loading = ref(true);

watch(
  () => queryIri.value,
  async () => await init()
);

watch(
  () => _.cloneDeep(query.value),
  () => setBaseEntityMatch()
);

watch(
  () => _.cloneDeep(query.value),
  () => describeQuery(query.value)
);

watch(
  () => _.cloneDeep(query.value),
  () => initVariableMap()
);

watch(
  () => _.cloneDeep(queryTypeIri.value),
  () => setValidationQueryRequest()
);

onMounted(async () => {
  await filterStore.fetchFilterSettings();
  if (queryIri.value) await init();
  loading.value = false;
});

async function init() {
  await setQuery();
  setBaseEntityMatch();
  initVariableMap();
  setValidationQueryRequest();
}

async function setQuery() {
  const queryIri = resolveIri(route.params.queryIri as string);
  if (queryIri) query.value = await QueryService.getQueryDisplay(queryIri);
}

async function setBaseEntityMatch() {
  if (query.value["typeOf"]) queryTypeIri.value = query.value["typeOf"]["@id"];
  else if (isArrayHasLength(query.value?.match)) {
    // TODO: Set is an array
    queryTypeIri.value = (query.value.match![0]["@id"] ?? query.value.match![0]["typeOf"]?.["@id"] ?? query.value.match![0]["inSet"]?.[0]?.["@id"]) as string;
  }
}

function add(direct: Match[], nested: Match[]) {
  if (!isArrayHasLength(query.value.match)) query.value.match = [];
  for (const match of direct.concat(nested)) {
    query.value.match!.push(match);
  }
}

function initVariableMap() {
  const initMap = new Map<string, any>();
  initMap.clear();
  for (const match of query.value.match) {
    addVariableRefFromMatch(initMap, match);
  }

  queryStore.updateVariableMap(initMap);
}

function addVariableRefFromMatch(map: Map<string, any>, match: Match) {
  if (match.variable) map.set(match.variable, match);
  if (isArrayHasLength(match.match))
    for (const nestedMatch of match.match!) {
      addVariableRefFromMatch(map, nestedMatch);
    }

  if (isArrayHasLength(match.property))
    for (const property of match.property!) {
      addVariableRefFromProperty(map, property);
    }
}

function addVariableRefFromProperty(map: Map<string, any>, property: Property) {
  if (property.variable) map.set(property.variable, property);

  if (isObjectHasKeys(property, ["match"])) addVariableRefFromMatch(map, property.match!);

  if (isArrayHasLength(property.property))
    for (const nestedProperty of property.property!) {
      addVariableRefFromProperty(map, nestedProperty);
    }
}

function setValidationQueryRequest() {
  validationQueryRequest.value.argument = [
    {
      parameter: "dataModelIri",
      valueIri: {
        "@id": queryTypeIri.value
      }
    }
  ];
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

.base-type-button {
  margin-left: 0.5rem;
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
  cursor: pointer;
}

.type-title:hover {
  color: var(--highlight-text-color);
  background-color: var(--highlight-bg);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
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
  margin-bottom: 1rem;
}

.exclude {
  color: red;
  margin-bottom: 1rem;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}
</style>
