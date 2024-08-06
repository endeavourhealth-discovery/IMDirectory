<template>
  <div class="flex h-full w-full flex-col">
    <div class="top-half-component">
      <SearchResults
        v-if="activePage === 0"
        :show-filters="false"
        :updateSearch="updateSearch"
        :search-term="searchTerm"
        :im-query="imQuery"
        :rows="10"
        :show-select="allowMultipleSelect"
        @selectedUpdated="onSelectedUpdate"
        @viewHierarchy="onViewHierarchy"
        @addToList="onSelect"
        @search-results-updated="updateSearchResults"
      />
      <div class="details-tab" v-if="activePage === 1">
        <div class="to-search-button-container">
          <Button
            link
            v-if="searchResults?.entities?.length"
            label="Back to search results"
            icon="fa-solid fa-arrow-left"
            class="back-to-search"
            @click="activePage = 0"
          />
        </div>
        <ParentHeader
          v-if="detailsIri && detailsIri !== 'http://endhealth.info/im#Favourites' && detailsEntity"
          :entity="detailsEntity"
          :showSelect="allowMultipleSelect"
          @locateInTree="(iri: string) => $emit('locateInTree', iri)"
          @viewHierarchy="onViewHierarchy"
          @addToList="onSelect"
        />
        <div class="dm-details" v-if="isRecordModel(detailsEntity?.[RDF.TYPE])">
          <div class="view-title"><b>Properties</b></div>
          <DataModel :entityIri="detailsIri" @navigateTo="(iri: string) => (detailsIri = iri)" />
        </div>

        <div class="entity-details" v-else>
          <div class="view-title"><b>Hierarchy tree</b></div>
          <SecondaryTree
            :entityIri="detailsIri"
            :show-select="allowMultipleSelect"
            @row-clicked="(iri: string) => (detailsIri = iri)"
            @onSelect="onSelect"
            @row-control-clicked="handleControlClick"
          />
        </div>
      </div>
    </div>
    <SelectedSet class="bottom-half-component" />
    <PathSelect
      :selected-path="selectedPath"
      :data-model-iri="dataModelIri"
      :pathSuggestions="pathSuggestions"
      @onSelectedPath="(path: Match) => emit('update:selectedPath', path)"
    />
  </div>
</template>

<script setup lang="ts">
import SearchResults from "@/components/shared/SearchResults.vue";
import { Match, Node, PathQuery, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { Ref, ref, onMounted, watch, inject, computed } from "vue";
import PathSelect from "./PathSelect.vue";
import { DirectService, EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { isConcept, isFeature, isProperty, isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import SelectedSet from "./SelectedSet.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import DataModel from "@/components/directory/viewer/dataModel/DataModel.vue";
import { ToastSeverity } from "@im-library/enums";
import { useToast } from "primevue/usetoast";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";

interface Props {
  selectedIri: string;
  searchTerm: string;
  updateSearch: boolean;
  imQuery: QueryRequest | undefined;
  dataModelIri: string;
  selectedPath: Match | undefined;
  selectedType: string;
  canClearPath?: boolean;
}

const emit = defineEmits({
  locateInTree: (payload: string) => payload,
  "update:selectedPath": (payload: Match) => payload,
  goToNextStep: () => true,
  selectedIri: (payload: string) => payload
});
const props = defineProps<Props>();

const directService = new DirectService();

const detailsIri: Ref<string> = ref("");
const activePage: Ref<number> = ref(0);
const detailsEntity: Ref<any> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const searchResults: Ref<SearchResponse | undefined> = ref();
const toast = useToast();
const currentPath: Ref<Match | undefined> = ref();
const selectedValueMap = inject("selectedValueMap") as Ref<Map<string, Node>>;
const allowMultipleSelect = computed(() => [IM.CONCEPT_SET, IM.CONCEPT].includes(props.selectedType));

watch(
  () => props.selectedIri,
  () => {
    detailsIri.value = props.selectedIri;
  }
);

watch(
  () => detailsIri.value,
  async newValue => {
    await setEntity();
    if (props.canClearPath) {
      pathSuggestions.value = await getPathOptions(props.dataModelIri, detailsIri.value);
      if (pathSuggestions.value.length && !props.selectedPath) emit("update:selectedPath", pathSuggestions.value[0]);
      else if (props.selectedPath && isProperty(detailsEntity.value?.[RDF.TYPE])) emit("update:selectedPath", pathSuggestions.value[0]);
    }
    activePage.value = 1;
    emit("selectedIri", newValue);
  }
);

watch(
  () => props.updateSearch,
  () => {
    activePage.value = 0;
  }
);

watch(activePage, newValue => {
  if (newValue === 0) emit("selectedIri", "");
});

onMounted(async () => await init());

async function init() {
  detailsIri.value = props.selectedIri;
  await setEntity();
  pathSuggestions.value = await getPathOptions(props.dataModelIri, detailsIri.value);
  if (!pathSuggestions.value.length && props.selectedPath) pathSuggestions.value = [props.selectedPath];
}

async function getPathOptions(dataModelIri: string, valueIri: string) {
  if (dataModelIri && valueIri) {
    const pathQuery: PathQuery = { source: { "@id": dataModelIri } as TTIriRef, target: { "@id": valueIri } as TTIriRef } as PathQuery;
    const result = await QueryService.pathQuery(pathQuery);
    if (result?.match?.length) return result.match;
  }
  return [];
}

async function setEntity() {
  if (detailsIri.value) {
    detailsEntity.value = await EntityService.getEntityByPredicateExclusions(detailsIri.value, [IM.HAS_MEMBER]);
  }
}

async function onSelect(iri: string) {
  const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE, RDFS.LABEL]);
  if (props.selectedPath && !currentPath.value) currentPath.value = cloneDeep(pathSuggestions.value[0]);
  if (props.selectedPath && currentPath.value) {
    if (props.canClearPath) {
      const pathOptions = await getPathOptions(props.dataModelIri, iri);
      if (pathOptions?.length) {
        const index = pathOptions?.findIndex(pathOption => JSON.stringify(pathOption) === JSON.stringify(currentPath.value));
        if (index === -1) {
          pathSuggestions.value = pathOptions;
          emit("update:selectedPath", pathOptions[0]);
          currentPath.value = cloneDeep(pathSuggestions.value[0]);
        }
      }
    }

    if (isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE])) {
      if (selectedValueMap.value.size) {
        const has = await hasFeatureOrQuerySelected();
        if (!has) addToSelectedList(iri, entity[RDFS.LABEL]);
        else
          toast.add({
            severity: ToastSeverity.ERROR,
            summary: "Invalid value",
            detail: `Only concepts and concept sets can be added to this list. If you want to add different types of values clear the list first or create a separate feature.`,
            life: 3000
          });
      } else addToSelectedList(iri, entity[RDFS.LABEL]);
    } else {
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid value",
        detail: `Only values within the range of your selected path are valid.`,
        life: 3000
      });
    }
  } else if (isFeature(entity[RDF.TYPE]) || isQuery(entity[RDF.TYPE])) {
    if (selectedValueMap.value.size) {
      const has = await hasFeatureOrQuerySelected();
      if (has) addToSelectedList(iri, entity[RDFS.LABEL]);
      else
        toast.add({
          severity: ToastSeverity.ERROR,
          summary: "Invalid value",
          detail: `Only features and queries can be added to this list. If you want to add different types of values clear the list first or create a separate feature.`,
          life: 3000
        });
    } else addToSelectedList(iri, entity[RDFS.LABEL]);
  } else {
    await setQueryPath(iri);
    if (isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE])) addToSelectedList(iri, entity[RDFS.LABEL]);
    else if (isProperty(entity[RDF.TYPE])) {
      emit("goToNextStep");
    }
  }
}

async function setQueryPath(iri: string) {
  pathSuggestions.value = (await getPathOptions(props.dataModelIri, iri)) ?? [];
  if (isArrayHasLength(pathSuggestions.value)) {
    emit("update:selectedPath", pathSuggestions.value[0]);
    currentPath.value = cloneDeep(pathSuggestions.value[0]);
  }
}

function addToSelectedList(iri: string, name: string) {
  selectedValueMap.value.set(iri, { "@id": iri, name: name });
}

async function hasFeatureOrQuerySelected() {
  const iri = selectedValueMap.value.keys().next().value;
  const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
  return isQuery(entity[RDF.TYPE]) || isFeature(entity[RDF.TYPE]);
}

function onSelectedUpdate(summary: SearchResultSummary) {
  detailsIri.value = summary.iri;
  activePage.value = 1;
}

function onViewHierarchy(iri: string) {
  detailsIri.value = iri;
  activePage.value = 1;
}

function updateSearchResults(newSearchResults: SearchResponse | undefined) {
  searchResults.value = newSearchResults;
}

function handleControlClick(iri: string) {
  directService.view(iri);
}
</script>

<style scoped></style>
