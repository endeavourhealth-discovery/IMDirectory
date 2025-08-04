<template>
  <div class="set-container">
    <div class="concept-container">
      <template v-if="setMembers.length === 0">
        <div class="selected-member-container">
          <div class="node-inclusion">
            <Select
              style="width: 8.5rem; min-height: 2.3rem"
              v-model="nodeInclusion"
              :options="nodeInclusionOptions"
              option-label="label"
              option-value="value"
              @change="updateNodeInclusion"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <div>{{ nodeInclusion }}</div>
                </div>
              </template>
              <template #option="slotProps">
                <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
                  <div>{{ slotProps.option.label }}</div>
                </div>
              </template>
            </Select>
          </div>
          <div class="auto-complete-container">
            <AutocompleteSearchBar
              ref="searchBar"
              v-model:selected="selected"
              :im-query="imQueryForConceptSearch"
              :root-entities="[IM.ONTOLOGY_PARENT_FOLDER, IM.CONCEPT_SET_PARENT_FOLDER]"
              @update:selected="updateIsIri"
            />

            <template v-if="searchBar?.searchText && node.name">
              <Button
                v-if="searchBar?.searchText && searchBar.searchText !== node.name"
                label="?"
                class="sync-warning"
                severity="danger"
                v-tooltip="'Revert'"
                @click="searchBar.searchText = node.name!"
              />
            </template>
          </div>
        </div>
      </template>
      <template v-if="setMembers.length > 0">
        <div class="selected-member-container">
          <Select
            style="width: 100rem; min-height: 2.3rem"
            v-model="selectedMember"
            :options="setMembers"
            option-label="name"
            option-value="iri"
            @change="updateWithSetMember"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ selectedMember.name }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
        </div>
      </template>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    </div>
    <div v-if="property.is && property.is.length > 0" v-for="(node, index) in property.is" :key="index" class="concept-container">
      <div class="set-member-container">
        <IMFontAwesomeIcon :icon="getTypeIcon(node)" :style="'color:' + getIconColor(node)" />
        <span v-if="node.qualifier" v-html="node.qualifier"></span>
        <IMViewerLink v-if="node.iri" :iri="node.iri" :label="node.name" :action="'view'" />
        <span v-if="node.parameter">"{{ node.parameter }}" passed into query as a parameter at run time</span>
      </div>
      <Select
        v-if="setMembers.length === 0"
        style="width: 10.5rem; min-height: 2.3rem"
        :disabled="!isConstraintEditable(node)"
        :modelValue="getPlainConstraintOperatorValue(node)"
        :options="plainConstraintOperatorOptions"
        option-label="label"
        option-value="value"
        @update:modelValue="val => setConstraintOperator(node, val)"
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
      <div>
        <Button
          @click.stop="deleteNode(index)"
          :class="!hoverDeleteNode && 'hover-button'"
          :severity="hoverDeleteNode ? 'danger' : 'secondary'"
          :outlined="!hoverDeleteNode"
          icon="fa-solid fa-trash"
          @mouseover="hoverDeleteNode = true"
          @mouseout="hoverDeleteNode = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, computed } from "vue";
import { IM } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { QueryRequest, SearchResultSummary, Node, Where, Pageable } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { SearchOptions } from "@/interfaces";
import { buildIMQueryFromFilters, setConstraintOperator } from "@/composables/buildQuery";
import {
  plainConstraintOperatorOptions,
  nodeInclusionOptions,
  getPlainConstraintOperatorLabel,
  getPlainConstraintOperatorValue
} from "@/helpers/QueryEditorOptions";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getTypeIcon, getIconColor } from "@/helpers/ConceptTypeVisuals";
import { UIProperty } from "@/interfaces";
import SetService from "@/services/SetService";
import Button from "primevue/button";
interface Props {
  parent?: any;
  uiProperty: UIProperty;
}
const props = defineProps<Props>();
const searchBar = ref<{ searchText: string } | null>(null);
const property = defineModel<Where>("property", { default: {} });
const node: Ref<Node> = ref({} as Node);
const nodeInclusion: Ref<string> = ref("Include");
const filterStore = useFilterStore();
const coreSchemes = computed(() => filterStore.coreSchemes);
const loading = ref(false);
const hoverDeleteNode = ref(false);
const selected: Ref<SearchResultSummary> = ref({ iri: node.value.iri, name: node.value.name } as SearchResultSummary);
const selectedMember: Ref<Node> = ref({});
const imQueryForConceptSearch: Ref<QueryRequest | undefined> = ref();
const setMembers: Ref<Node[]> = ref([]);

onMounted(() => {
  init();
});

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
  if (props.uiProperty && props.uiProperty.setMemberCount > 0 && props.uiProperty.setMemberCount < 11) {
    const pagedMembers = await SetService.getMembers(props.uiProperty.valueType, false, 1, 11);
    if (pagedMembers.result) setMembers.value = pagedMembers.result;
  }
}
function updateNodeInclusion(e: { value: string }) {
  node.value.exclude = e.value !== "include";
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
}

function updateIsIri() {
  if (selected.value) {
    node.value.iri = selected.value.iri;
    node.value.name = selected.value.name;
    node.value.type = selected.value.type[0].iri;
    setConstraintOperator(node.value, node.value.type === IM.CONCEPT ? "descendantsOrSelfOf" : "memberOf");
    if (!property.value.is) property.value.is = [];
    property.value.is.push(node.value);
    node.value = {};
    selected.value = {} as SearchResultSummary;
  }
}

function updateWithSetMember() {
  if (selectedMember.value && setMembers.value.length > 0) {
    const selectedNode = setMembers.value.find(node => node.iri! === selectedMember.value);
    if (selectedNode) {
      node.value = selectedNode;
      if (!property.value.is) property.value.is = [];
      property.value.is.push(node.value);
      node.value = {};
      selected.value = {} as SearchResultSummary;
    }
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
  min-width: 104rem;
}

.sync-warning {
  color: var(--p-black-500) !important;
}
.set-member-container {
  min-width: 100rem;
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
  min-width: 100rem;
}
.selected-member-container {
  display: flex;
  flex-flow: row nowrap;
  min-width: 110rem;
}
</style>
