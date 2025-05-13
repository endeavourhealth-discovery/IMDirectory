<template>
  <div v-if="loading" class="flex flex-auto">
    <ProgressSpinner />
  </div>
  <div v-else id="im-query-editor-container">
    <div class="base-type-container">
      <span class="type-of-title">Type:</span>
      <span>{{ queryDefinition?.typeOf?.name }}</span>
    </div>
    <RecursiveMatchDisplay
      v-model:match="queryDefinition!"
      v-model:parentMatch="rootQuery"
      :edit-mode="true"
      :clauseIndex="-1"
      :propertyIndex="-1"
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
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";

const props = defineProps<{
  queryDefinition?: Query;
}>();

defineEmits<{
  updateQuery: [payload: Query];
}>();

const selectedBaseType: Ref<SearchResultSummary | undefined> = ref();
const editQueryDefinition: Ref<Match> = ref({});
const rootQuery: Ref<Match> = ref({});
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
    if (newValue?.iri !== oldValue?.iri && oldValue?.iri && editQueryDefinition.value.typeOf?.["@id"]) {
      editQueryDefinition.value.or = [];
      editQueryDefinition.value.and = [];
      editQueryDefinition.value.not = [];
    }
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
</style>
