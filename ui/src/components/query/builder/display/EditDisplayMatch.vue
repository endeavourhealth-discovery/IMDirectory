<template>
  <div
    :draggable="false"
    @dragstart="dragStart($event, match)"
    @dragenter="dragEnter($event, match, htmlId)"
    @dragleave="dragLeave(htmlId)"
    @dragover="$event.preventDefault()"
    @drop="dragDrop($event, props.parentMatch!, props.parentMatchList!, htmlId)"
    :class="getClass()"
    @click="select($event, isSelected, selectedMatches, match, index, parentMatch, parentMatchList)"
    @contextmenu="onRightClick($event)"
    :id="htmlId"
  >
    <div v-if="editMode">
      <MatchEntitySelect
        :edit-node="match"
        :exclude-entailment="true"
        :validation-query-request="validationQueryRequest"
        @on-cancel="editMode = false"
        @on-save="saveSelect"
      />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMatch()"></div>
    <div v-if="match.nodeRef" class="node-ref" v-html="getDisplayFromNodeRef(match.nodeRef)" @dblclick="editMatch()"></div>
    <EditDisplayMatch
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :index="index"
      :parent-match="match"
      :match="nestedMatch"
      :parent-data-model-iri="currentDataModelIri"
    />

    <EditDisplayProperty
      v-if="isArrayHasLength(match.where)"
      v-for="(property, index) of match.where"
      :index="index"
      :parent-match="match"
      :property="property"
      :data-model-iri="currentDataModelIri"
    />
    <EditDisplayOrderBy v-if="match.orderBy" :match="match" :order-by="match.orderBy" :on-add-order-by="onAddOrderBy" />
    <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
    <div v-if="isObjectHasKeys(match, ['then'])">
      <EditDisplayMatch :index="index" :parent-match="match" :match="match.then!" :isThenMatch="true" :parent-data-model-iri="currentDataModelIri" />
    </div>
  </div>

  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
  <JSONViewerDialog v-model:showDialog="showViewDialog" :data="match" @save="onSaveJson" />
  <AddPropertyDialog
    v-model:showDialog="showUpdateDialog"
    :header="'Refine feature'"
    :show-variable-options="false"
    :match-type="currentDataModelIri"
    :match="match"
    @on-save="(direct: Match[], nested: Match[]) => updateProperties(match, direct, nested)"
  />

  <AddPropertyDialog
    v-model:showDialog="showAddTestFeatureDialog"
    :header="'Test feature'"
    :show-variable-options="true"
    :match-type="currentDataModelIri"
    @on-save="(direct: Match[], nested: Match[]) => addThenMatch(match, direct.concat(nested))"
  />

  <AddPropertyDialog
    v-model:showDialog="showBuildFeatureAfterDialog"
    :header="'Build new feature'"
    :show-variable-options="true"
    :match-type="currentDataModelIri"
    @on-save="(direct: Match[], nested: Match[]) => addMatchesToList(parentMatchList!, direct.concat(nested), index, false)"
  />

  <AddFeatureDialog
    v-model:show-dialog="showAddFeatureAfterDialog"
    :validation-query-request="validationQueryRequest"
    @on-feature-select="(matchToAdd: Match) => addMatchesToList(parentMatchList!, [matchToAdd], index, false)"
  />

  <DirectorySearchDialog
    v-model:show-dialog="showAddPopulationAfterDirectoryDialog"
    @update:selected="onSelect"
    :searchByQuery="validationQueryRequest"
    :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
  />

  <SaveFeatureDialog v-model:show-dialog="showSaveFeatureDialog" :feature="match" />

  <KeepAsDialog
    v-model:showDialog="showKeepAsDialog"
    :match="match"
    @add-variable="(previousValue: string, newValue: string) => addVariable(previousValue, newValue)"
  />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Bool, Match, Node, OrderDirection, OrderLimit, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import EditDisplayProperty from "./EditDisplayProperty.vue";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import JSONViewerDialog from "@/components/shared/dialogs/JSONViewerDialog.vue";
import setupQueryBuilderActions from "@/composables/setupQueryBuilderActions";
import AddPropertyDialog from "../edit/dialogs/AddPropertyDialog.vue";
import KeepAsDialog from "../edit/dialogs/KeepAsDialog.vue";
import { SelectedMatch } from "@im-library/interfaces";
import { getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import EditDisplayOrderBy from "./EditDisplayOrderBy.vue";
import { useUserStore } from "@/stores/userStore";
import { useQueryStore } from "@/stores/queryStore";
import { cloneDeep } from "lodash";
import MatchEntitySelect from "../edit/MatchEntitySelect.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { buildInSetMatchFromCS } from "@im-library/helpers/QueryBuilder";
import { IM } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";
import AddFeatureDialog from "../edit/dialogs/AddFeatureDialog.vue";
import SaveFeatureDialog from "../edit/dialogs/SaveFeatureDialog.vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

interface Props {
  parentMatch?: Match;
  parentMatchList?: Match[];
  match: Match;
  index: number;
  isThenMatch?: boolean;
  parentDataModelIri: string;
}

const props = defineProps<Props>();
const userStore = useUserStore();
const queryStore = useQueryStore();
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const validationQueryRequest: ComputedRef<QueryRequest> = computed(() => queryStore.$state.validationQueryRequest);
const selectedMatches: ComputedRef<SelectedMatch[]> = computed(() => queryStore.$state.selectedMatches);
const variableMap: ComputedRef<Map<string, any>> = computed(() => queryStore.$state.variableMap);
const currentDataModelIri: Ref<string> = ref("");
const { copyObjectToClipboard } = setupCopyToClipboard();

const {
  addThenMatch,
  updateProperties,
  addMatchesToList,
  view,
  keepAs,
  moveUp,
  moveDown,
  remove,
  group,
  ungroup,
  dragStart,
  dragEnter,
  dragDrop,
  dragLeave,
  select,
  showUpdateDialog,
  showViewDialog,
  showKeepAsDialog,
  showBuildFeatureAfterDialog,
  showAddFeatureAfterDialog,
  showAddTestFeatureDialog,
  showAddPopulationAfterDirectoryDialog,
  showSaveFeatureDialog
} = setupQueryBuilderActions();
const toast = useToast();
const editMode: Ref<boolean> = ref(false);
const isSelected: ComputedRef<boolean> = computed(() => {
  const found = selectedMatches.value.find(selectedMatch => selectedMatch.selected["@id"] === props.match["@id"]);
  return !!found;
});

const hasValue: ComputedRef<boolean> = computed(() => {
  return isObjectHasKeys(props.match, ["is"]) || isObjectHasKeys(props.match, ["typeOf"]) || isObjectHasKeys(props.match, ["instanceOf"]);
});

const hasProperty: ComputedRef<boolean> = computed(() => {
  return isObjectHasKeys(props.match, ["property"]);
});

const isDataModel: ComputedRef<boolean> = computed(() => {
  if (isObjectHasKeys(props.match, ["typeOf"])) return true;
  if (props.match.nodeRef && variableMap.value.has(props.match.nodeRef)) {
    const node = variableMap.value.get(props.match.nodeRef);
    return isObjectHasKeys(node, ["typeOf"]);
  }
  return false;
});

const htmlId = ref("");
const rClickMenu = ref();
const rClickOptions: Ref<any[]> = ref([]);
const onAddOrderBy: Ref<boolean> = ref(false);

watch(
  () => userStore.currentTheme,
  () => {
    getStyle();
  }
);

watch(
  () => cloneDeep(props.match),
  () => {
    if (!isArrayHasLength(props.match.where) && !isArrayHasLength(props.match.match) && !hasValue.value) {
      remove(props.index, props.parentMatch?.match ?? props.parentMatchList!, props.parentMatch!);
    }
  }
);

onMounted(() => {
  htmlId.value = String(Math.random());
  getStyle();
  currentDataModelIri.value = getMatchType();
});

function getMatchType() {
  if (props.isThenMatch && isObjectHasKeys(props.parentMatch, ["typeOf"])) {
    return props.parentMatch!.typeOf!["@id"];
  }
  if (isObjectHasKeys(props.match, ["nodeRef"])) {
    return variableMap.value.get(props.match.nodeRef!).typeOf["@id"];
  } else if (isObjectHasKeys(props.match.typeOf, ["@id"])) return props.match.typeOf!["@id"];

  return props.parentDataModelIri ?? queryStore.returnType;
}

function onSelect(cs: SearchResultSummary, before?: boolean) {
  const newMatch = buildInSetMatchFromCS(cs) as Match;
  addMatchesToList(props.parentMatchList!, [newMatch], props.index, before);
  showAddPopulationAfterDirectoryDialog.value = false;
}

function onSaveJson(updatedMatch: Match) {
  for (const property of Object.keys(props.match)) {
    delete (props.match as any)[property];
  }
  for (const property of Object.keys(updatedMatch)) {
    (props.match as any)[property] = (updatedMatch as any)[property];
  }
}

function getClass() {
  let clazz = "";
  if (isSelected.value) clazz += "selected";
  if (props.match.description || props.match.nodeRef) clazz += " feature";
  return clazz;
}

function saveSelect(property: "typeOf" | "instanceOf" | "is", selectedCSs: Node[], selectedCS: SearchResultSummary) {
  if (isObjectHasKeys(props.match, ["is"])) delete props.match.is;
  if (isObjectHasKeys(props.match, ["instanceOf"])) delete props.match.instanceOf;
  if (isObjectHasKeys(props.match, ["typeOf"])) delete props.match.typeOf;

  switch (property) {
    case "is":
      props.match.is = [...selectedCSs];
      break;
    case "typeOf":
      props.match.typeOf = { "@id": selectedCS.iri, name: selectedCS.name };
      break;
    case "instanceOf":
      props.match.instanceOf = { "@id": selectedCS.iri, name: selectedCS.name };
      break;

    default:
      break;
  }

  editMode.value = false;
}

function toggleBoolMatch() {
  if (props.match.bool === "and") props.match.bool = Bool.or;
  else if (props.match.bool === "or") props.match.bool = Bool.and;
}

function toggleExclude() {
  props.match.exclude = !props.match.exclude;
}

function onRightClick(event: any) {
  if (!isArrayHasLength(selectedMatches.value) || selectedMatches.value.length === 1)
    select(event, isSelected.value, selectedMatches.value, props.match, props.index, props.parentMatch, props.parentMatchList);
  rClickOptions.value = isArrayHasLength(selectedMatches.value) && selectedMatches.value.length === 1 ? getSingleRCOptions() : getMultipleRCOptions();
  rClickMenu.value.show(event);
}

function getMultipleRCOptions() {
  const multipleRCOptions = [
    {
      label: "Group",
      icon: "fa-solid fa-object-group",
      command: () => {
        group(selectedMatches.value, props.parentMatch?.match, props.parentMatch?.match ?? props.parentMatchList!);
      }
    },
    {
      label: "Delete",
      icon: "fa-solid fa-trash",
      command: () => {
        deleteSelected();
      }
    }
  ];
  return multipleRCOptions;
}

function getSingleRCOptions() {
  const singleRCOptions = [
    {
      label: "Build new feature",
      icon: "fa-solid fa-hammer",
      command: () => {
        showBuildFeatureAfterDialog.value = true;
      }
    },
    {
      label: "Add existing feature",
      icon: "fa-solid fa-circle-plus",
      command: () => {
        showAddFeatureAfterDialog.value = true;
      }
    },
    {
      label: "Add population",
      icon: "fa-solid fa-magnifying-glass",
      command: () => {
        showAddPopulationAfterDirectoryDialog.value = true;
      }
    },
    {
      label: props.match.exclude ? "Include" : "Exclude",
      icon: props.match.exclude ? "fa-solid fa-square-plus" : "fa-solid fa-square-minus",
      command: () => {
        toggleExclude();
      }
    },
    {
      label: "Change bool logic",
      icon: "fa-solid fa-arrows-up-down",
      command: () => {
        toggleBoolMatch();
      }
    },
    {
      label: "Label as a variable",
      icon: "fa-solid fa-tag",
      command: () => {
        keepAs();
      }
    },
    {
      label: "earliest/latest highest/lowest",
      icon: "fa-solid fa-arrow-up-wide-short",
      command: () => {
        addOrderBy();
      }
    },
    {
      label: "Test feature",
      icon: "fa-solid fa-flask",
      command: () => {
        showAddTestFeatureDialog.value = true;
      }
    },
    {
      label: "Move feature",
      icon: "fa-solid fa-sort",
      items: [
        {
          label: "Up",
          command: () => {
            moveUp(props.index, props.parentMatch?.match ?? props.parentMatchList!);
          }
        },
        {
          label: "Down",
          command: () => {
            moveDown(props.index, props.parentMatch?.match ?? props.parentMatchList!);
          }
        }
      ]
    },
    {
      label: "View JSON",
      icon: "fa-solid fa-eye",
      command: () => {
        view();
      }
    },
    {
      label: "Save feature",
      icon: "fa-solid fa-floppy-disk",
      command: () => {
        showSaveFeatureDialog.value = true;
      }
    },
    {
      label: "Copy feature",
      icon: "fa-solid fa-copy",
      command: () => {
        copyObjectToClipboard(navigator, { queryTypeIri: queryTypeIri.value, match: props.match });
      }
    },
    {
      label: "Delete feature",
      icon: "fa-solid fa-trash",
      command: () => {
        remove(props.index, props.parentMatch?.match ?? props.parentMatchList!, props.parentMatch!);
      }
    }
  ];

  if (hasValue.value || hasProperty.value || isDataModel.value) {
    const updatePropertiesOption = {
      label: "Refine feature",
      icon: "fa-solid fa-pen-to-square",
      command: () => {
        editMatch();
      }
    };

    const updateValueOption = {
      label: "Refine population",
      icon: "fa-solid fa-pen-to-square",
      command: () => {
        editMatch();
      }
    };

    if (isDataModel.value || hasProperty.value) singleRCOptions.splice(0, 0, updatePropertiesOption);
    else if (hasValue.value) singleRCOptions.splice(0, 0, updateValueOption);
  }

  if (isObjectHasKeys(props.match, ["match"]) && isArrayHasLength(props.match.match))
    singleRCOptions.push({
      label: "Ungroup",
      icon: "fa-solid fa-object-ungroup",
      command: () => {
        ungroup(props.index, selectedMatches.value, props.parentMatch!, props.parentMatch?.match ?? props.parentMatchList!);
      }
    });

  return singleRCOptions;
}

function editMatch() {
  if (hasValue.value && !isDataModel.value) editMode.value = true;
  else if (isDataModel.value || hasProperty.value) {
    showUpdateDialog.value = true;
  }
}

function addVariable(previousValue: string, newValue: string) {
  props.match.variable = newValue;
  if (variableMap.value.has(previousValue)) variableMap.value.delete(previousValue);
  variableMap.value.set(newValue, props.match);
}

function deleteSelected() {
  const reverseSorted = selectedMatches.value.sort((a, b) => b.index - a.index);
  for (const selectedMatch of reverseSorted) {
    remove(selectedMatch.index, selectedMatch.parentList!, selectedMatch.parent!);
  }
  queryStore.clearSelectedMatches();
}

function addOrderBy() {
  if (!props.match.orderBy) props.match.orderBy = { property: {} };
  if (!isArrayHasLength(props.match?.orderBy?.property)) props.match!.orderBy!.property = {};
  onAddOrderBy.value = true;
}

function getStyle() {
  let highlightColor = window.getComputedStyle(document.documentElement).getPropertyValue("--highlight-bg");
  const opacity = "33";
  if (highlightColor.length < 8 && highlightColor.charAt(0) === "#") {
    highlightColor = highlightColor + opacity;
  }
  document.documentElement.style.setProperty("--highlight-bg-computed", highlightColor);
}
</script>

<style scoped>
#htmlId {
  --highlight-bg-computed: var(--highlight-bg);
}
.feature {
  margin: 0.25rem;
  margin-left: 1rem !important;
  padding: 0.1rem;
  cursor: pointer;
}

.feature.over {
  border: 3px dotted #666 !important;
}

.node-ref {
  margin-left: 0.5rem !important;
}

.feature:hover {
  background-color: var(--highlight-bg-computed);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}

.selected {
  border: 1px dotted;
  background-color: var(--highlight-bg-computed);
  color: var(--text-color);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}

.p-dialog-content {
  height: 100% !important;
}

.list-item {
  margin-top: 0;
  padding-left: 1rem;
}
</style>
