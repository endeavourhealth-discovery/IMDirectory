<template>
  <div v-if="value.conceptSingle" class="concept-container">
    <Dropdown
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="value.constraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex align-items-center">
          <div>{{ value.constraintOperator }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex align-items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Dropdown>
    <AutocompleteSearchBar v-model:selected="selected" :osQuery="osQueryForConceptSearch" :root-entities="['http://snomed.info/sct#138875005']" />
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, inject, computed } from "vue";
import { IM, SNOMED } from "@im-library/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { SearchRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import _ from "lodash";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { isAliasIriRef } from "@im-library/helpers/TypeGuards";
import { useFilterStore } from "@/stores/filterStore";
import { SortDirection } from "@im-library/enums";

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
  () => _.cloneDeep(props.value.conceptSingle),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) await init();
  }
);

const filterStore = useFilterStore();
const filterStoreOptions = computed(() => filterStore.filterOptions);

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

const osQueryForConceptSearch: Ref<SearchRequest> = ref({
  schemeFilter: filterStoreOptions.value.schemes.filter(filterOption => [SNOMED.NAMESPACE, IM.NAMESPACE].includes(filterOption["@id"])).map(s => s["@id"]),
  statusFilter: filterStoreOptions.value.status.map(s => s["@id"]),
  typeFilter: filterStoreOptions.value.types.filter(filterOption => filterOption["@id"] === IM.CONCEPT).map(s => s["@id"]),
  sortDirection: filterStoreOptions.value.sortDirections[0]?.["@id"] === IM.DESCENDING ? SortDirection.DESC : SortDirection.ASC,
  sortField: filterStoreOptions.value.sortFields[0]?.["@id"] === IM.USAGE ? "weighting" : filterStoreOptions.value.sortFields[0]?.["@id"]
} as SearchRequest);

onMounted(async () => {
  await init();
});

watch(selected, (newValue, oldValue) => {
  if (newValue && !_.isEqual(newValue, oldValue) && newValue.iri) {
    updateConcept(newValue);
  }
});

async function init() {
  if (props.value?.conceptSingle) {
    loading.value = true;
    await updateSelectedResult(props.value.conceptSingle);
    loading.value = false;
  }
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

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
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
  color: var(--text-color);
  background: var(--surface-a);
  border: 1px solid var(--surface-border);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: 3px;
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
  color: var(--text-color-secondary);
}

.selected-label {
  padding-left: 0.5rem;
}
</style>
