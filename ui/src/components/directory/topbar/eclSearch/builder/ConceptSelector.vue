<template>
  <div v-if="isAliasIriRef(value.concept)" class="concept-container">
    <div
      class="search-text"
      type="text"
      :class="[isAny && 'inactive', !isAny && 'clickable']"
      @click="!isAny ? (showDialog = true) : (showDialog = false)"
      @mouseover="showOverlay($event, selected?.iri)"
      @mouseleave="hideOverlay($event)"
    >
      <span class="selected-label">{{ selected?.name ?? "Search..." }}</span>
    </div>
    <div class="any-checkbox-container"><label>Any</label><Checkbox v-model="isAny" :binary="true" /></div>
    <DirectorySearchDialog
      v-if="showDialog && !isAny && selected?.iri !== 'any'"
      v-model:show-dialog="showDialog"
      v-model:selected="selected"
      :search-by-function="functionRequest"
      :root-entities="['http://snomed.info/sct#138875005']"
      :filterOptions="filterOptions"
      :filterDefaults="filterDefaults"
    />
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <Dropdown style="width: 12rem" v-model="value.descendants" placeholder="only" :options="descendantOptions" option-label="label" option-value="value" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, inject, computed, ComputedRef } from "vue";
import { IM, SNOMED, IM_FUNCTION } from "@im-library/vocabulary";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { FilterOptions } from "@im-library/interfaces";
import { FunctionRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import _ from "lodash";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { isAliasIriRef } from "@im-library/helpers/TypeGuards";
import { useFilterStore } from "@/stores/filterStore";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  value: {
    type: string;
    descendants: string;
    conjunction: string;
    items: any[];
    concept: { iri: string; name?: string } | { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
    ecl?: string;
    exclude?: boolean;
  };
  parent?: any;
}
const props = defineProps<Props>();

watch(
  () => _.cloneDeep(props.value),
  (newValue, oldValue) => {
    if (_.isEqual(newValue, oldValue)) props.value.ecl = generateEcl();
  }
);

watch(
  () => _.cloneDeep(props.value.concept),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) await init();
  }
);

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const { OS, showOverlay, hideOverlay } = setupOverlay();

const filterStore = useFilterStore();
const filterStoreDefaults = computed(() => filterStore.filterDefaults);
const filterStoreOptions = computed(() => filterStore.filterOptions);
const isAny: ComputedRef<boolean> = computed(() => selected.value?.iri === "any");

const loading = ref(false);
const showDialog = ref(false);
const selected: Ref<SearchResultSummary | undefined> = ref();

const functionRequest: FunctionRequest = {
  functionIri: IM_FUNCTION.IS_TYPE,
  arguments: [{ parameter: "type", valueIri: { "@id": IM.CONCEPT } }]
};
const descendantOptions = [
  {
    label: "only",
    value: ""
  },
  {
    label: "plus descendants",
    value: "<<"
  },
  {
    label: "descendants only",
    value: "<"
  }
];

const filterOptions: FilterOptions = {
  status: [...filterStoreOptions.value.status],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === IM.CONCEPT)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

const filterDefaults: FilterOptions = {
  status: [...filterStoreOptions.value.status.filter(s => s["@id"] === IM.ACTIVE)],
  schemes: [...filterStoreOptions.value.schemes.filter(s => s["@id"] === SNOMED.NAMESPACE)],
  types: [...filterStoreOptions.value.types.filter(t => t["@id"] === IM.CONCEPT)],
  sortDirections: [...filterStoreOptions.value.sortDirections],
  sortFields: [...filterStoreOptions.value.sortFields]
};

onMounted(async () => {
  await init();
  generateEcl();
});

watch(selected, (newValue, oldValue) => {
  if (newValue && !_.isEqual(newValue, oldValue) && newValue.iri) {
    updateConcept(newValue);
  }
});

async function init() {
  if (props.value?.concept) {
    if (isAliasIriRef(props.value.concept)) {
      loading.value = true;
      await updateSelectedResult(props.value.concept);
      loading.value = false;
    }
  }
}

async function updateSelectedResult(data: SearchResultSummary | { iri: string; name?: string }) {
  if (!isObjectHasKeys(data)) selected.value = undefined;
  else if (isObjectHasKeys(data, ["entityType"])) selected.value = data as SearchResultSummary;
  else if (data.iri === "any" || data.iri === "*") {
    selected.value = { iri: "any", name: "ANY", code: "any" } as SearchResultSummary;
  } else if (data.iri) {
    const asSummary = await EntityService.getEntitySummary(data.iri);
    selected.value = isObjectHasKeys(asSummary) ? asSummary : undefined;
  } else {
    selected.value = undefined;
  }
}

function generateEcl(): string {
  let ecl = "";
  ecl += builderConceptToEcl(props.value, includeTerms.value);
  if (isArrayHasLength(props.value.items)) {
    ecl += " : \n";
    for (const [index, item] of props.value.items.entries()) {
      if (item.ecl) ecl += item.ecl;
      else ecl += "[ INVALID REFINEMENT ]";
      if (index + 1 !== props.value.items.length) ecl += " \n" + props.value.conjunction + " ";
    }
  }
  return ecl;
}

function updateConcept(concept: any) {
  props.value.concept = concept;
  props.value.ecl = generateEcl();
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
  min-width: 25rem;
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
