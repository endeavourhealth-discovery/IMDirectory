<template>
  <div class="set-container">
    <template v-if="property.is && property.is.length > 0" v-for="(node, index) in property.is" :key="index" class="concept-container">
      <div class="concept-container flex items-end gap-2">
        <div class="node-inclusion">
          <Select
            style="width: 8.5rem; min-height: 2.3rem"
            :model-value="getNodeInclusion(node)"
            :options="nodeInclusionOptions"
            option-label="label"
            option-value="value"
            @update:model-value="(val: string) => updateNodeInclusion(node, val)"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ getNodeInclusion(node) }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div v-if="node.iri" class="auto-complete-container">
          <IMFontAwesomeIcon :icon="getTypeIcon(node)" :style="'color:' + getIconColor(node)" />
          <span v-if="node.description" v-html="node.description"></span>
          <IMViewerLink v-if="node.iri" :iri="node.iri" :label="node.name" :action="'view'" />
          <span v-if="node.parameter">"{{ node.parameter }}" passed into query as a parameter at run time</span>
        </div>
        <div v-if="!node.iri" class="auto-complete-container">
          <AutocompleteSearchBar
            ref="searchBar"
            v-model:selected="selected"
            :im-query="imQueryForConceptSearch"
            :root-entities="[IM.ONTOLOGY_PARENT_FOLDER, IM.CONCEPT_SET_PARENT_FOLDER]"
            @update:selected="updateIsIri(node)"
          />
        </div>
        <div>
          <Select
            style="width: 10.5rem; min-height: 2.3rem"
            :disabled="!isConstraintEditable(node)"
            :modelValue="getPlainConstraintOperatorValue(node)"
            :options="plainConstraintOperatorOptions"
            option-label="label"
            option-value="value"
            @update:modelValue="(val: string) => setConstraintOperator(node, val)"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ getPlainConstraintOperatorLabel(node) }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div>
          <Button
            @click.stop="deleteNode(index)"
            :class="!hoverDeleteNode[index] && 'hover-button'"
            :severity="hoverDeleteNode[index] ? 'danger' : 'secondary'"
            :outlined="!hoverDeleteNode[index]"
            icon="fa-solid fa-trash"
            @mouseover="hoverDeleteNode[index] = true"
            @mouseout="hoverDeleteNode[index] = false"
          />
        </div>
        <div v-if="index === property.is.length - 1 && property.is[index].iri">
          <Button
            type="button"
            icon="fa-solid fa-plus"
            label="Add concept"
            data-testid="add-clause-button"
            :severity="hoverAddNode ? 'success' : 'secondary'"
            :outlined="!hoverAddNode"
            :class="!hoverAddNode && 'hover-button'"
            @click="addConcept"
            class="px-2 py-1"
            @mouseover="hoverAddNode = true"
            @mouseout="hoverAddNode = false"
          />
        </div>
        <div v-else>
          <Button disabled class="pointer-events-none invisible" :severity="'secondary'" style="width: 8.5rem; height: 2.3rem; padding: 0" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, computed } from "vue";
import { IM } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { QueryRequest, SearchResultSummary, Node, Where, UIProperty } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters, setConstraintOperator } from "@/helpers/buildQuery";
import {
  plainConstraintOperatorOptions,
  nodeInclusionOptions,
  getPlainConstraintOperatorLabel,
  getPlainConstraintOperatorValue
} from "@/helpers/QueryEditorMethods";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getTypeIcon, getIconColor } from "@/helpers/ConceptTypeVisuals";
import SetService from "@/services/SetService";
import Button from "primevue/button";
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
const loading = ref(false);
const hoverDeleteNode = ref<boolean[]>(Array(property!.value.is!.length).fill(false));
const selected: Ref<SearchResultSummary> = ref({ iri: node.value.iri, name: node.value.name } as SearchResultSummary);
const selectedMember: Ref<Node> = ref({});
const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();
const hoverAddNode = ref(false);
const showAddConcept = ref(false);
onMounted(() => {
  init();
});

function getNodeInclusion(node: Node): string {
  if (node.exclude) return "exclude";
  else return "include";
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
    props.uiProperty.setMemberCount < 11 &&
    props.uiProperty.valueType
  ) {
    const pagedMembers = await SetService.getMembers(props.uiProperty.valueType, false, 1, 11);
  }
}
function updateNodeInclusion(node: Node, val: string) {
  node.exclude = val !== "include";
}

function buildIMQueryForConceptSearch() {
  const coreSchemesAsIris = coreSchemes.value.map(iri => {
    return { iri: iri };
  });
  const searchOptions: SearchOptions = {
    schemes: coreSchemesAsIris,
    status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
    types: [{ iri: IM.CONCEPT }, { iri: IM.CONCEPT_SET }]
  };
  imQueryForConceptSearch.value = buildIMQueryFromFilters(searchOptions);
}

function deleteNode(index: number) {
  property.value.is?.splice(index, 1);
  if (property.value.is?.length === 0) property.value.is = [{} as Node];
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

<style scoped lang="scss">
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
  min-width: 52rem;
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
