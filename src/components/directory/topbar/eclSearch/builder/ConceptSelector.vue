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
        v-model:selected="selected as SearchResultSummary"
        :im-query="imQueryForConceptSearch"
        :root-entities="[IM.ONTOLOGY_PARENT_FOLDER]"
      />
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, computed } from "vue";
import { IM, SNOMED } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { QueryRequest, SearchResultSummary, Node, Match } from "@/interfaces/AutoGen";
import { EntityService } from "@/services";
import { cloneDeep, isEqual } from "lodash-es";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useFilterStore } from "@/stores/filterStore";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters, constraintOperatorOptions, getConstraintOperator, setConstraintOperator } from "@/helpers/IMQueryBuilder";
import Tooltip from "primevue/tooltip";

interface Props {
  parent?: any;
}
const props = defineProps<Props>();
const node = defineModel<Node>("node", { default: {} });
watch(
  () => cloneDeep(node.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) await init();
  }
);

const filterStore = useFilterStore();
const constraintOperator = ref({});
const filterStoreOptions = computed(() => filterStore.filterOptions);
const coreSchemes = computed(() => filterStore.coreSchemes);

const loading = ref(false);
const selected: Ref<Partial<SearchResultSummary>> = ref({});

const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();

onMounted(async () => {
  await init();
});

watch(selected, (newValue, oldValue) => {
  if (newValue && !isEqual(newValue, oldValue) && newValue.iri) {
    updateConcept(newValue as SearchResultSummary);
  }
});

async function init() {
  buildIMQueryForConceptSearch();
  selected.value.iri = node.value["@id"];
  selected.value.name = node.value.name;
  constraintOperator.value = getConstraintOperator(node.value);
}
function updateConstraintOperator(e: { value: string }) {
  setConstraintOperator(node.value, e.value);
  constraintOperator.value = e.value;
}

function buildIMQueryForConceptSearch() {
  const coreSchemesAsIris = coreSchemes.value.map(iri => {
    return { "@id": iri };
  });
  const searchOptions: SearchOptions = {
    schemes: coreSchemesAsIris,
    status: [{ "@id": IM.ACTIVE }, { "@id": IM.DRAFT }],
    types: [{ "@id": IM.CONCEPT }]
  };
  imQueryForConceptSearch.value = buildIMQueryFromFilters(searchOptions);
}

function updateConcept(concept: SearchResultSummary) {
  if (concept) {
    node.value["@id"] = concept.iri;
    node.value.name = concept.name;
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
.constraint-operator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}

.auto-complete {
  flex: 1 0 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}
.auto-complete-container {
  flex: 1 1 0%;
  min-width: 0;
}

.search-text {
  flex: 1 1 auto;
  min-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--p-text-color);
  background: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: var(--p-textarea-border-radius);
  height: 2.7rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.any-checkbox-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem 0 0;
}

.clickable {
  cursor: pointer;
}

.inactive {
  color: var(--p-text-color-secondary);
}

.selected-label {
  padding-left: 0.5rem;
}
</style>
