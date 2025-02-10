<template>
  <div v-if="loading" class="flex flex-auto">
    <ProgressSpinner />
  </div>
  <div v-else id="im-query-editor-container">
    <div class="base-type-container">
      <div class="base-type-title side-title">Find all:</div>
      <div class="base-type-value">
        <AutocompleteSearchBar
          v-model:selected="selectedBaseType"
          :im-query="imQueryForBaseType"
          :root-entities="[IM.HEALTH_RECORDS, IM.MODULE_QUERIES]"
          class="base-type-autocomplete"
        />
      </div>
    </div>
    <div v-if="selectedBaseType" class="feature-container">
      <div class="feature-title side-title">Where:</div>
      <div class="feature-list">
        <div class="feature-list-container">
          <EditMatch
            :edit-match="editQueryDefinition"
            :is-boolean-editor="true"
            :is-root-feature="true"
            class="feature-description clickable"
            @on-update-dialog-focus="editMatch"
          />
          <EditMatchDialog
            v-model:show-dialog="showDialog"
            :match="selectedMenuItem?.editMatch"
            :query-base-type-iri="selectedBaseType?.iri!"
            :has-then="!!selectedMenuItem?.editMatch?.then"
            @save-changes="onSaveChanges"
          />
        </div>
      </div>
    </div>
    <AddMatch
      v-model:show-build-feature="showBuildFeature"
      v-model:show-build-then-feature="showBuildThenFeature"
      :edit-match="editQueryDefinition"
      :match-type-of-iri="selectedBaseType?.iri!"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, provide, Ref, ref, watch } from "vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { Match, Node, Query, QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { QueryService } from "@/services";
import EditMatchDialog from "./EditMatchDialog.vue";
import { IM, SHACL } from "@/vocabulary";
import { cloneDeep } from "lodash-es";
import AddMatch from "./AddMatch.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import EditMatch from "./EditMatch.vue";
import type { MenuItem } from "primevue/menuitem";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";

interface Props {
  queryDefinition?: Query;
}

const emit = defineEmits({
  updateQuery: (_payload: Query) => true
});

const props = defineProps<Props>();
const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const editQueryDefinition: Ref<Query> = ref({});
const showDialog = ref(false);
const imQueryForBaseType: Ref<QueryRequest | undefined> = ref();
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const variableMap: Ref<{ [key: string]: any }> = ref({});
const selectedMenuItem: Ref<MenuItem | undefined> = ref();
const loading = ref(true);
provide("selectedBaseType", selectedBaseType);
provide("variableMap", variableMap);
provide("fullQuery", editQueryDefinition);
const { populateVariableMap } = setupIMQueryBuilderActions();

watch(
  () => cloneDeep(editQueryDefinition.value),
  async (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      editQueryDefinition.value = await QueryService.getQueryDisplayFromQuery(editQueryDefinition.value, false);
      populateVariableMap(variableMap.value, editQueryDefinition.value);
      emit("updateQuery", editQueryDefinition.value);
    }
  }
);

watch(
  () => cloneDeep(selectedBaseType.value),
  (newValue, oldValue) => {
    if (newValue?.iri !== oldValue?.iri && oldValue?.iri && editQueryDefinition.value.typeOf?.["@id"]) editQueryDefinition.value.match = [];
    if (selectedBaseType.value) editQueryDefinition.value.typeOf = { "@id": selectedBaseType.value.iri } as Node;
  }
);

onMounted(async () => {
  loading.value = true;
  if (props.queryDefinition) {
    editQueryDefinition.value = cloneDeep(props.queryDefinition);
    editQueryDefinition.value = await QueryService.getQueryDisplayFromQuery(editQueryDefinition.value, false);
    if (editQueryDefinition.value.typeOf)
      selectedBaseType.value = {
        iri: editQueryDefinition.value.typeOf?.["@id"],
        name: editQueryDefinition.value.typeOf?.name
      } as SearchResultSummary;

    buildImQueryForBaseType();
    populateVariableMap(variableMap.value, editQueryDefinition.value);
  }
  loading.value = false;
});

function buildImQueryForBaseType() {
  const searchOptions: SearchOptions = {
    status: [{ "@id": IM.ACTIVE }, { "@id": IM.DRAFT }],
    types: [{ "@id": SHACL.NODESHAPE }]
  } as SearchOptions;
  imQueryForBaseType.value = buildIMQueryFromFilters(searchOptions);
}

function editMatch(menuItems: MenuItem[]) {
  if (menuItems && isArrayHasLength(menuItems)) selectedMenuItem.value = menuItems[menuItems.length - 1];
  showDialog.value = true;
}

async function onSaveChanges(editMatch: Match) {
  if (selectedMenuItem.value) {
    const describedMatch = await QueryService.getQueryDisplayFromQuery(editMatch, false);
    if (describedMatch.where) selectedMenuItem.value.editMatch.where = describedMatch.where;
    if (describedMatch.match) selectedMenuItem.value.editMatch.match = describedMatch.match;
    selectedMenuItem.value.editMatch.then = describedMatch.then;
    if (describedMatch.groupBy) selectedMenuItem.value.editMatch.groupBy = describedMatch.groupBy;
    if (describedMatch.orderBy) selectedMenuItem.value.editMatch.orderBy = describedMatch.orderBy;
    if (isObjectHasKeys(describedMatch, ["exclude"])) selectedMenuItem.value.editMatch.exclude = describedMatch.exclude;
    if (describedMatch.instanceOf) selectedMenuItem.value.editMatch.instanceOf = describedMatch.instanceOf;
    if (isObjectHasKeys(describedMatch, ["nodeRef"])) selectedMenuItem.value.editMatch.nodeRef = describedMatch.nodeRef;
    if (describedMatch.typeOf) selectedMenuItem.value.editMatch.typeOf = describedMatch.typeOf;
    if (isObjectHasKeys(describedMatch, ["name"])) selectedMenuItem.value.editMatch.name = describedMatch.name;
    if (isObjectHasKeys(describedMatch, ["description"])) selectedMenuItem.value.editMatch.description = describedMatch.description;
    if (isObjectHasKeys(describedMatch, ["variable"])) selectedMenuItem.value.editMatch.variable = describedMatch.variable;
  }
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

.feature-description {
  width: 100%;
}

.add-feature-button {
  margin: 0.1rem;
}

.feature-description-card {
  padding: 0.5rem;
  border: var(--p-imquery-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--p-imquery-editor-background-color);
  flex: 1;
}

.feature-description-card-hover {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  background-color: var(--p-imquery-editor-background-color);
  flex: 1;
  border: var(--p-imquery-editor-hover-border-color) 1px solid;
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
