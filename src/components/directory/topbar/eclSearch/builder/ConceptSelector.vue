<template>
  <div v-if="value.conceptSingle" class="concept-container">
    <Select
      style="width: 5rem; min-height: 2.3rem"
      v-model="value.constraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <div>{{ value.constraintOperator }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
    <AutocompleteSearchBar v-model:selected="selected" :im-query="imQueryForConceptSearch" :root-entities="[IM.ONTOLOGY_PARENT_FOLDER]" />
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, computed } from "vue";
import { IM } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { EntityService } from "@/services";
import { cloneDeep, isEqual } from "lodash-es";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useFilterStore } from "@/stores/filterStore";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";

interface Props {
  value: {
    type: string;
    constraintOperator: string;
    conjunction: string;
    refinementItems: any[];
    conceptSingle: { iri: string; name?: string } | undefined;
    conceptBool: { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
    ecl?: string;
    exclude?: boolean;
  };
  parent?: any;
}
const props = defineProps<Props>();

watch(
  () => cloneDeep(props.value.conceptSingle),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) await init();
  }
);

const filterStore = useFilterStore();
const coreSchemes = computed(() => filterStore.coreSchemes);

const loading = ref(false);
const selected: Ref<SearchResultSummary | undefined> = ref();

const constraintOperatorOptions = [
  {
    label: " ",
    value: ""
  },
  {
    label: "<<",
    value: "<<"
  },
  {
    label: "<",
    value: "<"
  },
  {
    label: "^",
    value: "^"
  }
];

const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();

onMounted(async () => {
  await init();
});

watch(selected, (newValue, oldValue) => {
  if (newValue && !isEqual(newValue, oldValue) && newValue.iri) {
    updateConcept(newValue);
  }
});

async function init() {
  buildIMQueryForConceptSearch();
  if (props.value?.conceptSingle) {
    loading.value = true;
    await updateSelectedResult(props.value.conceptSingle);
    loading.value = false;
  }
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

async function updateSelectedResult(data: SearchResultSummary | { iri: string; name?: string }) {
  if (!isObjectHasKeys(data)) selected.value = undefined;
  else if (isObjectHasKeys(data, ["entityType"])) selected.value = data as SearchResultSummary;
  else if (data.iri) {
    const asSummary = await EntityService.getEntitySummary(data.iri);
    selected.value = isObjectHasKeys(asSummary) ? asSummary : undefined;
  } else {
    selected.value = undefined;
  }
}

function updateConcept(concept: SearchResultSummary | undefined) {
  if (!concept) props.value.conceptSingle = undefined;
  else props.value.conceptSingle = { iri: concept.iri };
}
</script>

<style scoped lang="scss">
.concept-container {
  flex: 1 0 auto;
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
</style>
