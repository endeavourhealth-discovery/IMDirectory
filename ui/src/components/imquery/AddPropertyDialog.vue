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
                  <div>{{ option.path?.[0].name }} -> {{ option.typeOf?.name }}.{{ option.where?.[0].name }} = {{ selectedGeneralConcept?.name }}</div>
                </div>
              </template>
            </Listbox>
          </div>
          <div class="flex pt-4 justify-content-end next-button">
            <Button :disabled="!isObjectHasKeys(selectedPath)" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Populate value">
        <template #content="{ prevCallback }">
          <EditProperty v-model:property="editWhere" :data-model-iri="editWhereDMIri || dataModelIri" :show-delete="false" />
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
import { TreeNode } from "primevue/treenode";
import { buildProperty } from "@im-library/helpers/QueryBuilder";
import QueryNavTree from "./QueryNavTree.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import EditProperty from "./EditProperty.vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { QueryService } from "@/services";

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
const editMatch: Ref<Match> = ref({ property: [] } as Match);
const selectedProperty: Ref<TreeNode> = ref({});
const visible: Ref<boolean> = ref(false);
const editWhere: Ref<Where> = ref({});
const editWhereDMIri: Ref<string> = ref("");
const whereOrMatch: Ref<Where | Match> = ref({});
const selectedGeneralConcept: Ref<SearchResultSummary | undefined> = ref();
const imQuery: Ref<QueryRequest | undefined> = ref({ query: {} });
const pathSuggestions: Ref<Match[]> = ref([]);
const selectedPath: Ref<Match | undefined> = ref();
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

watch(
  () => cloneDeep(selectedProperty.value),
  newValue => {
    if (isObjectHasKeys(selectedProperty.value)) {
      whereOrMatch.value = buildProperty(selectedProperty.value as any);
      if (isObjectHasKeys(whereOrMatch.value, ["typeOf", "where"])) {
        editWhere.value = getEditWhere(whereOrMatch.value.where![0]!);
        const dmIriFromProperty = getEditWhereDMIri(whereOrMatch.value.where![0]!);
        if (dmIriFromProperty) editWhereDMIri.value = dmIriFromProperty;
        else editWhereDMIri.value = (whereOrMatch.value as Match).typeOf?.["@id"] ?? "";
      } else {
        editWhere.value = getEditWhere(whereOrMatch.value);
        editWhereDMIri.value = getEditWhereDMIri(whereOrMatch.value);
      }
    }
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.match, ["property"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
});

async function getOptions() {
  if (selectedGeneralConcept.value?.iri) {
    const pathQuery = { source: { "@id": props.dataModelIri }, target: { "@id": selectedGeneralConcept.value?.iri } } as PathQuery;
    const response = await QueryService.pathQuery(pathQuery);
    pathSuggestions.value = response.match;
  }
}

async function save() {
  if (isObjectHasKeys(whereOrMatch.value, ["typeOf", "where"])) {
    emit("onMatchAdd", whereOrMatch.value as Match);
  } else emit("onPropertyAdd", whereOrMatch.value as Where);
  visible.value = false;
}

function getEditWhere(whereMatch: any) {
  const found: any[] = [];
  getEditWhereRecursively(whereMatch, found);
  if (isArrayHasLength(found)) return found[0];
}

function getEditWhereRecursively(where: Where, found: any[]) {
  if (where.match?.where) {
    for (const nestedWhere of where.match?.where) {
      getEditWhereRecursively(nestedWhere, found);
    }
  } else found.push(where);
}

function getEditWhereDMIri(whereMatch: any) {
  const found: string[] = [];
  getEditWhereDMIriRecursively(whereMatch, found);
  if (isArrayHasLength(found)) return found[0];
  return "";
}

function getEditWhereDMIriRecursively(where: Where, found: any[]) {
  if (where.match?.where) {
    found[0] = where.match.typeOf?.["@id"];
    for (const nestedWhere of where.match?.where) {
      getEditWhereRecursively(nestedWhere, found);
    }
  }
}

function onUpdateSelectedFilters() {}
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
