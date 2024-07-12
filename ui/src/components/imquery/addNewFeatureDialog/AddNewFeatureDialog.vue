<template>
  <Dialog v-model:visible="visible" modal :header="header" :style="{ minWidth: '100vw', minHeight: '100vh' }">
    <Stepper value="1" :style="{ minWidth: '50vw' }">
      <StepList>
        <Step value="1"><PathDisplay v-if="selectedPath" :path="selectedPath" :can-clear-path="canClearPath" @on-clear-path="clearPath" /></Step>
        <Step value="2"></Step>
      </StepList>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="flex flex-column select-property-wrapper">
            <div class="directory-search-dialog-content">
              <div class="search-bar">
                <SearchBarWithRadioFilters
                  @on-search="
                    payload => {
                      searchTerm = payload;
                      updateSearch = !updateSearch;
                    }
                  "
                  @on-type-select="onTypeSelect"
                />
              </div>
              <div class="vertical-divider">
                <div class="left-container">
                  <NavTree
                    :selectedIri="treeIri"
                    :find-in-tree="findInDialogTree"
                    :root-entities="rootEntities"
                    @found-in-tree="findInDialogTree = false"
                    @row-selected="node => (treeIri = node.data)"
                  />
                </div>
                <div class="right-container">
                  <SearchResultsAndDetails
                    :selectedIri="treeIri"
                    :search-term="searchTerm"
                    :update-search="updateSearch"
                    :im-query="imQuery"
                    :data-model-iri="dataModelIri"
                    :selectedSet="selectedSet"
                    v-model:selected-path="selectedPath"
                    @locate-in-tree="iri => (treeIri = iri)"
                    @go-to-next-step="activateCallback('2')"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex pt-4 justify-content-end next-button">
            <Button :disabled="!isObjectHasKeys(selectedPath)" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="2">
          <EditMatch
            v-if="editMatch && getLeafMatch(editMatch)"
            :edit-match="getLeafMatch(editMatch)"
            :is-root-feature="true"
            :focused-id="getLeafMatch(editMatch)['@id']"
          />

          <div class="flex pt-4 justify-content-between populate-property-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
            <Button label="Save" iconPos="right" @click="save" />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, provide, ref, watch } from "vue";
import { Match, PathQuery, QueryRequest, SearchResultSummary, TTIriRef, Where } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { EntityService, QueryService } from "@/services";
import { isConcept, isProperty, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { computed } from "vue";
import { addBindingsToIMQuery, addTypeFilterToIMQuery, buildIMQueryFromFilters, deleteQueryPredicateIfExists } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import AddPropertyDialog from "../AddPropertyDialog.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import NavTree from "../../shared/NavTree.vue";
import SearchBarWithRadioFilters, { TypeOption } from "./SearchBarWithRadioFilters.vue";
import SearchResultsAndDetails from "./SearchResultsAndDetails.vue";
import EditMatch from "../EditMatch.vue";
import PathSelectDialog from "./PathSelectDialog.vue";
import PathDisplay from "./PathDisplay.vue";
import { SearchOptions } from "@im-library/interfaces";
import SelectedSet from "./SelectedSet.vue";

interface Props {
  showDialog: boolean;
  match?: Match;
  canClearPath?: boolean;
  header: string;
  dataModelIri: string;
  showVariableOptions: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({
  onClose: () => true,
  onPropertyAdd: (_property: Where) => true,
  onMatchAdd: (_match: Match) => true,
  "update:showDialog": payload => typeof payload === "boolean"
});
const editMatch: Ref<Match | undefined> = ref();
const visible: Ref<boolean> = ref(false);
const selectedGeneralConcept: Ref<SearchResultSummary | undefined> = ref();
const imQuery: Ref<QueryRequest | undefined> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
provide("selectedPath", selectedPath);

const selectedSet: Ref<Set<string>> = ref(new Set<string>());
const updateSearch: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);

const treeIri = ref("");
const searchTerm = ref("");
const detailsIri = ref("");

const rootEntities: Ref<string[] | undefined> = ref();
watch(
  () => props.showDialog,
  newValue => {
    if (visible.value) init();
    else clear();
    visible.value = newValue;
  }
);

watch(
  () => cloneDeep(selectedGeneralConcept.value),
  async () => await getOptions()
);

watch(visible, newValue => {
  if (!newValue) emit("update:showDialog", newValue);
  else init();
});

watch(
  () => cloneDeep(props.match),
  newValue => {
    if (editMatch.value && isObjectHasKeys(newValue, ["where"]) && isArrayHasLength(newValue!.where)) editMatch.value.where = cloneDeep(newValue!.where);
  }
);

watch(
  () => cloneDeep(selectedPath.value),
  newValue => {
    editMatch.value = cloneDeep(newValue);
    updateIMQueryBinding();
  }
);

onMounted(() => init());

function init() {
  if (isObjectHasKeys(props.match)) editMatch.value = cloneDeep(props.match);
  else selectedPath.value = undefined;
}

async function getOptions() {
  selectedPath.value = undefined;
  if (selectedGeneralConcept.value?.iri) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": selectedGeneralConcept.value?.iri } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    pathSuggestions.value = response.match;
  }
}

async function save() {
  if (editMatch.value) {
    const editMatchCopy = cloneDeep(editMatch.value);
    editMatchCopy["@id"] = v4();
    emit("onMatchAdd", editMatchCopy);
  }
  visible.value = false;
}

function clear() {
  editMatch.value = {};
  pathSuggestions.value = [];
  selectedGeneralConcept.value = undefined;
  searchTerm.value = "";
  // selectedType.value = undefined;
  treeIri.value = "";
  detailsIri.value = "";
}

function getLeafMatch(match: Match) {
  if (!match.where) return match;
  const found: Match[] = [];
  getLeafWhereRecursively(match.where, found, match);
  if (found.length) return found[0];
  else return match;
}

function getLeafWhereRecursively(whereList: Where[], found: Match[], currentMatch: Match) {
  const hasNested = whereList.find(nestedWhere => nestedWhere.match?.where);
  if (hasNested) getLeafWhereRecursively(hasNested.match?.where!, found, hasNested.match!);
  else found.push(currentMatch);
}

function locateInTree(iri: string) {
  treeIri.value = iri;
}

function onTypeSelect(typeOption: TypeOption) {
  if (typeOption) {
    if (!typeOption.typeIri && !typeOption.rootIri) {
      rootEntities.value = [];
      imQuery.value = undefined;
    }
    if (typeOption.typeIri) updateIMQueryType({ "@id": typeOption.typeIri });
    if (typeOption.rootIri) rootEntities.value = [typeOption.rootIri];
  }
  updateSearch.value = !updateSearch.value;
}

function updateIMQueryType(type: TTIriRef) {
  if (!imQuery.value) imQuery.value = { query: {} };
  if (imQuery.value.query) deleteQueryPredicateIfExists(imQuery.value?.query, RDF.TYPE);
  addTypeFilterToIMQuery([type], imQuery.value, true);
}

function updateIMQueryBinding() {
  const dmIri = selectedPath.value?.typeOf?.["@id"];
  const propIri = selectedPath.value?.where?.[0]?.["@id"];
  if (dmIri && propIri) {
    if (!imQuery.value) imQuery.value = { query: {} };
    addBindingsToIMQuery([{ node: { "@id": dmIri }, path: { "@id": propIri } }], imQuery.value);
  }
}

function clearPath() {
  selectedPath.value = undefined;
  updateSearch.value = !updateSearch.value;
  if (isObjectHasKeys(imQuery.value, ["query"])) deleteQueryPredicateIfExists(imQuery.value!.query, IM.BINDING);
  selectedSet.value = new Set<string>();
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.add-base-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.query-nav-tree {
  height: 70vh;
}

.edit-property {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
}

.add-property-button {
  width: 10rem;
  margin-top: 0.5rem;
  margin-left: 1rem;
}
</style>
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
  height: calc(100vh - 18rem);
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
  flex: 1 0 auto;
  flex-wrap: nowrap;
  justify-content: flex-end;
}
</style>

<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
