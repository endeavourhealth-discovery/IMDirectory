<template>
  <div v-if="activePage === 0 && detailsIri">
    {{ detailsIri }}
    <Viewer
      :entityIri="detailsIri"
      @navigateTo="
        (iri: string) => {
          detailsIri = iri;
        }
      "
    />
    <Button label="Select" @click="onSelect" />
  </div>

  <SearchResults
    v-if="activePage === 1"
    :show-filters="false"
    :updateSearch="updateSearch"
    :search-term="searchTerm"
    :im-query="imQuery"
    :rows="10"
    @selectedUpdated="
      summary => {
        detailsIri = summary.iri;
        activePage = 0;
      }
    "
  />

  <PathSelectDialog
    v-bind:showDialog="showDialog"
    :pathSuggestions="pathSuggestions"
    @onSelectedPath="path => emit('update:selectedPath', path)"
    @onClose="showDialog = false"
  />

  <SelectedSet :selected-set="selectedSet" />
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
import { RDF } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isConcept, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import SelectedSet from "./SelectedSet.vue";

interface Props {
  selectedIri: string;
  searchTerm: string;
  updateSearch: boolean;
  imQuery: QueryRequest | undefined;
  dataModelIri: string;
  selectedPath: Match | undefined;
}

const emit = defineEmits({ navigateTo: (payload: string) => payload, "update:selectedPath": payload => payload });
const props = defineProps<Props>();
const detailsIri: Ref<string> = ref("");
const activePage: Ref<number> = ref(0);
const selectedSet: Ref<Set<string>> = ref(new Set<string>());
const detailsEntityType: Ref<TTIriRef[]> = ref([]);
const pathSuggestions: Ref<Match[]> = ref([]);
const showDialog: Ref<boolean> = ref(false);
watch(
  () => props.selectedIri,
  () => {
    detailsIri.value = props.selectedIri;
  }
);

watch(
  () => detailsIri.value,
  async () => await setEntityType()
);

watch(
  () => props.updateSearch,
  () => {
    activePage.value = 1;
  }
);

onMounted(() => init());

function init() {
  detailsIri.value = props.selectedIri;
  setEntityType();
}

async function setEntityType() {
  if (detailsIri.value) {
    const responseEntity = await EntityService.getPartialEntity(detailsIri.value, [RDF.TYPE]);
    if (isObjectHasKeys(responseEntity, [RDF.TYPE])) detailsEntityType.value = responseEntity[RDF.TYPE];
  }
}

async function onSelect() {
  if (props.selectedPath) {
    if (isConcept(detailsEntityType.value) || isValueSet(detailsEntityType.value)) await addToSelectedList();
    else {
      // show that this is invalid with toast
    }
  } else await setQueryPath();
}

async function setQueryPath() {
  if (detailsIri.value) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": detailsIri.value } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    console.log(response);
    if (response.match.length === 1) emit("update:selectedPath", response.match[0]);
    else if (response.match.length > 1) {
      pathSuggestions.value = response.match;
      showDialog.value = true;
    }
  }
}

async function addToSelectedList() {
  const isValidSelection = await isValidValueForSelectedPath();
  if (isValidSelection) selectedSet.value.add(detailsIri.value);
}

async function isValidValueForSelectedPath() {
  // if in range return true, else return false
  return true;
}
</script>

<style scoped></style>
