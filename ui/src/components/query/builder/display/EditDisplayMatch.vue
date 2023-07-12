<template>
  <div
    :draggable="true"
    @dragstart="dragStart($event, match)"
    @dragenter="dragEnter($event, match)"
    @dragover.prevent
    @drop="dragDrop($event, allowDrop)"
    :class="getClass()"
    @click="select($event, isSelected, selectedMatches, match, index, parentMatch, parentMatchList)"
    @contextmenu="onRightClick($event)"
  >
    <div v-if="editMode">
      <EntitySelect :edit-node="match" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" @on-save="saveSelect" />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMatch()"></div>
    <div v-if="match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></div>
    <EditDisplayMatch
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :index="index"
      :parent-match="match"
      :match="nestedMatch"
      :query-type-iri="queryTypeIri"
      :selected-matches="selectedMatches"
    />

    <EditDisplayProperty
      v-if="isArrayHasLength(match.property)"
      v-for="(property, index) of match.property"
      :index="index"
      :parent-match="match"
      :property="property"
      :query-type-iri="queryTypeIri"
      :selected-matches="selectedMatches"
    />
    <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
    <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
  </div>

  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
  <JSONViewerDialog v-model:showDialog="showViewDialog" :data="match" />
  <AddPropertyDialog
    v-model:showDialog="showAddDialog"
    :base-type="match['@type'] ?? queryTypeIri"
    :properties="match.property"
    @on-add-property="(updatedMatch: Match) => hasValue && hasProperty ? updateProperties(match, updatedMatch) : add((parentMatch?.match ?? parentMatchList)!, match, index)"
  />
  <KeepAsDialog v-model:showDialog="showKeepAsDialog" :match="match" />
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
import { describeMatch, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentMatchList?: Match[];
  selectedMatches: SelectedMatch[];
  match: Match;
  index: number;
}

const props = defineProps<Props>();

const { add, updateProperties, view, keepAs, moveUp, moveDown, remove, group, ungroup, select, showAddDialog, showViewDialog, showKeepAsDialog } =
  setupQueryBuilderActions();
const editMode: Ref<boolean> = ref(false);
const allowDrop: Ref<boolean> = ref(true);
const dragged: Ref<any> = ref({ match: [] as Match[] } as Match);
const draggedParent: Ref<any> = ref({ match: [] as Match[] } as Match);
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

function dragStart(event: any, data: any) {
  dragged.value = data;
  event.dataTransfer.setData("matchData", JSON.stringify(data));
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.dropEffect = "move";
}

function dragEnter(event: any, data: any) {
  if (dragged.value !== data) {
    draggedParent.value = data;
    allowDrop.value = true;
  } else {
    allowDrop.value = false;
  }
}

async function dragDrop(event: any, allow: boolean) {
  const data = event.dataTransfer.getData("matchData");
  if (!allow) {
    event.preventDefault();
  } else if (data && draggedParent.value && allow) {
    if (draggedParent.value.match === undefined) draggedParent.value.match = [];
    const parsedMatchData = JSON.parse(data);
    draggedParent.value.match.push(parsedMatchData);
    const list = props.parentMatch?.match ?? props.parentMatchList!;
    const foundIndex = list.findIndex(match => JSON.stringify(match) === JSON.stringify(parsedMatchData));
    if (foundIndex !== -1) {
      list.splice(foundIndex, 1);
    }
    draggedParent.value = {};
  }
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
        group(props.selectedMatches, props.parentMatch!, props.parentMatch?.match ?? props.parentMatchList!);
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
          label: "Below",
          command: () => {
            showAddDialog.value = true;
          }
        },
        {
          label: "Nested",
          command: () => {}
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

  if (isObjectHasKeys(props.match, ["@id"]) || isObjectHasKeys(props.match, ["@set"]) || isObjectHasKeys(props.match, ["@type"]))
    singleRCOptions.splice(1, 0, {
      label: "Edit",
      icon: PrimeIcons.PENCIL,
      command: () => {
        editMatch();
      }
    });

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
  const hasValue = isObjectHasKeys(props.match, ["@id"]) || isObjectHasKeys(props.match, ["@set"]) || isObjectHasKeys(props.match, ["@type"]);
  const hasProperty = isObjectHasKeys(props.match, ["property"]);
  if (hasValue && !hasProperty) editMode.value = true;
  if (hasValue && hasProperty) showAddDialog.value = true;
}
</script>

<style scoped>
.feature {
  margin-left: 1rem !important;
  cursor: pointer;
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
