<template>
  <div class="match-container" v-if="propertyType">
    <Dropdown :options="['typeOf', 'instanceOf']" v-model:model-value="propertyType" />
    <div v-if="propertyType === 'is' && editMatch.is" class="multi-select">
      <SingleEntitySelector v-for="is in editMatch.is" :edit-node="is" />
    </div>
    <SingleEntitySelector v-else-if="propertyType === 'typeOf' && editMatch.typeOf" :edit-node="editMatch.typeOf" />
    <SingleEntitySelector v-else-if="propertyType === 'instanceOf' && editMatch.instanceOf" :edit-node="editMatch.instanceOf" />
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, ref } from "vue";
import { useFilterStore } from "@/stores/filterStore";
import { Match, SearchRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { IM, SNOMED } from "@im-library/vocabulary";
import { SortDirection } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import SingleEntitySelector from "./SingleEntitySelector.vue";

interface Props {
  editMatch: Match;
}
const props = defineProps<Props>();

const filterStore = useFilterStore();
const filterStoreOptions = computed(() => filterStore.filterOptions);
const selected: Ref<SearchResultSummary | undefined> = ref();
const propertyType: Ref<"is" | "typeOf" | "instanceOf" | undefined> = ref();

const osQueryForConceptSearch: Ref<SearchRequest> = ref({
  schemeFilter: filterStoreOptions.value.schemes.filter(filterOption => filterOption["@id"] === SNOMED.NAMESPACE).map(s => s["@id"]),
  statusFilter: filterStoreOptions.value.status.map(s => s["@id"]),
  typeFilter: filterStoreOptions.value.types.filter(filterOption => filterOption["@id"] === IM.CONCEPT).map(s => s["@id"]),
  sortDirection: filterStoreOptions.value.sortDirections[0]?.["@id"] === IM.DESCENDING ? SortDirection.DESC : SortDirection.ASC,
  sortField: filterStoreOptions.value.sortFields[0]?.["@id"] === IM.USAGE ? "weighting" : filterStoreOptions.value.sortFields[0]?.["@id"]
} as SearchRequest);

onMounted(async () => {
  await init();
});

async function init() {
  if (isObjectHasKeys(props.editMatch, ["is"])) propertyType.value = "is";
  else if (isObjectHasKeys(props.editMatch, ["instanceOf"])) propertyType.value = "instanceOf";
  else if (isObjectHasKeys(props.editMatch, ["typeOf"])) propertyType.value = "typeOf";
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
</script>

<style scoped lang="scss">
.match-container {
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

.multi-select {
  display: flex;
}
</style>
