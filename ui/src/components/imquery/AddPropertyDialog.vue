<template>
  <Dialog v-model:visible="visible" modal maximizable :header="header" :style="{ minWidth: '50vw' }">
    <Stepper :style="{ minWidth: '50vw' }">
      <StepperPanel header="Add rule">
        <template #content="{ nextCallback }">
          <div class="flex flex-column select-property-wrapper">
            <!-- <div class="flex-auto flex align-items-center font-medium select-property-content">
              <QueryNavTree
                :editMatch="editMatch"
                v-model:selected-property="selectedProperty"
                :dm-iri="dataModelIri"
                :show-variable-options="showVariableOptions"
              />
            </div> -->
            <AutocompleteSearchBar
              v-model:selected="selectedGeneralConcept"
              :quick-type-filters-allowed="[IM.CONCEPT, IM.CONCEPT_SET, RDF.PROPERTY]"
              :im-query="imQuery"
              @update-selected-filters="onUpdateSelectedFilters"
            />
            <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full" listStyle="max-height:250px">
              <template #option="{ option }">
                <div class="flex align-items-center">
                  <div v-if="isSelectedConceptValue">
                    {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                      option.where?.[0].name
                    }}
                    =
                    {{ selectedGeneralConcept?.name }}
                  </div>
                  <div v-else-if="isSelectedConceptDatamodel">{{ option.path?.[0].name }} -> {{ option.typeOf?.name }}</div>
                  <div v-else-if="isSelectedConceptProperty">
                    {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                      option.where?.[0].name
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
      <StepperPanel header="Populate value">
        <template #content="{ prevCallback }">
          <EditProperty
            v-if="isArrayHasLength(editMatch.where)"
            v-model:property="editMatch.where![0]"
            :data-model-iri="editMatch.typeOf?.['@id'] || dataModelIri"
            :show-delete="false"
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
import QueryNavTree from "./QueryNavTree.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import EditProperty from "./EditProperty.vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { IM, RDF } from "@im-library/vocabulary";
import { QueryService } from "@/services";
import { isConcept, isProperty, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { getNameFromIri } from "@im-library/helpers/TTTransform";
import { computed } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { addTypeFilterToIMQuery, buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";

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

watch(
  () => props.showDialog,
  newValue => {
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
    if (isObjectHasKeys(props.match, ["property"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
  }
);

onMounted(() => {
  if (isArrayHasLength(props.match?.where)) editMatch.value.where = cloneDeep(props.match!.where);
});

async function addSelectedPathMatch() {
  editMatch.value.where = [];
  if (selectedPath.value?.where?.[0]) {
    if (selectedGeneralConcept.value && isSelectedConceptValue.value)
      selectedPath.value.where[0].is = [{ "@id": selectedGeneralConcept.value.iri, name: selectedGeneralConcept.value.name }];
    editMatch.value = selectedPath.value;
  }
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
</style>
