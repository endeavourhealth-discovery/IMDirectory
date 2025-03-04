<template>
  <Dialog v-model:visible="visible" :header="header" :style="{ width: '95vw', minHeight: '95vh' }" modal>
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div class="select-property-wrapper flex flex-auto flex-col gap-2">
      <Tabs v-model:value="tabValue" v-if="active === 1">
        <TabList>
          <Tab value="0">Search</Tab>
          <Tab value="1" v-if="showNavigate">Navigate</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div class="directory-search-dialog-content">
              <div class="search-bar">
                <SearchBarWithRadioFilters
                  :lockTypeFilters="lockTypeFilters"
                  :show-all-type-filters="showAllTypeFilters"
                  @on-search="onSearch"
                  @on-type-select="onTypeSelect"
                />
              </div>
              <div class="vertical-divider">
                <div class="left-container">
                  <NavTree
                    v-if="rootEntities != undefined"
                    :find-in-tree="findInDialogTree"
                    :root-entities="rootEntities"
                    :selectedIri="treeIri"
                    @found-in-tree="findInDialogTree = false"
                    @row-selected="node => (treeIri = node.data)"
                  />
                </div>
                <div class="right-container">
                  <SearchResultsAndDetails
                    v-model:selected-path="selectedPath"
                    :add-default-value="addDefaultValue"
                    :can-clear-path="canClearPath"
                    :data-model-iri="dataModelIri"
                    :im-query="imQuery"
                    :propertyIri="propertyIri"
                    :search-term="searchTerm"
                    :selectedIri="treeIri"
                    :selectedType="selectedType"
                    :update-search="updateSearch"
                    @locate-in-tree="iri => (treeIri = iri)"
                    @go-to-next-step="active = 2"
                    @selected-iri="updateSelectedIri"
                  />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="1" v-if="showNavigate">
            <div class="directory-search-dialog-content">
              <AddProperty
                v-if="props.dataModelIri"
                :dataModelIri="props.dataModelIri"
                :match="editMatch"
                :show-variable-options="false"
                @on-match-add="onMatchAdd"
                @on-property-add="onPropertyAdd"
                @on-dialog-update="visible = false"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <EditMatch v-if="active === 2 && editMatch" :edit-match="editMatch" :focused-id="editMatch['@id']" :is-root-feature="true" />
      <div v-if="tabValue === '0'" class="flex-0 populate-property-actions flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="visible = false" />
        <Button v-if="hasQueryOrFeatureSelected" data-testid="add-feature-save-query-button" label="Save" @click="addQueryOrFeature" />
        <Button
          v-else-if="active === 1 && hasNextStep"
          :disabled="disableSelect"
          data-testid="add-feature-ok-button"
          iconPos="right"
          label="OK"
          @click="onOKButtonClick"
        />
        <Button v-else data-testid="add-feature-save-button" iconPos="right" label="Save" @click="save" />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, Ref, ref, watch } from "vue";
import { Match, Node, Query, QueryRequest, TTIriRef, Where } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM, RDF } from "@/vocabulary";
import { EntityService, QueryService } from "@/services";
import { addTypeFilterToIMQuery, deleteQueryPredicateIfExists } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import NavTree from "../../shared/NavTree.vue";
import SearchBarWithRadioFilters, { TypeOption } from "./SearchBarWithRadioFilters.vue";
import SearchResultsAndDetails from "./SearchResultsAndDetails.vue";
import EditMatch from "../EditMatch.vue";
import { isFeature, isQuery } from "@/helpers/ConceptTypeMethods";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import AddProperty from "../AddProperty.vue";

interface Props {
  showDialog: boolean;
  match?: Match;
  propertyIri?: string;
  canClearPath?: boolean;
  header: string;
  dataModelIri: string | undefined;
  hasNextStep?: boolean;
  showAllTypeFilters?: boolean;
  isList?: Node[];
  showNavigate?: boolean;
}

const props = defineProps<Props>();
const { getLeafMatch } = setupIMQueryBuilderActions();
const tabValue = ref("0");

const emit = defineEmits({
  onClose: () => true,
  onMatchAdd: (_match: Match) => true,
  "update:showDialog": payload => typeof payload === "boolean"
});
const editMatch: Ref<Match> = ref({});
const visible: Ref<boolean> = ref(false);
const imQuery: Ref<QueryRequest | undefined> = ref();
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
const loading = ref(true);
provide("selectedPath", selectedPath);

const selectedValueMap: Ref<Map<string, Node>> = ref(new Map<string, Node>());
provide("selectedValueMap", selectedValueMap);

const updateSearch: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);

const treeIri = ref("");
const searchTerm = ref("");
const detailsIri = ref("");
const hasQueryOrFeatureSelected: Ref<boolean> = ref(false);
const active = ref(1);
const selectedType = ref("");
const addDefaultValue = ref(false);

const disableSelect = computed(
  () =>
    ([IM.CONCEPT_SET, IM.CONCEPT, IM.DATAMODEL_PROPERTY].includes(selectedType.value) && selectedValueMap.value.size < 1 && !selectedPath.value) ||
    (![IM.CONCEPT_SET, IM.CONCEPT, IM.DATAMODEL_PROPERTY].includes(selectedType.value) && !detailsIri.value)
);
const lockTypeFilters = computed(() => {
  if ((selectedType.value === IM.CONCEPT_SET || selectedType.value === IM.CONCEPT) && selectedValueMap.value.size > 0) {
    return { all: true, concept: false, conceptSet: false, property: true, feature: true, cohort: true };
  } else return undefined;
});

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
    if (newValue) editMatch.value = cloneDeep(newValue);
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
  loading.value = true;
  active.value = 1;
  if (props.isList?.length) {
    for (const isItem of props.isList) selectedValueMap.value.set(isItem["@id"]!, isItem);
  }
  imQuery.value = undefined;
  rootEntities.value = undefined;
  if (isObjectHasKeys(props.match)) {
    if (props.match) editMatch.value = cloneDeep(props.match);
    selectedPath.value = cloneDeep(editMatch.value);
    if (selectedPath.value?.where && props.propertyIri && props.dataModelIri) {
      if (!selectedPath.value.typeOf) selectedPath.value.typeOf = { "@id": props.dataModelIri };
      if (selectedPath.value.where.findIndex(where => where["@id"] === props.propertyIri) === -1) selectedPath.value.where.push({ "@id": props.propertyIri });
    }
    pathSuggestions.value = [selectedPath.value!];
  } else {
    selectedPath.value = undefined;
  }
  loading.value = false;
}

async function setHasQueryOrFeatureSelected() {
  if (selectedValueMap.value.size) {
    const iri = selectedValueMap.value.keys().next().value;

   if (iri){ const entity = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
    hasQueryOrFeatureSelected.value = isQuery(entity[RDF.TYPE]) || isFeature(entity[RDF.TYPE]);
   }
  } else hasQueryOrFeatureSelected.value = false;
  addDefaultValue.value = false;
}

async function save() {
  if (editMatch.value) {
    const describedQuery = await QueryService.getQueryDisplayFromQuery({ match: [editMatch.value] }, false);
    if (describedQuery.match?.[0]) {
      const editMatchCopy = cloneDeep(describedQuery.match![0]);
      editMatchCopy["@id"] = v4();
      emit("onMatchAdd", editMatchCopy);
    }
  }
  visible.value = false;
}

function addQueryOrFeature() {
  const editMatchCopy: Match = { "@id": v4(), instanceOf: Array.from(selectedValueMap.value.values()) };
  emit("onMatchAdd", editMatchCopy);
  visible.value = false;
}

function clear() {
  editMatch.value = {};
  pathSuggestions.value = [];
  searchTerm.value = "";
  treeIri.value = "";
  detailsIri.value = "";
  selectedValueMap.value.clear();
}

function onTypeSelect(typeOption: TypeOption) {
  if (typeOption) {
    if (!typeOption.typeIri && !typeOption.rootIri) {
      rootEntities.value = [];
      imQuery.value = undefined;
    }
    if (typeOption.typeIri) {
      updateIMQueryType({ "@id": typeOption.typeIri });
      selectedType.value = typeOption.typeIri;
    }
    if (typeOption.rootIri) rootEntities.value = [typeOption.rootIri];
  }
  updateSearch.value = !updateSearch.value;
}

function updateIMQueryType(type: TTIriRef) {
  if (!imQuery.value) imQuery.value = { query: {} };
  if (imQuery.value.query) deleteQueryPredicateIfExists(imQuery.value?.query, RDF.TYPE);
  addTypeFilterToIMQuery([type], imQuery.value, true);
}

function onSearch(payload: string) {
  searchTerm.value = payload;
  updateSearch.value = !updateSearch.value;
}

function updateSelectedIri(iri: string) {
  detailsIri.value = iri;
}

function onOKButtonClick() {
  if (selectedValueMap.value.size === 0) {
    addDefaultValue.value = true;
  } else {
    active.value = 2;
  }
}

function onMatchAdd(match: Match) {
  if (!editMatch.value) editMatch.value = {};
  if (!isArrayHasLength(editMatch.value.match)) editMatch.value.match = [];
  editMatch.value.match?.push(match);
  save();
}

async function onPropertyAdd(property: Where) {
  if (!editMatch.value) editMatch.value = {};
  if (!editMatch.value.where) editMatch.value.where = [];
  const propertyIndex = editMatch.value.where.findIndex(where => where["@id"] === property["@id"]);
  if (propertyIndex && propertyIndex !== -1) {
    editMatch.value.where[propertyIndex] = property;
  } else {
    editMatch.value.where.push(property);
  }
  const describedMatch = await QueryService.getQueryDisplayFromQuery({ match: [editMatch.value] } as Query, false);
  if (describedMatch?.match?.[0]?.where) editMatch.value.where = describedMatch.match?.[0].where;
  save();
}
</script>

<style scoped>
.select-property-wrapper {
  flex: 1 1 auto;
  overflow: auto;
}

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
  height: calc(100vh - 25rem);
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

.populate-property-actions {
  margin-top: auto;
}
</style>
