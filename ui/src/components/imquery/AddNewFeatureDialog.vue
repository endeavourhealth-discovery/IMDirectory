<template>
  <Dialog v-model:visible="visible" modal maximizable :header="header" :style="{ minWidth: '50vw', maxWidth: '80vw', minHeight: '50vh', maxHeight: '80vh' }">
    <Stepper :style="{ minWidth: '50vw' }">
      <StepperPanel>
        <template #header> </template>
        <template #content="{ nextCallback }">
          <div class="flex justify-content-center align-items-center">
            <SelectButton v-model="selectedType" :options="typeOptions" option-label="name" aria-labelledby="basic" @change="onTypeSelect" />
          </div>
          <div class="flex flex-column select-property-wrapper">
            <div class="directory-search-dialog-content">
              <div class="search-bar">
                <SearchBar
                  v-model:searchTerm="searchTerm"
                  v-model:selected="selectedGeneralConcept"
                  :imQuery="imQuery"
                  :show-filters="false"
                  @to-ecl-search="showEclSearch"
                  @to-query-search="showQuerySearch"
                  @to-search="onSearch"
                />
              </div>
              <div class="vertical-divider">
                <div class="left-container">
                  <NavTree
                    :selectedIri="treeIri"
                    :find-in-tree="findInDialogTree"
                    :root-entities="rootEntities"
                    @found-in-tree="findInDialogTree = false"
                    @row-selected="showDetails"
                  />
                </div>
                <div class="right-container">
                  <SearchResults
                    v-if="activePage === 0"
                    :show-filters="false"
                    :updateSearch="updateSearch"
                    :search-term="searchTerm"
                    :im-query="imQuery"
                    @selectedUpdated="updateSelected"
                    @locate-in-tree="locateInTree"
                  />

                  <div v-if="activePage === 1">
                    <DirectoryDetails
                      :selected-iri="detailsIri"
                      @locateInTree="locateInTree"
                      @navigateTo="navigateTo"
                      :showSelectButton="true"
                      v-model:history="history"
                      @selected-updated="updateSelectedFromIri"
                    />
                    <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full" listStyle="max-height:250px">
                      <template #option="{ option }">
                        <div class="flex align-items-center" id="query-path-options">
                          <div v-if="isSelectedConceptValue">
                            {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                              option.where?.[0]?.name
                            }}
                            =
                            {{ selectedGeneralConcept?.name }}
                          </div>
                          <div v-else-if="isSelectedConceptDatamodel">{{ option.path?.[0]?.name }} -> {{ option.typeOf?.name }}</div>
                          <div v-else-if="isSelectedConceptProperty">
                            {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                              option.where?.[0]?.name
                            }}
                          </div>
                        </div>
                      </template>
                    </Listbox>
                  </div>

                  <EclSearch v-if="activePage === 2" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
                  <IMQuerySearch v-if="activePage === 3" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
                </div>
              </div>
            </div>
            <!-- <AutocompleteSearchBar
              v-model:selected="selectedGeneralConcept"
              :quick-type-filters-allowed="[IM.CONCEPT, IM.CONCEPT_SET, RDF.PROPERTY]"
              :im-query="imQuery"
              :search-placeholder="'Select concept, set, property or datamodel'"
              @update-selected-filters="onUpdateSelectedFilters"
            /> -->
            <!-- <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full" listStyle="max-height:250px">
              <template #option="{ option }">
                <div class="flex align-items-center" id="query-path-options">
                  <div v-if="isSelectedConceptValue">
                    {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                      option.where?.[0]?.name
                    }}
                    =
                    {{ selectedGeneralConcept?.name }}
                  </div>
                  <div v-else-if="isSelectedConceptDatamodel">{{ option.path?.[0]?.name }} -> {{ option.typeOf?.name }}</div>
                  <div v-else-if="isSelectedConceptProperty">
                    {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                      option.where?.[0]?.name
                    }}
                  </div>
                </div>
              </template>
            </Listbox> -->
          </div>
          <div class="flex pt-4 justify-content-end next-button">
            <Button
              :disabled="!isObjectHasKeys(selectedPath)"
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="
                event => {
                  addSelectedPathMatch();
                  nextCallback(event);
                }
              "
            />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel>
        <template #header> </template>
        <template #content="{ prevCallback }">
          <EditWhere
            v-if="getLeafMatch(editMatch) && isArrayHasLength(getLeafMatch(editMatch).where)"
            v-for="[index, where] of getLeafMatch(editMatch).where!.entries()"
            :edit-where="where"
            :focused="editMatch['@id'] === focusedId"
            :focused-id="focusedId"
            :match-type-of-iri="getLeafMatch(editMatch).typeOf?.['@id'] || dataModelIri"
            @delete-property="editMatch.where?.splice(index, 1)"
          />

          <AddPropertyDialog
            v-if="getLeafMatch(editMatch)"
            v-model:show-dialog="showAddPropertyDialog"
            :dataModelIri="getLeafMatch(editMatch).typeOf?.['@id'] || dataModelIri"
            :header="'Add property'"
            :show-variable-options="false"
            @on-match-add="onMatchAdd"
            @on-property-add="onPropertyAdd"
          />
          <Button
            v-if="editMatch['@id'] === focusedId"
            label="Add property"
            severity="success"
            icon="fa-solid fa-plus"
            class="add-property-button"
            @click="showAddPropertyDialog = true"
          />

          <div class="flex pt-4 justify-content-between populate-property-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
            <Button label="Save" iconPos="right" @click="save" />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { Match, PathQuery, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef, Where } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { EntityService, QueryService } from "@/services";
import { isConcept, isProperty, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { getNameFromIri } from "@im-library/helpers/TTTransform";
import { computed } from "vue";
import { addTypeFilterToIMQuery, deleteQueryPredicateIfExists } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import EditWhere from "./EditWhere.vue";
import AddPropertyDialog from "./AddPropertyDialog.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import SearchBar from "../shared/SearchBar.vue";
import NavTree from "../shared/NavTree.vue";
import SearchResults from "../shared/SearchResults.vue";
import DirectoryDetails from "../directory/DirectoryDetails.vue";
import IMQuerySearch from "../directory/IMQuerySearch.vue";
import EclSearch from "../directory/EclSearch.vue";

interface TypeOption {
  name: string;
  rootIri: string;
  typeIri: string;
}

interface Props {
  showDialog: boolean;
  match?: Match;
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
const editMatch: Ref<Match> = ref({ where: [] } as Match);
const visible: Ref<boolean> = ref(false);
const selectedGeneralConcept: Ref<SearchResultSummary | undefined> = ref();
const imQuery: Ref<QueryRequest | undefined> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
const isSelectedConceptValue = computed(
  () => selectedGeneralConcept.value && (isConcept(selectedGeneralConcept.value.entityType) || isValueSet(selectedGeneralConcept.value.entityType))
);
const isSelectedConceptProperty = computed(() => selectedGeneralConcept.value && isProperty(selectedGeneralConcept.value.entityType));
const isSelectedConceptDatamodel = computed(() => selectedGeneralConcept.value && isRecordModel(selectedGeneralConcept.value.entityType));
const focusedId: Ref<string | undefined> = ref();
const showAddPropertyDialog: Ref<boolean> = ref(false);

const updateSearch: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);

const treeIri = ref("");
const searchTerm = ref("");
const history: Ref<string[]> = ref([]);
const activePage = ref(0);
const detailsIri = ref("");
const typeOptions: Ref<TypeOption[]> = ref([
  { name: "Concept", rootIri: "http://endhealth.info/im#HealthModelOntology", typeIri: IM.CONCEPT },
  { name: "Concept set", rootIri: IM.FOLDER_SETS, typeIri: IM.CONCEPT_SET },
  { name: "Property", rootIri: "http://endhealth.info/im#Properties", typeIri: IM.DATAMODEL_PROPERTY },
  { name: "Data model", rootIri: "http://endhealth.info/im#DataModels", typeIri: SHACL.NODESHAPE }
]);
const selectedType: Ref<"Concept" | "Concept set" | "Property" | "Data model" | undefined> = ref();
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
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

watch(
  () => cloneDeep(props.match),
  newValue => {
    if (isObjectHasKeys(newValue, ["where"]) && isArrayHasLength(newValue!.where)) editMatch.value.where = cloneDeep(newValue!.where);
  }
);

onMounted(() => init());

function init() {
  if (isArrayHasLength(props.match?.where)) editMatch.value.where = cloneDeep(props.match!.where);
}

async function addSelectedPathMatch() {
  editMatch.value.where = [];
  if (selectedPath.value?.where?.[0]) {
    if (selectedGeneralConcept.value && isSelectedConceptValue.value)
      selectedPath.value.where[0].is = [{ "@id": selectedGeneralConcept.value.iri, name: selectedGeneralConcept.value.name }];
  }
  if (selectedPath.value) editMatch.value = selectedPath.value;
}

async function getOptions() {
  if (selectedGeneralConcept.value?.iri) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": selectedGeneralConcept.value?.iri } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    pathSuggestions.value = response.match;
  }
}

async function save() {
  const editMatchCopy = cloneDeep(editMatch.value);
  editMatchCopy["@id"] = v4();
  emit("onMatchAdd", editMatchCopy);
  visible.value = false;
}

function clear() {
  editMatch.value = {};
  pathSuggestions.value = [];
  selectedGeneralConcept.value = undefined;
}

function onPropertyAdd(property: Where) {
  const leafMatch = getLeafMatch(editMatch.value);
  const hasProperty = leafMatch.where?.some(where => where["@id"] === property["@id"]);
  if (!hasProperty) {
    leafMatch.where?.push(property);
    describeMatch(editMatch.value, 0, false);
  }
}

function onMatchAdd(match: Match) {
  if (!isArrayHasLength(editMatch.value.match)) editMatch.value.match = [];
  editMatch.value.match?.push(match);
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

function showEclSearch() {
  activePage.value = 2;
}

function showQuerySearch() {
  activePage.value = 3;
}

function onSearch() {
  if (searchTerm.value) {
    activePage.value = 0;
    updateSearch.value = !updateSearch.value;
  }
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

function updateSelected(data: SearchResultSummary) {
  navigateTo(data.iri);
  locateInTree(data.iri);
  selectedGeneralConcept.value = data;
}

async function updateSelectedFromIri(iri: string) {
  selectedGeneralConcept.value = await EntityService.getEntitySummary(iri);
}

function onTypeSelect(event: { value: TypeOption }) {
  if (event.value) {
    if (event.value.typeIri) updateIMQuery({ "@id": event.value.typeIri });
    if (event.value.rootIri) rootEntities.value = [event.value.rootIri];
  } else {
    rootEntities.value = [];
    imQuery.value = undefined;
  }
  updateSearch.value = !updateSearch.value;
}

function updateIMQuery(type: TTIriRef) {
  if (!imQuery.value) imQuery.value = { query: {} };
  if (imQuery.value.query) deleteQueryPredicateIfExists(imQuery.value?.query, RDF.TYPE);
  addTypeFilterToIMQuery([type], imQuery.value, true);
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
