<template>
  <div
    :draggable="true"
    @dragstart="dragStart($event, match)"
    @dragenter="dragEnter($event, match)"
    @dragover.prevent
    @drop="dragDrop($event, props.parentMatch, props.parentMatchList)"
    :class="getClass()"
    @click="select($event, isSelected, selectedMatches, match, index, parentMatch, parentMatchList)"
    @contextmenu="onRightClick($event)"
  >
    <div v-if="editMode">
      <EntitySelect :edit-node="match" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" @on-save="saveSelect" />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMatch()"></div>
    <div v-if="match.nodeRef" class="node-ref" v-html="getDisplayFromNodeRef(match.nodeRef)"></div>
    <EditDisplayMatch
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :index="index"
      :parent-match="match"
      :match="nestedMatch"
      :query-type-iri="queryTypeIri"
      :selected-matches="selectedMatches"
      :variable-map="variableMap"
    />

    <EditDisplayProperty
      v-if="isArrayHasLength(match.property)"
      v-for="(property, index) of match.property"
      :index="index"
      :parent-match="match"
      :property="property"
      :query-type-iri="queryTypeIri"
      :selected-matches="selectedMatches"
      :variable-map="variableMap"
    />
    <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
    <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
  </div>

  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
  <JSONViewerDialog v-model:showDialog="showViewDialog" :data="match" />
  <AddPropertyDialog
    v-model:showDialog="showAddDialog"
    :base-type="match['@type'] ?? queryTypeIri"
    :match="match"
    :variable-map="variableMap"
    :add-mode="addMode"
    @on-add-or-edit="(direct: Match[], nested: Match[]) => addOrEdit(match, parentMatchList, index, direct, nested)"
  />
  <KeepAsDialog
    v-model:showDialog="showKeepAsDialog"
    :match="match"
    @add-variable="(previousValue: string, newValue: string) => addVariable(previousValue, newValue)"
  />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import EditDisplayProperty from "./EditDisplayProperty.vue";
import { ComputedRef, Ref, computed, ref } from "vue";
import EntitySelect from "../edit/EntitySelect.vue";
import { PrimeIcons } from "primevue/api";
import JSONViewerDialog from "@/components/shared/dialogs/JSONViewerDialog.vue";
import setupQueryBuilderActions from "@/composables/setupQueryBuilderActions";
import AddPropertyDialog from "../edit/dialogs/AddPropertyDialog.vue";
import KeepAsDialog from "../edit/dialogs/KeepAsDialog.vue";
import { ConceptSummary, SelectedMatch } from "@im-library/interfaces";
import { isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentMatchList?: Match[];
  selectedMatches: SelectedMatch[];
  match: Match;
  index: number;
  variableMap: Map<string, any>;
}

const props = defineProps<Props>();

const {
  addOrEdit,
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
  select,
  showAddDialog,
  showViewDialog,
  showKeepAsDialog,
  addMode
} = setupQueryBuilderActions();
const editMode: Ref<boolean> = ref(false);
const isSelected: ComputedRef<boolean> = computed(() => {
  const found = props.selectedMatches.find(selectedMatch => JSON.stringify(selectedMatch.selected) === JSON.stringify(props.match));
  return !!found;
});

const hasValue: ComputedRef<boolean> = computed(() => {
  return isObjectHasKeys(props.match, ["@id"]) || isObjectHasKeys(props.match, ["@set"]) || isObjectHasKeys(props.match, ["@type"]);
});

const hasProperty: ComputedRef<boolean> = computed(() => {
  return isObjectHasKeys(props.match, ["property"]);
});

const rClickMenu = ref();
const rClickOptions: Ref<any[]> = ref([]);

function getClass() {
  let clazz = "";
  if (isSelected.value) clazz += "selected";
  if (props.match.description || props.match.nodeRef) clazz += " feature";
  return clazz;
}

function saveSelect(selectedCS: ConceptSummary) {
  props.match.name = selectedCS.name;
  if (isRecordModel(selectedCS.entityType)) props.match["@type"] = selectedCS.iri;
  if (isValueSet(selectedCS.entityType)) props.match["@set"] = selectedCS.iri;
  else props.match["@id"] = selectedCS.iri;
  editMode.value = false;
}

function toggleBoolMatch() {
  if (props.match.bool === "and") props.match.bool = "or";
  else if (props.match.bool === "or") props.match.bool = "and";
}

function onRightClick(event: any) {
  if (!isArrayHasLength(props.selectedMatches) || props.selectedMatches.length === 1)
    select(event, isSelected.value, props.selectedMatches, props.match, props.index, props.parentMatch, props.parentMatchList);
  rClickOptions.value = isArrayHasLength(props.selectedMatches) && props.selectedMatches.length === 1 ? getSingleRCOptions() : getMultipleRCOptions();
  rClickMenu.value.show(event);
}

function getMultipleRCOptions() {
  const multipleRCOptions = [
    {
      label: "Group",
      icon: PrimeIcons.LINK,
      command: () => {
        group(props.selectedMatches, props.parentMatch?.match, props.parentMatch?.match ?? props.parentMatchList!);
      }
    },
    {
      label: "Delete",
      icon: PrimeIcons.TRASH,
      command: () => {
        remove(props.index, props.parentMatch?.match ?? props.parentMatchList!);
      }
    }
  ];
  return multipleRCOptions;
}

function getSingleRCOptions() {
  const singleRCOptions = [
    {
      label: "Add",
      icon: PrimeIcons.PLUS,
      items: [
        {
          label: "Before",
          command: () => {
            addMode.value = "addBefore";
            showAddDialog.value = true;
          }
        },
        {
          label: "After",
          command: () => {
            addMode.value = "addAfter";
            showAddDialog.value = true;
          }
        }
      ]
    },
    {
      label: "Toggle bool",
      icon: PrimeIcons.ARROW_V,
      command: () => {
        toggleBoolMatch();
      }
    },
    {
      label: "Keep as",
      icon: PrimeIcons.SAVE,
      command: () => {
        keepAs();
      }
    },
    {
      label: "Move",
      icon: PrimeIcons.SORT,
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
      label: "View",
      icon: PrimeIcons.EYE,
      command: () => {
        view();
      }
    },
    {
      label: "Delete",
      icon: PrimeIcons.TRASH,
      command: () => {
        remove(props.index, props.parentMatch?.match ?? props.parentMatchList!);
      }
    }
  ];

  if (hasValue.value || hasProperty.value) {
    const editOption = {
      label: "Edit",
      icon: PrimeIcons.PENCIL,
      command: () => {
        addMode.value = "editProperty";
        editMatch();
      }
    };

    if (isObjectHasKeys(props.match, ["@type"]) && hasProperty.value) singleRCOptions.splice(0, 1, editOption);
    else if (hasValue.value) singleRCOptions.splice(1, 0, editOption);
  }

  if (isObjectHasKeys(props.match, ["match"]) && isArrayHasLength(props.match.match))
    singleRCOptions.push({
      label: "Ungroup",
      icon: PrimeIcons.EJECT,
      command: () => {
        ungroup(props.index, props.selectedMatches, props.parentMatch!, props.parentMatch?.match ?? props.parentMatchList!);
      }
    });

  return singleRCOptions;
}

function editMatch() {
  if (hasValue.value && !hasProperty.value) editMode.value = true;
  else if (hasValue.value && hasProperty.value) {
    showAddDialog.value = true;
    addMode.value = "editProperty";
  }
}

function addVariable(previousValue: string, newValue: string) {
  props.match.variable = newValue;
  if (props.variableMap.has(previousValue)) props.variableMap.delete(previousValue);
  props.variableMap.set(newValue, props.match);
}
</script>

<style scoped>
.feature {
  margin-left: 1rem !important;
  cursor: pointer;
}

.node-ref {
  margin-left: 0.5rem !important;
}

.feature:hover {
  background-color: var(--highlight-bg);
}

.selected {
  border: 1px dotted;
  background-color: var(--highlight-bg);
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
