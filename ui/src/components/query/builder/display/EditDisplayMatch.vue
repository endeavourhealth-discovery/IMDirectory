<template>
  <div
    :class="isSelected ? 'selected feature' : 'feature'"
    @click="select($event, isSelected, selectedMatches, match, index, parentMatch, parentMatchList)"
    @contextmenu="onRightClick($event)"
  >
    <div v-if="editMode">
      <EntitySelect :edit-node="match" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" @on-save="saveSelect" />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMode = true"></div>

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
    />
  </div>

  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
  <JSONViewerDialog v-model:showDialog="showViewDialog" :data="match" />
  <AddPropertyDialog
    v-model:showDialog="showAddDialog"
    :base-type="queryTypeIri"
    @on-add-property="(match: Match) => add((parentMatch?.match ?? parentMatchList)!, match, index)"
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
import { describeMatch } from "@im-library/helpers/QueryDescriptor";

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentMatchList?: Match[];
  selectedMatches: SelectedMatch[];
  match: Match;
  index: number;
}

const props = defineProps<Props>();

const { add, view, keepAs, moveUp, moveDown, remove, group, ungroup, select, showAddDialog, showViewDialog, showKeepAsDialog } = setupQueryBuilderActions();
const editMode: Ref<boolean> = ref(false);
const isSelected: ComputedRef<boolean> = computed(() => {
  const found = props.selectedMatches.find(selectedMatch => JSON.stringify(selectedMatch.selected) === JSON.stringify(props.match));
  return !!found;
});

const rClickMenu = ref();
const rClickOptions: Ref<any[]> = ref([]);

function saveSelect(selectedCS: ConceptSummary) {
  props.match.name = selectedCS.name;
  if (isRecordModel(selectedCS.entityType)) props.match["@type"] = selectedCS.iri;
  if (isValueSet(selectedCS.entityType)) props.match["@set"] = selectedCS.iri;
  else props.match["@id"] = selectedCS.iri;
  // describeMatch([props.match]);
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
        if (isObjectHasKeys(props.match, ["@id"]) || isObjectHasKeys(props.match, ["@set"]) || isObjectHasKeys(props.match, ["@type"])) editMode.value = true;
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
</script>

<style scoped>
.feature {
  margin-left: 1rem;
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
