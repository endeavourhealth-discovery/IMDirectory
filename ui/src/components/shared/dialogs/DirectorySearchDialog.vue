<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
    @keyup.enter="onEnter"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar
          v-model:searchResults="searchResults"
          v-model:searchLoading="searchLoading"
          :searchByQuery="searchByQuery"
          @to-ecl-search="showEclSearch"
          @to-query-search="showQuerySearch"
          :selected="selected"
        />
      </div>
      <div class="vertical-divider">
        <div class="left-container">
          <NavTree :selectedIri="treeIri" :root-entities="rootEntities" @row-selected="showDetails" />
        </div>
        <div class="right-container">
          <SearchResults
            v-if="activePage === 0"
            :searchResults="searchResults"
            :searchLoading="searchLoading"
            :selected="selected"
            @selectedUpdated="updateSelected"
            @locate-in-tree="locateInTree"
          />
          <DirectoryDetails
            v-if="activePage === 1"
            :selected-iri="detailsIri"
            @locateInTree="locateInTree"
            @navigateTo="navigateTo"
            :validationQuery="searchByQuery"
            :showSelectButton="true"
            v-model:history="history"
            @selected-updated="updateSelectedFromIri"
          />
          <EclSearch v-if="activePage === 2" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
          <IMQuerySearch v-if="activePage === 3" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="im-dialog-footer" v-if="detailsIri">
        <div v-if="selectedName" v-tooltip.right="detailsIri">Item selected: {{ selectedName }}</div>
        <div class="button-footer">
          <Button label="Cancel" @click="visible = false" text />
          <Button :disabled="!isSelectableEntity" label="Select" :loading="validationLoading" @click="updateSelectedFromIri(detailsIri)" autofocus />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, computed } from "vue";
import { ConceptSummary } from "@im-library/interfaces";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import NavTree from "@/components/shared/NavTree.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import EclSearch from "@/components/directory/EclSearch.vue";
import IMQuerySearch from "@/components/directory/IMQuerySearch.vue";
import { useSharedStore } from "@/stores/sharedStore";
import _, { cloneDeep } from "lodash";
import { EntityService, QueryService } from "@/services";
import { QueryRequest } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

interface Props {
  showDialog: boolean;
  searchByQuery?: QueryRequest;
  selected?: ConceptSummary;
  rootEntities?: string[];
}
const props = defineProps<Props>();
watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  "update:selected": payload => true
});

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const hasQueryDefinition: Ref<boolean> = ref(false);
const validationLoading: Ref<boolean> = ref(false);
const isSelectableEntity: Ref<boolean> = ref(false);

const visible = ref(false);
watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
    resetDialog();
  }
});
const searchResults: Ref<ConceptSummary[]> = ref([]);
const searchLoading = ref(false);
const treeIri = ref("");
const detailsIri = ref("");

watch(
  () => detailsIri.value,
  async () => {
    if (detailsIri.value) {
      validationLoading.value = true;
      await setSelectedName();
      hasQueryDefinition.value = await getHasQueryDefinition();
      isSelectableEntity.value = await getIsSelectableEntity();
      validationLoading.value = false;
    }
  }
);

const history: Ref<string[]> = ref([]);
const activePage = ref(0);
const selectedName = ref("");

watch(searchResults, newValue => {
  detailsIri.value = "";
  activePage.value = 0;
});

watch(
  () => cloneDeep(props.selected),
  () => initSelection()
);

onMounted(() => {
  visible.value = props.showDialog;
  initSelection();
});

async function setSelectedName() {
  if (detailsIri.value) {
    const entity = await EntityService.getPartialEntity(detailsIri.value, [RDFS.LABEL]);
    selectedName.value = entity[RDFS.LABEL];
  }
}

function initSelection() {
  if (props.selected && props.selected.iri) {
    navigateTo(props.selected.iri);
    locateInTree(props.selected.iri);
  }
}

function updateSelected(data: ConceptSummary) {
  emit("update:selected", data);
  visible.value = false;
}

async function updateSelectedFromIri(iri: string) {
  const entity = await EntityService.getEntitySummary(iri);
  emit("update:selected", entity);
  visible.value = false;
}

function locateInTree(iri: string) {
  treeIri.value = iri;
}

function showDetails(data: any) {
  detailsIri.value = data.key;
  activePage.value = 1;
}

function navigateTo(iri: string) {
  detailsIri.value = iri;
  activePage.value = 1;
}

function resetDialog() {
  searchResults.value = [];
  searchLoading.value = false;
  treeIri.value = "";
  detailsIri.value = "";
  history.value = [];
  activePage.value = 0;
}

function showEclSearch() {
  activePage.value = 2;
}

function showQuerySearch() {
  activePage.value = 3;
}

async function getIsSelectableEntity(): Promise<boolean> {
  if (!props.searchByQuery) return true;
  const queryRequest = _.cloneDeep(props.searchByQuery);
  queryRequest.textSearch = selectedName.value;
  const queryResults = await QueryService.queryIM(queryRequest);
  if (!isObjectHasKeys(queryResults, ["entities"]) || !isArrayHasLength(queryResults.entities)) return false;
  return queryResults.entities.some(item => item["@id"] === detailsIri.value);
}

async function getHasQueryDefinition() {
  const entity = await EntityService.getPartialEntity(detailsIri.value, [RDF.TYPE, IM.DEFINITION]);
  const hasDefinition = isObjectHasKeys(entity, [RDF.TYPE, IM.DEFINITION]);
  const isQueryOrSet = isQuery(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]);
  return hasDefinition && isQueryOrSet;
}

function onEnter() {
  if (isSelectableEntity.value) updateSelectedFromIri(detailsIri.value);
}
</script>

<style scoped>
.directory-search-dialog-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.vertical-divider {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: row nowrap;
}

.left-container {
  flex: 0 0 30%;
  overflow: auto;
}

.right-container {
  flex: 1 1 auto;
  overflow: auto;
}

.search-bar {
  min-height: 3.5rem;
  background-color: var(--surface-100);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 0.5rem;
}

.im-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.button-footer {
  display: flex;
  flex-wrap: nowrap;
}
</style>

<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
