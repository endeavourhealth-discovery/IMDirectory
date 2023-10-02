<template>
  <div id="query-main-container">
    <div class="include-title include">include if</div>
    <div v-if="queryTypeIri" class="type-title" @click="showAddBaseTypeDialog = true">{{ getNameFromRef({ "@id": queryTypeIri }) }}</div>

    <EditDisplayMatch v-if="isArrayHasLength(query.match)" v-for="(match, index) of query.match" :match="match" :index="index" :parentMatchList="query.match" />

    <div v-else-if="!queryTypeIri">
      <Button class="base-type-button" label="Add base type" @click="showAddBaseTypeDialog = true" />
    </div>
    <div v-if="query['typeOf']">
      <SplitButton label="Add property" :model="addOptions" icon="pi pi-pencil" @click="showAddDialog = true" class="base-type-button"></SplitButton>
    </div>

    <AddPropertyDialog
      v-model:show-dialog="showAddDialog"
      :header="'Add properties'"
      :show-variable-options="true"
      :match-type="queryTypeIri"
      @on-save="onPropertyAdd"
    />
    <AddBaseTypeDialog v-model:show-dialog="showAddBaseTypeDialog" :query="query" />
    <DirectorySearchDialog
      v-model:show-dialog="showDirectoryDialog"
      @update:selected="onSelect"
      :searchByQuery="validationQueryRequest"
      :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
    />
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import { ref, Ref, onMounted, computed, ComputedRef, watch } from "vue";
import { Match, Property, Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import _ from "lodash";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import EditDisplayMatch from "@/components/query/builder/display/EditDisplayMatch.vue";
import setupQueryBuilderActions from "@/composables/setupQueryBuilderActions";
import AddBaseTypeDialog from "@/components/query/builder/edit/dialogs/AddBaseTypeDialog.vue";
import AddPropertyDialog from "@/components/query/builder/edit/dialogs/AddPropertyDialog.vue";
import { describeQuery } from "@im-library/helpers/QueryDescriptor";
import { useQueryStore } from "@/stores/queryStore";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { buildInSetMatchFromCS } from "@im-library/helpers/QueryBuilder";
import { IM } from "@im-library/vocabulary";

interface Props {
  queryDefinition: Query;
}

const props = defineProps<Props>();

const queryStore = useQueryStore();
const validationQueryRequest: ComputedRef<QueryRequest> = computed(() => queryStore.$state.validationQueryRequest);
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const query: Ref<any> = ref({ match: [] as Match[] } as Query);
const showDirectoryDialog: Ref<boolean> = ref(false);
const { showAddDialog, showAddBaseTypeDialog, addMatchesToList } = setupQueryBuilderActions();

const addOptions = [
  {
    label: "Add Cohort",
    icon: "pi pi-search",
    command: () => (showDirectoryDialog.value = true)
  },
  {
    label: "Template",
    icon: "pi pi-plus"
  }
];

onMounted(() => init());

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
  () => queryTypeIri.value,
  () => setValidationQueryRequest()
);

function init() {
  query.value = props.queryDefinition;
  setBaseEntityMatch();
  initVariableMap();
  setValidationQueryRequest();
}

async function setBaseEntityMatch() {
  if (isObjectHasKeys(query.value.typeOf, ["@id"])) queryStore.updateReturnType(query.value["typeOf"]["@id"]);
}

function initVariableMap() {
  const initMap = new Map<string, any>();
  initMap.clear();
  for (const match of query.value.match) {
    addVariableRefFromMatch(initMap, match);
  }

  queryStore.updateVariableMap(initMap);
}

function onSelect(cs: ConceptSummary) {
  const newMatch = buildInSetMatchFromCS(cs) as Match;
  if (!isArrayHasLength(query.value.match)) query.value.match = [];
  query.value.match.push(newMatch);
  showDirectoryDialog.value = false;
}

function onPropertyAdd(direct: Match[], nested: Match[]) {
  if (!isArrayHasLength(query.value.match)) query.value.match = [];
  query.value.match = query.value.match.concat(direct.concat(nested));
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

<style>
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
  flex-flow: column;
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
