<template>
  <div v-for="(included, clauseIndex) of clauses">
    <li class="rule-container">
      <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" @click="removeClause(clauseIndex)" />
      <Dropdown v-model="included.include" :options="includeOptions" option-label="name" option-value="value" placeholder="Include or exclude" />
      <EntityAutocomplete :ttAlias="included.concept" />
      <Dropdown
        v-model="included.concept.includeSubtypes"
        :options="includeSubtypesOptions"
        option-label="name"
        option-value="value"
        placeholder="Include subtypes"
      />
    </li>

    <div v-for="(refinement, refinementIndex) of included.refinements">
      <ul class="refinement-container">
        <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" @click="removeRefinement(clauseIndex, refinementIndex)" />
        <EntityAutocomplete
          :ttAlias="refinement.property"
          :parentClauseIri="included.concept['@id']"
          :get-suggestions-method="getAllowablePropertySuggestions"
        />
        <Dropdown
          v-model="refinement.property.includeSubtypes"
          :options="includeSubtypesOptions"
          option-label="name"
          option-value="value"
          placeholder="Include subtypes"
        />
        <i class="icon pi pi-arrow-right" />
        <EntityAutocomplete :ttAlias="refinement.is" :parentClauseIri="refinement.property['@id']" :get-suggestions-method="getAllowableRangeSuggestions" />
        <Dropdown
          v-model="refinement.is.includeSubtypes"
          :options="includeSubtypesOptions"
          option-label="name"
          option-value="value"
          placeholder="Include subtypes"
        />
      </ul>
    </div>
    <ul class="refinement-button">
      <Button icon="pi pi-cog" label="Add refinement" class="p-button-warning" @click="addRefinement(clauseIndex)" />
    </ul>
    <div class="rule-button">
      <SplitButton
        v-if="clauseIndex === clauses.length - 1"
        icon="pi pi-plus"
        label="Add concept"
        class="p-button-success"
        @click="addConcept"
        :model="addButtonActions"
      />
    </div>
  </div>
  <AddByCodeList :showAddByList="showAddByList" @addCodeList="addCodeList" @close-dialog="showAddByList = false" />
</template>

<script setup lang="ts">
import { SetQueryObject, TTAlias, Refinement } from "im-library/interfaces";
import { PropType, Ref, ref } from "vue";
import AddByCodeList from "./AddByCodeList.vue";
import EntityAutocomplete from "./EntityAutocomplete.vue";
import { QueryService } from "@/services";

const defaultTTAlias = { includeSubtypes: true } as TTAlias;
const includeOptions = [
  { name: "include", value: true },
  { name: "exclude", value: false }
];
const includeSubtypesOptions = [
  { name: "include subtypes", value: true },
  { name: "exclude subtypes", value: false }
];

const addButtonActions = ref([
  {
    label: "Add by code list",
    icon: "pi pi-upload",
    command: () => {
      showAddByList.value = true;
    }
  }
]);

const props = defineProps({ clauses: { type: Array as PropType<SetQueryObject[]>, required: true } });
const showAddByList = ref(false);

function addCodeList(selectedCodes: any[]) {
  for (const selectedCode of selectedCodes) {
    const newTTAlias = { "@id": selectedCode["@id"], name: selectedCode.name, includeSubtypes: true } as TTAlias;
    addConcept(newTTAlias);
  }

  showAddByList.value = false;
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
  return await QueryService.getAllowablePropertySuggestions(iri, searchTerm);
}

async function getAllowableRangeSuggestions(iri: string, searchTerm: string) {
  return await QueryService.getAllowableRangeSuggestions(iri, searchTerm);
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
