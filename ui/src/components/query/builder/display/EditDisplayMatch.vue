<template>
  <div class="feature" @contextmenu="onRightClick($event, match)">
    <div v-if="editMode">
      <EntitySelect :edit-node="match" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMode = true"></div>

    <EditDisplayMatch
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :index="index"
      :parent-match="match"
      :match="nestedMatch"
      :query-type-iri="queryTypeIri"
    />

    <EditDisplayWhere
      v-if="isArrayHasLength(match.where)"
      v-for="(where, index) of match.where"
      :index="index"
      :parent-match="match"
      :where="where"
      :query-type-iri="queryTypeIri"
    />

    <div v-if="isArrayHasLength(match.path)" v-for="(path, index) of match.path">
      <EditDisplayMatch v-if="isObjectHasKeys(path, ['match'])" :index="index" :parent-path="path" :match="path.match!" :query-type-iri="queryTypeIri" />
    </div>
  </div>

  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
  <JSONViewerDialog v-model:showDialog="showViewDialog" :data="match" />
  <AddPropertyDialog v-model:showDialog="showAddDialog" :match="match" :base-type="queryTypeIri" />
  <KeepAsDialog v-model:showDialog="showKeepAsDialog" :match="match" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Path, Where } from "@im-library/interfaces/AutoGen";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import EditDisplayWhere from "./EditDisplayWhere.vue";
import { Ref, ref } from "vue";
import EntitySelect from "../edit/EntitySelect.vue";
import { MenuItem } from "primevue/menuitem";
import { PrimeIcons } from "primevue/api";
import JSONViewerDialog from "@/components/shared/dialogs/JSONViewerDialog.vue";
import AddPropertyDialog from "../edit/AddPropertyDialog.vue";
import setupQueryBuilderActions from "@/composables/setupQueryBuilderActions";
import KeepAsDialog from "../edit/KeepAsDialog.vue";

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentMatchList?: Match[];
  parentPath?: Path;
  match: Match;
  index: number;
}

const props = defineProps<Props>();

const { add, view, keepAs, moveUp, moveDown, remove, showAddDialog, showViewDialog, showKeepAsDialog } = setupQueryBuilderActions();
const editMode: Ref<boolean> = ref(false);
const rClickMenu = ref();
const rClickOptions: Ref<MenuItem[]> = ref([]);

const listToAddTo: Ref<Match[]> = ref([]);

function onRightClick(event: any, match: Match) {
  // select(event, match);
  rClickOptions.value = getSingleRCOptions();
  rClickMenu.value.show(event);
}

function getSingleRCOptions() {
  return [
    {
      label: "Add",
      icon: PrimeIcons.PLUS,
      items: [
        {
          label: "Below",
          command: () => {
            addBelow();
          }
        },
        {
          label: "Nested",
          command: () => {
            addNested();
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
    //   {
    //     label: "Group",
    //     icon: "pi pi-fw pi-link",
    //     command: () => {
    //       group();
    //     }
    //   },
    // {
    //   label: "Ungroup",
    //   icon: "pi pi-fw pi-eject",
    //   command: () => {
    //     ungroup();
    //   }
    // }
  ];
}

function addBelow() {
  if (props.parentMatch) {
    add(props.parentMatch.match!);
  } else if (isArrayHasLength(props.parentMatchList)) {
    add(props.parentMatchList!);
  }
}

function addNested() {
  if (!isArrayHasLength(props.match)) props.match.match = [];
  add(props.match.match!);
}

function toggleBoolMatch() {
  if (props.match.boolMatch === "and") props.match.boolMatch = "or";
  else if (props.match.boolMatch === "or") props.match.boolMatch = "and";
}
</script>

<style scoped></style>
