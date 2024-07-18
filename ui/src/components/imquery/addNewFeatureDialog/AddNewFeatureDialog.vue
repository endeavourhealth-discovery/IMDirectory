<template>
  <Dialog v-model:visible="visible" modal :header="header" :style="{ minWidth: '100vw', minHeight: '100vh' }">
    <Stepper value="1" :style="{ minWidth: '50vw' }">
      <StepList value="0">
        <Step value="1"><PathDisplay v-if="selectedPath" :path="selectedPath" :can-clear-path="canClearPath" @on-clear-path="clearPath" /></Step>
        <Step value="2"></Step>
      </StepList>
      <StepPanels value="0">
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="flex flex-column select-property-wrapper">
            <div class="directory-search-dialog-content">
              <div class="search-bar">
                <SearchBarWithRadioFilters :show-type-filters="showTypeFilters" @on-search="onSearch" @on-type-select="onTypeSelect" />
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
                    :selected-value-map="selectedValueMap"
                    v-model:selected-path="selectedPath"
                    @locate-in-tree="iri => (treeIri = iri)"
                    @go-to-next-step="activateCallback('2')"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex pt-4 justify-content-end next-button">
            <Button
              v-if="hasNextStep && !hasQueryOrFeatureSelected"
              :disabled="!isObjectHasKeys(selectedPath)"
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="activateCallback('2')"
            />
            <Button v-else :disabled="!isObjectHasKeys(selectedPath) && !hasQueryOrFeatureSelected" label="Save" iconPos="right" @click="save" />
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
import { Match, Node, PathQuery, QueryRequest, SearchResultSummary, TTIriRef, Where } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF } from "@im-library/vocabulary";
import { EntityService, QueryService } from "@/services";
import { addBindingsToIMQuery, addTypeFilterToIMQuery, deleteQueryPredicateIfExists } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import NavTree from "../../shared/NavTree.vue";
import SearchBarWithRadioFilters, { TypeOption } from "./SearchBarWithRadioFilters.vue";
import SearchResultsAndDetails from "./SearchResultsAndDetails.vue";
import EditMatch from "../EditMatch.vue";
import PathDisplay from "./PathDisplay.vue";
import { isFeature, isQuery } from "@im-library/helpers/ConceptTypeMethods";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";

interface Props {
  showDialog: boolean;
  match?: Match;
  canClearPath?: boolean;
  header: string;
  dataModelIri: string;
  showVariableOptions: boolean;
  hasNextStep?: boolean;
  showTypeFilters?: boolean;
  isList?: Node[];
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
const imQuery: Ref<QueryRequest | undefined> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
provide("selectedPath", selectedPath);

const selectedValueMap: Ref<Map<string, Node>> = ref(new Map<string, Node>());
const updateSearch: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);

const treeIri = ref("");
const searchTerm = ref("");
const detailsIri = ref("");
const hasQueryOrFeatureSelected: Ref<boolean> = ref(false);

const rootEntities: Ref<string[] | undefined> = ref();
watch(
  () => props.showDialog,
  newValue => {
    if (visible.value) init();
    else clear();
    visible.value = newValue;
  }
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

watch(
  () => cloneDeep(selectedValueMap.value),
  async () => {
    await setHasQueryOrFeatureSelected();
  }
);

onMounted(() => init());

function init() {
  if (props.isList?.length) {
    for (const isItem of props.isList) selectedValueMap.value.set(isItem["@id"]!, isItem);
  }
  imQuery.value = undefined;
  rootEntities.value = undefined;
  if (isObjectHasKeys(props.match)) {
    editMatch.value = cloneDeep(props.match);
    selectedPath.value = cloneDeep(editMatch.value);
  } else {
    selectedPath.value = undefined;
  }
}

async function setHasQueryOrFeatureSelected() {
  if (selectedValueMap.value.size) {
    const iri = selectedValueMap.value.keys().next().value;
    const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
    hasQueryOrFeatureSelected.value = isQuery(entity[RDF.TYPE]) || isFeature(entity[RDF.TYPE]);
  } else hasQueryOrFeatureSelected.value = false;
}

async function save() {
  if (editMatch.value) {
    const editMatchCopy = cloneDeep(editMatch.value);
    editMatchCopy["@id"] = v4();
    emit("onMatchAdd", editMatchCopy);
  } else if (hasQueryOrFeatureSelected.value) {
    const editMatchCopy: Match = { "@id": v4(), instanceOf: Array.from(selectedValueMap.value.values()) };
    describeMatch(editMatchCopy, 0, false);
    emit("onMatchAdd", editMatchCopy);
  }
  visible.value = false;
}

function clear() {
  editMatch.value = undefined;
  pathSuggestions.value = [];
  searchTerm.value = "";
  treeIri.value = "";
  detailsIri.value = "";
  selectedValueMap.value.clear();
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
  selectedValueMap.value = new Map<string, Node>();
}

function onSearch(payload: string) {
  searchTerm.value = payload;
  updateSearch.value = !updateSearch.value;
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
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
