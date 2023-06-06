<template>
  <div class="feature" v-for="(match, index) of matches">
    <div :class="isSelected(match) ? 'selected' : ''" @click="select($event, match)" @contextmenu="onRightClick($event, match)">
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch!)"></span>
      <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
      <span v-if="match.description" v-html="match.description"> </span>
      <span v-if="!index && match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryEdit
          v-if="match.match"
          :base-entity-iri="baseEntityIri"
          :include="true"
          :matches="match.match"
          :parent-match="match"
          :full-query="fullQuery"
          :selectedMatches="selectedMatches"
        />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <span v-if="match.where!.length == 1">
          <span v-if="hasNodeRef(match.where![0])" v-html="match.where![0].description"></span>
          <span v-else-if="hasBigList(match.where![0])" v-html="match.where![0].description"></span>
          <span v-else v-html="match.where![0].description"></span>
          <span v-if="isArrayHasLength(match.where![0].where)">
            <RecursiveWhereEdit :wheres="match.where![0].where!" :parent-match="parentMatch" :parent-where="match.where![0]" :full-query="fullQuery" />
          </span>
        </span>

        <RecursiveWhereEdit v-else :wheres="match.where!" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
      <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
    </div>
  </div>
  <Dialog v-model:visible="editDialog" modal header="Header" :style="{ width: '75vw' }">
    <EditDialog v-if="isArrayHasLength(selectedMatches)" :base-entity-iri="baseEntityIri" :match="selectedMatches[0]" @on-close="onEditDialogClose" />
  </Dialog>
  <ContextMenu ref="rClickMenu" :model="props.selectedMatches.length > 1 ? rClickItemsGroup : rClickItems" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import RecursiveWhereEdit from "./RecursiveWhereEdit.vue";
import EditDialog from "./EditDialog.vue";
import { MenuItem } from "primevue/menuitem";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  matches: Match[];
  selectedMatches: Match[];
  baseEntityIri?: string;
}

enum Direction {
  ABOVE,
  BELOW
}

const props = defineProps<Props>();
const editDialog: Ref<boolean> = ref(false);
const rClickItems: Ref<MenuItem[]> = ref([
  {
    label: "Add",
    icon: "pi pi-fw pi-plus",
    items: [
      {
        label: "Above",
        command: () => {
          add(Direction.ABOVE);
          edit();
        }
      },
      {
        label: "Below",
        command: () => {
          add(Direction.BELOW);
          edit();
        }
      }
    ]
  },
  {
    label: "Edit",
    icon: "pi pi-fw pi-pencil",
    command: () => {
      edit();
    }
  },
  { label: "Delete", icon: "pi pi-fw pi-trash" }
]);

const rClickItemsGroup = ref([
  { label: "Group", icon: "pi pi-fw pi-trash" },
  { label: "Delete", icon: "pi pi-fw pi-trash" }
]);

const rClickMenu = ref();

function onEditDialogClose() {
  if (!isObjectHasKeys(props.selectedMatches[0])) {
    const index = props.matches.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
    if (index !== -1) props.matches.splice(index, 1);
    props.selectedMatches.splice(0, 1);
  }
  editDialog.value = false;
}

function add(direction: Direction) {
  const index = props.matches.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
  if (index >= 1 || (index === 0 && direction !== Direction.ABOVE)) {
    let indexToAdd = 0;
    if (direction === Direction.ABOVE) indexToAdd = index;
    if (direction === Direction.BELOW) indexToAdd = index + 1;
    if (indexToAdd) {
      const newMatch = {} as Match;
      props.matches.splice(indexToAdd, 0, newMatch);
      singleselect(newMatch);
    }
  }
}

function edit() {
  editDialog.value = true;
}

function onRightClick(event: any, match: Match) {
  if (!isSelected(match) || props.selectedMatches.length <= 1) singleselect(match);
  rClickMenu.value.show(event);
}

function select(event: any, match: Match) {
  if (event.ctrlKey) {
    multiselect(match);
  } else {
    singleselect(match);
    edit();
  }
}

function singleselect(match: Match) {
  props.selectedMatches.length = 0;
  props.selectedMatches.push(match);
}

function multiselect(match: Match) {
  if (isSelected(match)) {
    const toAddList = props.selectedMatches.filter(selected => JSON.stringify(selected) !== JSON.stringify(match));
    props.selectedMatches.length = 0;
    for (const toAddItem of toAddList) {
      props.selectedMatches.push(toAddItem);
    }
  } else props.selectedMatches.push(match);
}

function isSelected(match: Match) {
  return !!props.selectedMatches.find(selected => JSON.stringify(selected) === JSON.stringify(match));
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}
</script>

<style scoped>
.feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
  cursor: pointer;
}

.feature:hover {
  background-color: var(--highlight-bg);
}

.selected {
  background-color: var(--highlight-bg);
  color: var(--text-color);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}
</style>
