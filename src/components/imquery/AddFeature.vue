<template>
  <pre>addFeature={{ addFeature }},show=MatchType {{ showMatchTypeSelector }}</pre>
  <MatchTypeSelector
    v-if="showMatchTypeSelector"
    v-model:visible="showMatchTypeSelector"
    class="path - selector - overlay"
    :base-type="baseType"
    @node-selected="onMatchTypeSelected"
    @onCancel="cancel"
  />
  <DirectorySearchDialog
    :show-dialog="showCohortSelector"
    :imQuery="queryRequest"
    v-model:selected="selectedCohort"
    :root-entities="rootCohortFolder"
    :selected-filter-options="cohortFilterOptions"
    @update:showDialog="cancel"
  />
</template>

<script lang="ts" setup>
import { Match, Node, QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { Ref, ref, watch } from "vue";
import MatchTypeSelector from "./MatchTypeSelector.vue";
import { TreeNode } from "primevue/treenode";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { SearchOptions } from "@/interfaces";
import { IM } from "@/vocabulary";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";

interface Props {
  baseType: Node;
}

const addFeature = defineModel<boolean>("addFeature", { default: false });
const props = defineProps<Props>();
const showCohortSelector = ref(false);
const showMatchTypeSelector = ref(true);
const selectedCohort: Ref<SearchResultSummary | undefined> = ref();
<<<<<<< HEAD
const cohortFilterOptions: Ref<SearchOptions> = ref({ types: [{ iri: IM.COHORT_QUERY }], status: [], schemes: [] });
=======
const cohortFilterOptions: Ref<SearchOptions> = ref({ types: [{ "@id": IM.QUERY }], status: [], schemes: [] });
>>>>>>> rich/eslint
const queryRequest: Ref<QueryRequest | undefined> = ref();
const rootCohortFolder = [IM.NAMESPACE + "Q_Queries"];
const emit = defineEmits<{
  (event: "onAddMatch", match: Match): void;
  (event: "onAddCohort", match: Match): void;
}>();

watch(
  selectedCohort,
  newValue => {
    const match = {
      typeOf: props.baseType,
      instanceOf: [{ iri: newValue?.iri, name: newValue?.name, memberOf: true }]
    } as Match;
    emit("onAddCohort", match);
  },
  { deep: true }
);

const onMatchTypeSelected = async (node: any) => {
  if (node) {
    if (node.type === "cohort") {
      showMatchTypeSelector.value = false;
      queryRequest.value = buildIMQueryFromFilters(cohortFilterOptions.value);
      showCohortSelector.value = true;
    } else createMatch(node);
  }
};

const cancel = () => {
  addFeature.value = false;
  showMatchTypeSelector.value = true;
};

async function createMatch(node: TreeNode) {
  let match = { typeOf: props.baseType } as Match;
  if (node.data.pathMatch) {
    match = node.data.pathMatch;
  }
  match.where = { iri: node.data.iri, name: node.label };
  emit("onAddMatch", match);
}
</script>
