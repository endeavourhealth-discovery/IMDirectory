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

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentMatchList?: Match[];
  parentPath?: Path;
  match: Match;
  index: number;
}

const props = defineProps<Props>();

const { add, view, showAddDialog, showViewDialog } = setupQueryBuilderActions();
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
      icon: "pi pi-fw pi-plus",
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
      label: "View",
      icon: PrimeIcons.EYE,
      command: () => {
        view();
      }
    }
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

function moveUp(matchIndex: number, matches: Match[]) {
  if (isArrayHasLength(matches) && matchIndex !== 0 && matchIndex !== 1) {
    matches.splice(matchIndex - 1, 0, matches[matchIndex]);
    matches.splice(matchIndex + 1, 1);
  }
}

function moveDown(matchIndex: number, matches: Match[]) {
  if (isArrayHasLength(matches) && matchIndex !== matches.length - 1) {
    matches.splice(matchIndex + 2, 0, matches[matchIndex]);
    matches.splice(matchIndex, 1);
  }
}
</script>

<style scoped></style>
