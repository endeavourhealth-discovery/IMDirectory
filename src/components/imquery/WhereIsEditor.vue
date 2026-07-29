<template>
  <div class="set-container">
    <template v-for="(node, index) in property.is" v-if="property.is && property.is.length > 0" :key="index" class="concept-container">
      <div class="concept-container flex items-end gap-2">
        <div class="node-inclusion">
          <Select
            :model-value="getNodeInclusion(node)"
            :options="NodeInclusionOptions"
            option-label="label"
            option-value="value"
            style="width: 8.5rem; min-height: 2.3rem"
            @update:model-value="(val: string) => updateNodeInclusion(node, val)"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ getNodeInclusion(node) }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div v-if="node.iri" class="auto-complete-container">
          <IMViewerLink v-if="node.iri" :action="'view'" :iri="node.iri" :label="node.name" />
          <span v-if="node.parameter">"{{ node.parameter }}" passed into query as a parameter at run time</span>
        </div>
        <div v-if="members">
          <AutoComplete
            v-model="member"
            :suggestions="filteredMembers"
            dropdown
            optionLabel="name"
            @complete="searchMembers"
            @update:model-value="updateMember(member, node)"
          >
            <template #option="slotProps">
              <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </AutoComplete>
        </div>
        <div v-else-if="!node.iri" class="auto-complete-container">
          <AutocompleteSearchBar
            ref="searchBar"
            v-model:selected="selected"
            :im-query="imQueryForConceptSearch"
            :root-entities="rootEntities"
            @update:selected="updateIsIri(node)"
          />
        </div>
        <div>
          <Select
            :disabled="!isConstraintEditable(node)"
            :modelValue="getPlainConstraintOperatorValue(node)"
            :options="PlainConstraintOperatorOptions"
            option-label="label"
            option-value="value"
            style="width: 10.5rem; min-height: 2.3rem"
            @update:modelValue="(val: string) => setConstraintOperator(node, val)"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ getPlainConstraintOperatorLabel(node) }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div>
          <Button class="delete-button" icon="fa-solid fa-trash" @click.stop="deleteNode(index)" />
        </div>
        <div v-if="index === property.is.length - 1 && property.is[index].iri">
          <Button class="add-button" data-testid="add-clause-button" icon="fa-solid fa-plus" label="Add concept" type="button" @click="addConcept" />
        </div>
        <div v-else>
          <Button :severity="'secondary'" class="pointer-events-none invisible" disabled style="width: 8.5rem; height: 2.3rem; padding: 0" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref } from "vue";

import { IM } from "@endeavour/vue-library/enums";
import { type Node, type QueryRequest, SearchOptionsSchema, type SearchResultSummary, type UIProperty, type Where } from "@endeavour/vue-library/models";

import { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import Button from "primevue/button";

import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { NodeInclusionOptions } from "@/constants/queryEditor/NodeInclusionOptions";
import { PlainConstraintOperatorOptions } from "@/constants/queryEditor/PlainConstraintOperatorOptions";
import { getPlainConstraintOperatorLabel, getPlainConstraintOperatorValue } from "@/helpers/QueryEditorMethods";
import { buildIMQueryFromFilters, setConstraintOperator } from "@/helpers/buildQuery";
import { SearchOptions } from "@/interfaces";
import SetService from "@/services/SetService";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  parent?: any;
  uiProperty: UIProperty;
}
const props = defineProps<Props>();
const searchBar = ref<{ searchText: string } | null>(null);
const property = defineModel<Where>("property", { default: {} });
const emit = defineEmits(["updateProperty"]);
const node: Ref<Node> = ref({} as Node);
const filterStore = useFilterStore();
const coreSchemes = computed(() => filterStore.coreSchemes);
const selected: Ref<SearchResultSummary> = ref({ iri: node.value.iri, name: node.value.name } as SearchResultSummary);
const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();
const showAddConcept = ref(false);
const rootEntities: Ref<string[]> = computed(() => {
  return [IM.ONTOLOGY_PARENT_FOLDER, IM.CONCEPT_SET_PARENT_FOLDER];
});
const members: Ref<Node[] | undefined> = ref();
const member: Ref<Node | undefined> = ref();
const filteredMembers: Ref<Node[]> = ref([]);

onMounted(() => {
  init();
});

function getNodeInclusion(node: Node): string {
  if (node.exclude) return "exclude";
  else return "include";
}
function searchMembers(event: AutoCompleteCompleteEvent) {
  if (members.value) {
    const query = event.query.toLowerCase();
    filteredMembers.value = members.value.filter(member => member.name?.toLowerCase().startsWith(query));
  }
}

function updateMember(member: Node | undefined, node: Node) {
  if (!member) return;
  if (!property.value.is) property.value.is = [];
  node.iri = member.iri;
  node.name = member.name;
  node.type = IM.CONCEPT;
  showAddConcept.value = false;
  emit("updateProperty", property.value);
}
function isConstraintEditable(node: Node): boolean {
  if (node) {
    if (node.type === IM.CONCEPT_SET) {
      return false;
    }
    if (node.memberOf) return false;
  }
  return true;
}

async function init() {
  buildIMQueryForConceptSearch();

  if (
    props.uiProperty &&
    props.uiProperty.setMemberCount &&
    props.uiProperty.setMemberCount > 0 &&
    props.uiProperty.setMemberCount < 20 &&
    props.uiProperty.valueType
  ) {
    const memberSet = await SetService.getMembers(props.uiProperty.valueType, false, 1, 11);
    if (memberSet) members.value = memberSet.result;
  }
}
function updateNodeInclusion(node: Node, val: string) {
  node.exclude = val !== "include";
  emit("updateProperty");
}

function buildIMQueryForConceptSearch() {
  const coreSchemesAsIris = coreSchemes.value.map(iri => {
    return { iri: iri };
  });
  const searchOptions = SearchOptionsSchema.parse({
    schemes: coreSchemesAsIris,
    status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
    types: [{ iri: IM.CONCEPT }, { iri: IM.CONCEPT_SET }]
  });
  imQueryForConceptSearch.value = buildIMQueryFromFilters(searchOptions);
}

function deleteNode(index: number) {
  property.value.is?.splice(index, 1);
  if (property.value.is?.length === 0) property.value.is = [{} as Node];
  emit("updateProperty");
}
function addConcept() {
  property.value.is?.push({} as Node);
  showAddConcept.value = true;
}

function updateIsIri(node: Node) {
  if (selected.value) {
    node.iri = selected.value.iri;
    node.name = selected.value.name;
    node.type = selected.value.type[0].iri;
    property.value.invalid = false;
    setConstraintOperator(node, node.type === IM.CONCEPT ? "descendantsOrSelfOf" : "memberOf");
    if (!property.value.is) property.value.is = [];
    selected.value = {} as SearchResultSummary;
    showAddConcept.value = false;
    emit("updateProperty", property.value);
  }
}
</script>

<style lang="scss" scoped>
.add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
}
.set-container {
  flex: 1 0 0%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}
.concept-container {
  flex: 1 0 0%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}
.auto-complete-container {
  flex: 1 1 0%;
  min-width: 40rem;
}

.sync-warning {
  color: var(--p-black-500) !important;
}
.set-member-container {
  min-width: 84rem;
}
.node-inclusion {
  width: 8.5rem;
  min-height: 2.3rem;
}
.node-constraint-operator {
  width: 9.5rem;
  min-height: 2.3rem;
}
.node-display {
  min-width: 80rem;
}
.selected-member-container {
  display: flex;
  flex-flow: row nowrap;
  min-width: 80rem;
}
</style>
