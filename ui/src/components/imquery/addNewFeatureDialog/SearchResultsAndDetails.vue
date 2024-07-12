<template>
  <div class="flex flex-column w-full h-full">
    <div class="top-half-component">
      <Tabs v-if="detailsIri || searchTerm" v-model:value="activePage" class="w-full">
        <TabList>
          <Tab value="0">Search</Tab>
          <Tab value="1">Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <SearchResults
              :show-filters="false"
              :updateSearch="updateSearch"
              :search-term="searchTerm"
              :im-query="imQuery"
              :rows="10"
              :show-select="true"
              @selectedUpdated="
                summary => {
                  detailsIri = summary.iri;
                  activePage = '1';
                }
              "
              @viewHierarchy="
                (iri: string) => {
                  detailsIri = iri;
                  activePage = '1';
                }
              "
              @addToList="onSelect"
            />
          </TabPanel>
          <TabPanel value="1">
            <div v-if="detailsEntity && detailsIri">
              <ParentHeader
                v-if="detailsIri && detailsIri !== 'http://endhealth.info/im#Favourites' && detailsEntity"
                :entity="detailsEntity"
                :showSelect="true"
                @locateInTree="(iri: string) => $emit('locateInTree', iri)"
                @viewHierarchy="
                  (iri: string) => {
                    detailsIri = iri;
                    activePage = '1';
                  }
                "
                @addToList="onSelect"
              />
              <div v-if="isRecordModel(detailsEntity[RDF.TYPE])">
                <div><b>Properties</b></div>
                <DataModel
                  :entityIri="detailsIri"
                  @navigateTo="
                    (iri: string) => {
                      detailsIri = iri;
                    }
                  "
                />
              </div>

              <div v-else>
                <div><b>Hierarhcy tree</b></div>
                <SecondaryTree
                  :entityIri="detailsIri"
                  :show-select="true"
                  @navigateTo="
                    (iri: string) => {
                      detailsIri = iri;
                    }
                  "
                  @onSelect="onSelect"
                />
              </div>
            </div>

            <PathSelectDialog
              v-bind:showDialog="showDialog"
              :pathSuggestions="pathSuggestions"
              @onSelectedPath="path => emit('update:selectedPath', path)"
              @onClose="showDialog = false"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <SelectedSet v-if="selectedSet.size" :selected-set="selectedSet" class="bottom-half-component" />
  </div>
  <!-- TODO: Component with 2 subcombonents - one for search results(SearchResults?+EclSearch?+IMQuerySearch?)/details(DirectoryDetails?) and one for selected list(ConceptSelect?) -->
</template>

<script setup lang="ts">
import Viewer from "@/components/directory/Viewer.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { Match, PathQuery, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { Ref } from "vue";
import { ref } from "vue";
import { onMounted, watch } from "vue";
import PathSelectDialog from "./PathSelectDialog.vue";
import { EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isConcept, isFeature, isProperty, isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import SelectedSet from "./SelectedSet.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import DataModel from "@/components/directory/viewer/dataModel/DataModel.vue";
import { ToastSeverity } from "@im-library/enums";
import { useToast } from "primevue/usetoast";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { FilterOptions } from "@im-library/interfaces";

interface Props {
  selectedIri: string;
  searchTerm: string;
  updateSearch: boolean;
  imQuery: QueryRequest | undefined;
  dataModelIri: string;
  selectedPath: Match | undefined;
  selectedSet: Set<string>;
}

const emit = defineEmits({ locateInTree: (payload: string) => payload, "update:selectedPath": (payload: Match) => payload, goToNextStep: () => true });
const props = defineProps<Props>();
const detailsIri: Ref<string> = ref("");
const activePage: Ref<string> = ref("0");
const detailsEntity: Ref<any> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const showDialog: Ref<boolean> = ref(false);
const toast = useToast();

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
    activePage.value = "1";
  }
);

watch(
  () => props.updateSearch,
  () => {
    activePage.value = "0";
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
  const entityType = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
  if (props.selectedPath) {
    if (isConcept(entityType[RDF.TYPE]) || isValueSet(entityType[RDF.TYPE])) await addToSelectedList(iri);
    else {
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid value",
        detail: `Only values within the range of your selected path are valid.`,
        life: 3000
      });
    }
  } else if (isFeature(entityType[RDF.TYPE]) || isQuery(entityType[RDF.TYPE])) {
    await addToSelectedList(iri);
  } else {
    await setQueryPath(iri);
    if (isConcept(entityType[RDF.TYPE]) || isValueSet(entityType[RDF.TYPE])) await addToSelectedList(iri);
    else if (isProperty(entityType[RDF.TYPE])) {
      emit("goToNextStep");
    }
  }
}

async function setQueryPath(iri: string) {
  if (iri) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": iri } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    console.log(response);
    if (response.match.length === 1) emit("update:selectedPath", response.match[0]);
    else if (response.match.length > 1) {
      pathSuggestions.value = response.match;
      showDialog.value = true;
    }
  }
}

async function addToSelectedList(iri: string) {
  props.selectedSet.add(iri);
}
</script>

<style scoped></style>
