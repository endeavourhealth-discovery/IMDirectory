<template>
  <div id="query-main-container">
    <div class="include">include if</div>
    <div v-if="queryTypeIri" class="type-title" @click="showAddBaseTypeDialog = true">{{ getNameFromRef({ "@id": queryTypeIri }) }}</div>

    <EditDisplayMatch v-if="isArrayHasLength(query.match)" v-for="(match, index) of query.match" :match="match" :index="index" :parentMatchList="query.match" />

    <div v-else-if="!queryTypeIri" class="flex gap-1">
      <Button label="Set base type" icon="fa-solid fa-diagram-project" @click="showAddBaseTypeDialog = true" severity="help" />
      <Button label="Add population" icon="fa-solid fa-magnifying-glass" @click="showAddBaseTypeByCohortDialog = true" severity="success" />
    </div>
    <div v-if="query.typeOf" class="flex gap-1">
      <Button label="Add feature" icon="fa-solid fa-circle-plus" @click="showAddDialog = true" severity="warning" />
      <Button label="Add population" icon="fa-solid fa-magnifying-glass" @click="showDirectoryDialog = true" severity="success" />
      <Button label="Paste feature" icon="fa-solid fa-paste" @click="pasteMatch" severity="info" />
    </div>

    <AddPropertyDialog
      v-model:show-dialog="showAddDialog"
      :header="'Add feature'"
      :show-variable-options="true"
      :match-type="queryTypeIri"
      @on-save="onPropertyAdd"
    />
    <AddBaseTypeDialog
      v-model:show-dialog="showAddBaseTypeDialog"
      :query="query"
      :filter-options="filterOptionsForBaseType"
      :validation-query-request="queryRequestForBaseType"
      :root-entities="['http://endhealth.info/im#DataModel']"
    />
    <AddBaseTypeDialog
      v-model:show-dialog="showAddBaseTypeByCohortDialog"
      :query="query"
      :filter-options="filterOptionsForCohort"
      :validation-query-request="queryRequestForCohort"
      :root-entities="['http://endhealth.info/im#Q_Queries']"
    />

    <DirectorySearchDialog
      v-model:show-dialog="showDirectoryDialog"
      @update:selected="onSelect"
      :searchByQuery="validationQueryRequest"
      :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
      :filter-options="filterOptionsForCohort"
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
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { buildInSetMatchFromCS } from "@im-library/helpers/QueryBuilder";
import { IM, SHACL } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { v4 } from "uuid";

interface Props {
  queryDefinition: Query;
}

const props = defineProps<Props>();
const queryStore = useQueryStore();
const toast = useToast();
const validationQueryRequest: ComputedRef<QueryRequest> = computed(() => queryStore.$state.validationQueryRequest);
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const query: Ref<any> = ref({ match: [] as Match[] } as Query);
const showDirectoryDialog: Ref<boolean> = ref(false);
const { showAddDialog, showAddBaseTypeDialog, addMatchesToList } = setupQueryBuilderActions();
const showAddBaseTypeByCohortDialog = ref(false);
const filterOptionsForCohort: FilterOptions = { types: [{ "@id": IM.COHORT_QUERY }] } as FilterOptions;
const filterOptionsForBaseType: FilterOptions = { types: [{ "@id": SHACL.NODESHAPE }] } as FilterOptions;
const queryRequestForBaseType: Ref<QueryRequest> = ref({
  query: {
    name: "Get queries and data models",
    match: [
      {
        typeOf: { "@id": "http://www.w3.org/ns/shacl#NodeShape" }
      }
    ]
  }
});

const queryRequestForCohort: Ref<QueryRequest> = ref({
  query: {
    name: "Get queries and data models",
    match: [
      {
        typeOf: { "@id": "http://endhealth.info/im#CohortQuery" }
      }
    ]
  }
} as QueryRequest);

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

async function pasteMatch() {
  const copiedString = await navigator.clipboard.readText();
  if (!copiedString)
    toast.add(new ToastOptions(ToastSeverity.ERROR, "No copied value found. To copy a feature right-click on a feature and select 'Copy feature'."));
  else
    try {
      const copyObject: { queryTypeIri: string; match: Match } = JSON.parse(copiedString);
      if (isObjectHasKeys(copyObject, ["queryTypeIri"]) && isObjectHasKeys(copyObject, ["match"])) {
        if (copyObject.queryTypeIri !== queryTypeIri.value) throw new RangeError("Copied match does not have the same return type as the current query.");
        if (!isArrayHasLength(query.value.match)) query.value.match = [];
        copyObject.match["@id"] = v4();
        query.value.match.push(copyObject.match);
        toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Value was pasted."));
      }
    } catch (error: any) {
      if (error.name === "SyntaxError") toast.add(new ToastOptions(ToastSeverity.ERROR, "Copied value is not a valid match object."));
      else if (error.name === "RangeError") toast.add(new ToastOptions(ToastSeverity.ERROR, error.message));
      else throw error;
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

<style scoped>
#query-main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
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
}

.exclude {
  color: red;
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
