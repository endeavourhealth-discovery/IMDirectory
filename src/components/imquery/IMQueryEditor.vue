<template>
  <div v-if="loading" class="flex flex-auto">
    <ProgressSpinner />
  </div>
  <div v-else id="im-query-editor-container">
    <div class="base-type-container">
      <span class="type-of-title">Type:</span>
      <span>{{ queryDefinition?.typeOf?.name }}</span>
    </div>
    <RecursiveMatchEditor
      v-model:match="queryDefinition!"
      v-model:parentMatch="editQueryDefinition"
      :clauseIndex="-1"
      :depth="0"
      :inline="false"
      :bracketed="false"
      :expanded="queryDefinition!.name === undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, provide, Ref, ref, watch } from "vue";
import { Match, Node, Query, QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { IM, SHACL } from "@/vocabulary";
import { cloneDeep } from "lodash-es";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import RecursiveMatchEditor from "@/components/imquery/RecursiveMatchEditor.vue";

const props = defineProps<{
  queryDefinition?: Query;
}>();

defineEmits<{
  updateQuery: [payload: Query];
}>();

const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const editQueryDefinition: Ref<Match> = ref({});

const imQueryForBaseType: Ref<QueryRequest | undefined> = ref();
const variableMap: Ref<{ [key: string]: any }> = ref({});

const loading = ref(true);
provide("selectedBaseType", selectedBaseType);
provide("variableMap", variableMap);
provide("fullQuery", editQueryDefinition);
const { populateVariableMap } = setupIMQueryBuilderActions();

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
