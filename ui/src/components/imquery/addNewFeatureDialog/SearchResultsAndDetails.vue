<template>
  <div class="flex flex-column w-full h-full">
    <div class="top-half-component">
      <SearchResults
        v-if="activePage === 0"
        :show-filters="false"
        :updateSearch="updateSearch"
        :search-term="searchTerm"
        :im-query="imQuery"
        :rows="10"
        :show-select="true"
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
          :showSelect="true"
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
          <SecondaryTree :entityIri="detailsIri" :show-select="true" @navigateTo="(iri: string) => (detailsIri = iri)" @onSelect="onSelect" />
        </div>
      </div>

      <PathSelectDialog
        v-bind:showDialog="showDialog"
        :pathSuggestions="pathSuggestions"
        @onSelectedPath="path => emit('update:selectedPath', path)"
        @onClose="showDialog = false"
      />
    </div>

    <SelectedSet class="bottom-half-component" />
  </div>
</template>

<script setup lang="ts">
import SearchResults from "@/components/shared/SearchResults.vue";
import { Match, Node, PathQuery, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { Ref, ref, onMounted, watch, inject } from "vue";
import PathSelectDialog from "./PathSelectDialog.vue";
import { EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { isConcept, isFeature, isProperty, isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import SelectedSet from "./SelectedSet.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import DataModel from "@/components/directory/viewer/dataModel/DataModel.vue";
import { ToastSeverity } from "@im-library/enums";
import { useToast } from "primevue/usetoast";

interface Props {
  selectedIri: string;
  searchTerm: string;
  updateSearch: boolean;
  imQuery: QueryRequest | undefined;
  dataModelIri: string;
  selectedPath: Match | undefined;
}

const emit = defineEmits({ locateInTree: (payload: string) => payload, "update:selectedPath": (payload: Match) => payload, goToNextStep: () => true });
const props = defineProps<Props>();
const detailsIri: Ref<string> = ref("");
const activePage: Ref<number> = ref(0);
const detailsEntity: Ref<any> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const showDialog: Ref<boolean> = ref(false);
const searchResults: Ref<SearchResponse | undefined> = ref();
const toast = useToast();
const selectedValueMap = inject("selectedValueMap") as Ref<Map<string, Node>>;

watch(
  () => props.selectedIri,
  () => {
    detailsIri.value = props.selectedIri;
  }
);

watch(
  () => detailsIri.value,
  async () => {
    await setEntity();
    activePage.value = 1;
  }
);

watch(
  () => props.updateSearch,
  () => {
    activePage.value = 0;
  }
);

onMounted(() => init());

function init() {
  detailsIri.value = props.selectedIri;
  setEntity();
}

async function setEntity() {
  if (detailsIri.value) {
    detailsEntity.value = await EntityService.getEntityByPredicateExclusions(detailsIri.value, [IM.HAS_MEMBER]);
  }
}

async function onSelect(iri: string) {
  const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE, RDFS.LABEL]);
  if (props.selectedPath) {
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
  if (iri) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": iri } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    if (response.match.length === 1) emit("update:selectedPath", response.match[0]);
    else if (response.match.length > 1) {
      pathSuggestions.value = response.match;
      showDialog.value = true;
    }
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
</script>

<style scoped></style>
