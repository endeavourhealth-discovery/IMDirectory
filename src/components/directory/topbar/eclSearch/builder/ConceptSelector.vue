<template>
  <div class="concept-container">
    <Select
      style="width: 5.5rem; min-height: 2.3rem"
      v-model="constraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
      @change="updateConstraintOperator"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <div>{{ constraintOperator }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
    <div class="auto-complete-container">
      <AutocompleteSearchBar
        ref="searchBar"
        v-model:selected="selected"
        :im-query="imQueryForConceptSearch"
        :root-entities="[IM.ONTOLOGY_PARENT_FOLDER]"
        @update-selected="updateConcept"
        @activateInput="emit('activateInput', $event)"
      />
    </div>
    <template v-if="searchBar?.searchText && node.name">
      <Button
        v-if="searchBar?.searchText && searchBar.searchText !== node.name"
        label="?"
        class="sync-warning"
        severity="danger"
        v-tooltip="'Revert'"
        @click="searchBar.searchText = node.name!"
      />
    </template>

    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, computed } from "vue";
import { IM } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { QueryRequest, SearchResultSummary, Node } from "@/interfaces/AutoGen";
import { cloneDeep, isEqual } from "lodash-es";
import { useFilterStore } from "@/stores/filterStore";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters, constraintOperatorOptions, getConstraintOperator, setConstraintOperator } from "@/helpers/IMQueryBuilder";

interface Props {
  parent?: any;
}
defineProps<Props>();
const searchBar = ref<{ searchText: string } | null>(null);
const emit = defineEmits(["activateInput", "updateMatch"]);
const node = defineModel<Node>("node", { required: true });
watch(
  () => cloneDeep(node.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) await init();
  }
);

const filterStore = useFilterStore();
const constraintOperator = ref({});
const coreSchemes = computed(() => filterStore.coreSchemes);
const loading = ref(false);
const selected: Ref<SearchResultSummary> = ref({ iri: node.value.iri, name: node.value.name } as SearchResultSummary);
const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();

onMounted(() => {
  init();
});

watch(selected, (newValue, oldValue) => {
  if (newValue && !isEqual(newValue, oldValue) && newValue.iri) {
    updateConcept(newValue as SearchResultSummary);
  }
});

function init() {
  buildIMQueryForConceptSearch();
  constraintOperator.value = getConstraintOperator(node.value);
  if (node.value.iri) {
    selected.value.iri = node.value.iri;
    selected.value.name = node.value.name;
  }
}
function updateConstraintOperator(e: { value: string }) {
  setConstraintOperator(node.value, e.value);
  constraintOperator.value = e.value;
}

function buildIMQueryForConceptSearch() {
  const coreSchemesAsIris = coreSchemes.value.map(iri => {
    return { iri: iri };
  });
  const searchOptions: SearchOptions = {
    schemes: coreSchemesAsIris,
    status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
    types: [{ iri: IM.CONCEPT }]
  };
  imQueryForConceptSearch.value = buildIMQueryFromFilters(searchOptions);
}

function updateConcept(concept: SearchResultSummary) {
  if (concept) {
    node.value.iri = concept.iri;
    node.value.name = concept.name;
    emit("updateMatch", node.value);
  }
}
</script>

<style scoped lang="scss">
.concept-container {
  flex: 1 0 0%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.auto-complete-container {
  flex: 1 1 0%;
  min-width: 0;
}
.sync-warning {
  color: var(--p-black-500) !important;
}
</style>
