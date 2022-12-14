<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Expression</span>
      <InputText
        ref="miniSearchInput"
        type="text"
        v-model="searchTerm"
        @input="search"
        @keyup.enter="search"
        @focus="showOverlay"
        @change="showOverlay"
        placeholder="Search"
        class="p-inputtext search-input"
        autoWidth="true"
      />
    </div>
  </div>
  <OverlayPanel class="search-op" ref="miniSearchOP" :showCloseIcon="true" :dismissable="true">
    <SearchMiniOverlay :searchTerm="searchTerm" :searchResults="searchResults" :loading="loading" @searchResultSelected="updateSelectedResult" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, Ref, ref } from "vue";
import SearchMiniOverlay from "../SearchMiniOverlay.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { useStore } from "vuex";
import { ECLComponent, SortBy } from "@im-library/enums";
import { DataTypeCheckers } from "@im-library/helpers";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { ECLComponentDetails, Namespace, EntityReferenceNode, TTIriRef, SearchRequest, ConceptSummary } from "@im-library/interfaces";
import axios from "axios";
const { isArrayHasLength, isObjectHasKeys, isObject } = DataTypeCheckers;

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: { type: Object as PropType<ConceptSummary>, required: false },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({ updateClicked: (_payload: ECLComponentDetails) => true });

const store = useStore();
const filterOptions = computed(() => store.state.filterOptions);
const selectedFilters = computed(() => store.state.selectedFilters);

const loading = ref(false);
const debounce = ref(0);
const controller: Ref<AbortController> = ref({} as AbortController);
const selectedResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const searchTerm = ref("ANY");
const searchResults: Ref<ConceptSummary[]> = ref([]);
const anyModel: Ref<ConceptSummary> = ref({
  code: "",
  name: "ANY",
  iri: "",
  isDescendentOf: [],
  weighting: 0,
  scheme: {} as TTIriRef,
  status: {} as TTIriRef,
  match: "ANY",
  entityType: [{ "@id": IM.CONCEPT, name: "Concept" }]
});

const miniSearchOP = ref();

onMounted(() => {
  if (props.value && isObjectHasKeys(props.value, ["name", "iri"])) {
    updateSelectedResult(props.value);
  } else {
    updateSelectedResult({ ...anyModel.value });
  }
});

async function search(): Promise<void> {
  if (searchTerm.value.toUpperCase() === "ANY" || searchTerm.value === "*") {
    searchResults.value = [{ ...anyModel.value }];
    return;
  }
  if (searchTerm.value.length > 0) {
    searchResults.value = [];
    loading.value = true;
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchTerm.value;
    searchRequest.sortBy = SortBy.Usage;
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = selectedFilters.value.schemes.map((scheme: Namespace) => scheme.iri);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach((status: EntityReferenceNode) => {
      searchRequest.statusFilter.push(status["@id"]);
    });

    searchRequest.typeFilter = [];
    selectedFilters.value.types.forEach((type: TTIriRef) => {
      searchRequest.typeFilter.push(type["@id"]);
    });
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    await fetchSearchResults(searchRequest, controller.value);
    loading.value = false;
  }
}

async function fetchSearchResults(searchRequest: SearchRequest, controller: AbortController) {
  const result = await EntityService.advancedSearch(searchRequest, controller);
  if (result && isArrayHasLength(result)) {
    searchResults.value = result;
  } else {
    searchResults.value = [];
  }
}

function hideOverlay(): void {
  miniSearchOP.value.hide();
}

function showOverlay(event: any): void {
  miniSearchOP.value.show(event, event.target);
}

function updateSelectedResult(data: ConceptSummary) {
  selectedResult.value = data;
  searchTerm.value = data.name;
  emit("updateClicked", createExpression());
  hideOverlay();
}

function editClicked(event: any) {
  showOverlay(event);
}

function createExpression(): ECLComponentDetails {
  let queryString = "";
  if (selectedResult.value.name === "ANY") {
    queryString = "*";
  } else {
    queryString = selectedResult.value.code + " |" + selectedResult.value.name + "|";
  }
  return {
    value: selectedResult.value,
    id: props.id,
    position: props.position,
    type: ECLComponent.EXPRESSION,
    queryString: queryString,
    showButtons: props.showButtons
  };
}
</script>

<style scoped>
.query-item-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #ffc952;
  border-radius: 3px;
}

.label-container {
  width: 100%;
  padding: 1rem;
  position: relative;
}

.label {
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}

.search-input {
  width: 100%;
  min-width: 15rem;
}
</style>
