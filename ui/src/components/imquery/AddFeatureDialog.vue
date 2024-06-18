<template>
  <Dialog v-model:visible="visible" modal maximizable :header="header" :style="{ minWidth: '50vw' }">
    <Stepper :style="{ minWidth: '50vw' }">
      <StepperPanel>
        <template #header> </template>
        <template #content="{ nextCallback }">
          <div class="flex flex-column select-property-wrapper">
            <AutocompleteSearchBar
              v-model:selected="selectedGeneralConcept"
              :quick-type-filters-allowed="[IM.CONCEPT, IM.CONCEPT_SET, RDF.PROPERTY]"
              :im-query="imQuery"
              :search-placeholder="'Select concept, set, property or datamodel'"
              @update-selected-filters="onUpdateSelectedFilters"
            />
            <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full" listStyle="max-height:250px">
              <template #option="{ option }">
                <div class="flex align-items-center">
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
            @on-update-dialog-focus="() => {}"
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
import { Match, PathQuery, QueryRequest, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { IM, RDF } from "@im-library/vocabulary";
import { QueryService } from "@/services";
import { isConcept, isProperty, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { getNameFromIri } from "@im-library/helpers/TTTransform";
import { computed } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { addTypeFilterToIMQuery } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import EditWhere from "./EditWhere.vue";
import AddPropertyDialog from "./AddPropertyDialog.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";

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
const imQuery: Ref<QueryRequest | undefined> = ref({ query: {} });
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
const isSelectedConceptValue = computed(
  () => selectedGeneralConcept.value && (isConcept(selectedGeneralConcept.value.entityType) || isValueSet(selectedGeneralConcept.value.entityType))
);
const isSelectedConceptProperty = computed(() => selectedGeneralConcept.value && isProperty(selectedGeneralConcept.value.entityType));
const isSelectedConceptDatamodel = computed(() => selectedGeneralConcept.value && isRecordModel(selectedGeneralConcept.value.entityType));
const focusedId: Ref<string | undefined> = ref();
const showAddPropertyDialog: Ref<boolean> = ref(false);
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
    if (isObjectHasKeys(props.match, ["where"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
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

function onUpdateSelectedFilters(filterOptions: FilterOptions) {
  if (imQuery.value) addTypeFilterToIMQuery(filterOptions.types, imQuery.value);
}

function clear() {
  editMatch.value = {};
  pathSuggestions.value = [];
  selectedGeneralConcept.value = undefined;
}

function addProperty() {
  if (!isArrayHasLength(editMatch.value.where)) editMatch.value.where = [];
  editMatch.value.where!.push({});
}

function onPropertyAdd(property: Where) {
  const hasProperty = editMatch.value.where?.some(where => where["@id"] === property["@id"]);
  if (!hasProperty) {
    editMatch.value.where?.push(property);
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
