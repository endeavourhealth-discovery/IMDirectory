<template>
  <div v-for="(included, clauseIndex) of clauses">
    <li class="rule-container">
      <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" @click="removeClause(clauseIndex)" />
      <Dropdown v-model="included.include" :options="includeOptions" option-label="name" option-value="value" placeholder="Include or exclude" />
      <EntityAutocomplete :ttAlias="included.concept" />
      <Dropdown v-model="included.concept.includeSubtypes" :options="includeSubtypesOptions" @change="selectSubTypeOption(included.concept)" />
    </li>

    <div v-for="(refinement, refinementIndex) of included.refinements">
      <ul class="refinement-container">
        <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" @click="removeRefinement(clauseIndex, refinementIndex)" />
        <EntityAutocomplete
          :ttAlias="refinement.property"
          :parentClauseIri="included.concept['@id']"
          :get-suggestions-method="getAllowablePropertySuggestions"
        />
        <Dropdown v-model="refinement.property.includeSubtypes" :options="includeSubtypesOptions" @change="selectSubTypeOption(refinement.property)" />
        <i class="icon pi pi-arrow-right" />
        <EntityAutocomplete :ttAlias="refinement.is" :parentClauseIri="refinement.property['@id']" :get-suggestions-method="getAllowableRangeSuggestions" />
        <Dropdown v-model="refinement.is.includeSubtypes" :options="includeSubtypesOptions" @change="selectSubTypeOption(refinement.is)" />
      </ul>
    </div>
    <ul class="refinement-button">
      <Button icon="pi pi-cog" label="Add refinement" class="p-button-warning" @click="addRefinement(clauseIndex)" />
    </ul>
    <div class="rule-button">
      <SplitButton v-if="clauseIndex === clauses.length - 1" icon="pi pi-plus" label="Add concept" class="p-button-success" :model="addButtonActions">
        <Button @click="addConcept" icon="pi pi-plus" label="Add concept"> </Button>
      </SplitButton>
    </div>
  </div>
  <AddByCodeList :showAddByList="showAddByList" :showAddByFile="showAddByFile" @addCodeList="addCodeList" @close-dialog="closeDialog" />
</template>

<script setup lang="ts">
import { SetQueryObject, Refinement, AliasEntity } from "@im-library/interfaces";
import { PropType, ref } from "vue";
import AddByCodeList from "./AddByCodeList.vue";
import EntityAutocomplete from "./EntityAutocomplete.vue";
import { QueryService } from "@/services";
import { TTAlias } from "@im-library/models/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

const defaultTTAlias = {} as TTAlias;
const includeOptions = [
  { name: "include", value: true },
  { name: "exclude", value: false }
];

const includeSubtypesOptions = ["", "descendantsOrSelf", "descendants", "ancsestorsOrSelf"];

const addButtonActions = ref([
  {
    label: "Add by code list",
    icon: "pi pi-upload",
    command: () => {
      showAddByList.value = true;
    }
  },
  {
    label: "Add by file",
    icon: "pi pi-file",
    command: () => {
      showAddByFile.value = true;
    }
  }
]);

const props = defineProps({ clauses: { type: Array as PropType<SetQueryObject[]>, required: true } });
const showAddByList = ref(false);
const showAddByFile = ref(false);

function addCodeList(selectedCodes: any[]) {
  for (const selectedCode of selectedCodes) {
    const newTTAlias = { "@id": selectedCode["@id"], name: selectedCode.name } as TTAlias;
    addConcept(newTTAlias);
  }
  closeDialog();
}

function closeDialog() {
  showAddByList.value = false;
  showAddByFile.value = false;
}

function selectSubTypeOption(ttAlias: any) {
  const selected = (ttAlias as any).includeSubtypes as string;
  if (selected) ttAlias[selected] = true;

  const unselected = includeSubtypesOptions.filter(option => option !== selected);
  for (const option of unselected) {
    delete ttAlias[option];
  }
}

function addRefinement(index: number) {
  const refinement = { property: { ...defaultTTAlias }, is: { ...defaultTTAlias } } as Refinement;
  props.clauses[index].refinements.push(refinement);
}
function removeClause(index: number) {
  if (props.clauses.length !== 1) props.clauses.splice(index, 1);
}
function removeRefinement(clauseIndex: number, refinementIndex: number) {
  props.clauses[clauseIndex].refinements.splice(refinementIndex, 1);
}
function addConcept(ttAlias?: TTAlias) {
  const newObject = {
    include: true,
    concept: ttAlias || { ...defaultTTAlias },
    refinements: [] as Refinement[]
  } as SetQueryObject;
  props.clauses.push(newObject);
}

async function getAllowablePropertySuggestions(iri: string, searchTerm: string) {
  const result = await QueryService.getAllowablePropertySuggestions(iri, searchTerm);
  return convertAliasEntitiesToTTIriRefs(result);
}

async function getAllowableRangeSuggestions(iri: string, searchTerm: string) {
  const result = await QueryService.getAllowableRangeSuggestions(iri, searchTerm);
  return convertAliasEntitiesToTTIriRefs(result);
}

function convertAliasEntitiesToTTIriRefs(aliasEntities: AliasEntity[]) {
  if (!isArrayHasLength(aliasEntities)) return [];
  return aliasEntities.map(aliasEntity => {
    return {
      "@id": aliasEntity.iri,
      name: aliasEntity.name
    };
  });
}
</script>

<style scoped>
.rule-container {
  list-style-type: none;
  margin: none;
}

.refinement-container {
  list-style-type: none;
  margin: 0rem;
}

.icon {
  align-self: center;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
