<template>
  <div class="flex h-full w-full flex-col">
    <div v-if="loading" class="flex flex-auto flex-col">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-auto flex-col">
      <div class="top-half-component">
        <SearchResults
          v-if="activePage === 0"
          :im-query="imQuery"
          :rows="10"
          :search-term="searchTerm"
          :show-filters="false"
          :show-select="allowMultipleSelect"
          :updateSearch="updateSearch"
          @addToList="onSelect"
          @selectedUpdated="onSelectedUpdate"
          @viewHierarchy="onViewHierarchy"
          @search-results-updated="updateSearchResults"
        />
        <div v-if="activePage === 1" class="details-tab">
          <div class="to-search-button-container">
            <Button
              v-if="searchResults?.entities?.length"
              class="back-to-search"
              data-testid="back-to-search-results"
              icon="fa-solid fa-arrow-left"
              label="Back to search results"
              link
              @click="activePage = 0"
            />
          </div>
          <ParentHeader
            v-if="detailsIri && detailsIri !== 'http://endhealth.info/im#Favourites' && detailsEntity"
            :entity="detailsEntity"
            :showSelect="allowMultipleSelect"
            @addToList="onSelect"
            @locateInTree="(iri: string) => $emit('locateInTree', iri)"
            @viewHierarchy="onViewHierarchy"
          />
          <div v-if="isRecordModel(detailsEntity?.[RDF.TYPE])" class="dm-details">
            <div class="view-title"><b>Properties</b></div>
            <DataModel :entityIri="detailsIri" :entityName="detailsEntity[RDFS.LABEL]" @navigateTo="handleControlClick" />
          </div>

          <div v-else class="entity-details">
            <div class="view-title"><b>Hierarchy tree</b></div>
            <SecondaryTree
              :entityIri="detailsIri"
              :show-select="allowMultipleSelect"
              @onSelect="onSelect"
              @row-clicked="(iri: string) => (detailsIri = iri)"
              @row-control-clicked="handleControlClick"
            />
          </div>
        </div>
      </div>
      <SelectedSet
        :add-default-value="props.addDefaultValue"
        :dataModelIri="dataModelIri"
        :propertyIri="propertyIri"
        :updated-path-option="updatedPathOption"
        @go-to-next-step="emit('goToNextStep')"
      />
      <PathSelect
        :dataModelIri="dataModelIri"
        :pathSuggestions="pathSuggestions"
        :property-iri="propertyIri"
        :selected-path="selectedPath"
        @onSelectedPath="onUpdatedPathOption"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SearchResults from "@/components/shared/SearchResults.vue";
import { Match, Node, PathQuery, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { computed, inject, onMounted, ref, Ref, watch } from "vue";
import PathSelect from "./PathSelect.vue";
import { DirectService, EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS } from "@/vocabulary";
import { isConcept, isFeature, isProperty, isQuery, isRecordModel, isValueSet, isFunction } from "@/helpers/ConceptTypeMethods";
import SelectedSet from "../SelectedSet.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import DataModel from "@/components/directory/viewer/dataModel/DataModel.vue";
import { ToastSeverity } from "@/enums";
import { useToast } from "primevue/usetoast";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";

interface Props {
  selectedIri: string;
  searchTerm: string;
  updateSearch: boolean;
  imQuery: QueryRequest | undefined;
  dataModelIri: string | undefined;
  selectedPath: Match | undefined;
  selectedType: string;
  canClearPath?: boolean;
  propertyIri: string | undefined;
  addDefaultValue?: boolean;
}

const emit = defineEmits<{
  locateInTree: [payload: string];
  "update:selectedPath": [payload: Match];
  goToNextStep: [];
  selectedIri: [payload: string];
}>();
const props = defineProps<Props>();

const directService = new DirectService();

const detailsIri: Ref<string> = ref("");
const activePage: Ref<number> = ref(0);
const detailsEntity: Ref<any> = ref();
const loading = ref(true);
const pathSuggestions: Ref<Match[]> = ref([]);
const searchResults: Ref<SearchResponse | undefined> = ref();
const toast = useToast();
const currentPath: Ref<Match | undefined> = ref();
const selectedValueMap = inject("selectedValueMap") as Ref<Map<string, Node>>;
const allowMultipleSelect = computed(() => [IM.CONCEPT_SET, IM.CONCEPT].includes(props.selectedType));
const updatedPathOption = ref(false);
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
      else if (isQuery(detailsEntity.value?.[RDF.TYPE]) || isFeature(detailsEntity.value?.[RDF.TYPE]))
        addToSelectedList(detailsEntity.value.iri, detailsEntity.value[RDFS.LABEL]);
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

watch(
  () => cloneDeep(props.addDefaultValue),
  async () => {
    if (props.addDefaultValue) {
      await onSelect(detailsIri.value);
    }
  }
);

watch(activePage, newValue => {
  if (newValue === 0) emit("selectedIri", "");
});

watch(activePage, newValue => {
  if (newValue === 0) emit("selectedIri", "");
});

onMounted(async () => await init());

async function init() {
  loading.value = true;
  detailsIri.value = props.selectedIri;
  await setEntity();
  pathSuggestions.value = await getPathOptions(props.dataModelIri, detailsIri.value);
  if (!pathSuggestions.value.length && props.selectedPath) pathSuggestions.value = [props.selectedPath];
  loading.value = false;
}

function onUpdatedPathOption(path: Match) {
  emit("update:selectedPath", path);
  updatedPathOption.value = !updatedPathOption.value;
}

async function getPathOptions(dataModelIri: string | undefined, valueIri: string) {
  if (dataModelIri && valueIri) {
    const pathQuery: PathQuery = {
      source: { iri: dataModelIri } as TTIriRef,
      target: { iri: valueIri } as TTIriRef
    } as PathQuery;
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

    if (isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]) || isProperty(entity[RDF.TYPE]) || isFunction(entity[RDF.TYPE])) {
      if (selectedValueMap.value.size) {
        const has = await hasFeatureOrQuerySelected();
        if (!has) {
          addToSelectedList(iri, entity[RDFS.LABEL]);
        } else
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
    if (isArrayHasLength(pathSuggestions.value) && (isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]))) addToSelectedList(iri, entity[RDFS.LABEL]);
    else if (isProperty(entity[RDF.TYPE]) || isFunction(entity[RDF.TYPE])) {
      emit("goToNextStep");
    }
  }
}

async function setQueryPath(iri: string) {
  pathSuggestions.value = (await getPathOptions(props.dataModelIri, iri)) ?? [];
  if (!isArrayHasLength(pathSuggestions.value))
    toast.add({
      severity: ToastSeverity.WARN,
      summary: "No relationship found between type and value",
      detail: `Cannot find a property connected to this value, please select a property first.`,
      life: 3000
    });
  if (isArrayHasLength(pathSuggestions.value)) {
    emit("update:selectedPath", pathSuggestions.value[0]);
    currentPath.value = cloneDeep(pathSuggestions.value[0]);
  }
}

function addToSelectedList(iri: string, name: string) {
  selectedValueMap.value.set(iri, { iri: iri, name: name });
}

async function hasFeatureOrQuerySelected() {
  const iri = selectedValueMap.value.keys().next().value;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
    return isQuery(entity[RDF.TYPE]) || isFeature(entity[RDF.TYPE]);
  }
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
