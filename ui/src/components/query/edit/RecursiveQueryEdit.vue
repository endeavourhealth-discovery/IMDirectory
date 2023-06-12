<template>
  <div v-if="isArrayHasLength(matches)" class="feature" v-for="(match, index) of matches">
    <RecursiveQueryEditDisplay
      :selected-matches="selectedMatches"
      :parent-match="parentMatch"
      :base-entity-match="baseEntityMatch"
      :index="index"
      :match="match"
      :class="isSelected(match) ? 'selected' : ''"
      @click="select($event, match)"
      @contextmenu="onRightClick($event, match)"
    />
  </div>
  <Button v-else label="Add" @click="addFirstMatch" />

  <Dialog v-model:visible="editDialog" maximizable modal header="Edit" :style="{ width: '80vw' }">
    <EditDialog
      v-if="isArrayHasLength(selectedMatches) && !isBaseSelected"
      :base-entity-match="baseEntityMatch"
      :match="selectedMatches[0]"
      @on-close="onEditDialogClose"
    />
    <AddBaseType v-else :matches="matches" @on-close="editDialog = false" />
  </Dialog>
  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, ref } from "vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import EditDialog from "./EditDialog.vue";
import { MenuItem } from "primevue/menuitem";
import AddBaseType from "./AddBaseType.vue";
import RecursiveQueryEditDisplay from "./RecursiveQueryEditDisplay.vue";

interface Props {
  parentMatch?: Match;
  matches: Match[];
  selectedMatches: Match[];
  baseEntityMatch: Match;
}

enum Direction {
  ABOVE,
  BELOW
}

const props = defineProps<Props>();
const editDialog: Ref<boolean> = ref(false);

const rClickMenu = ref();
const isBaseSelected: ComputedRef<boolean> = computed(() => {
  return JSON.stringify(props.selectedMatches[0]) === JSON.stringify(props.matches[0]);
});
const rClickOptions: Ref<MenuItem[]> = ref([]);
const rClickItemsSingle: Ref<MenuItem[]> = ref([
  {
    label: "Add",
    icon: "pi pi-fw pi-plus",
    items: [
      {
        label: "Above",
        command: () => {
          add(Direction.ABOVE);
          edit();
        },
        disabled: isBaseSelected.value
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
  {
    label: "Delete",
    icon: "pi pi-fw pi-trash",
    command: () => {
      remove();
    }
  }
]);

const rClickItemsGroup = ref([
  {
    label: "Group",
    icon: "pi pi-fw pi-trash",
    command: () => {
      group();
    }
  },
  {
    label: "Delete",
    icon: "pi pi-fw pi-trash",
    command: () => {
      remove();
    }
  }
]);

function addFirstMatch() {
  editDialog.value = true;
}

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

function remove() {
  for (const selectedMatch of props.selectedMatches) {
    const index = getIndexOfMatch(selectedMatch, props.matches);
    if (index !== -1) props.matches.splice(index, 1);
  }
  props.selectedMatches.length = 0;
}

function group() {
  const groupedMatch = { boolMatch: "and", match: [] } as Match;
  for (const selectedMatch of props.selectedMatches) {
    groupedMatch.match!.push(selectedMatch);
  }
  describeMatch([groupedMatch], "match");
  remove();
  props.matches.push(groupedMatch);
  props.selectedMatches.push(groupedMatch);
}

function ungroup() {
  props.parentMatch;
  for (const selectedMatch of props.selectedMatches) {
    if (isArrayHasLength(selectedMatch.match))
      for (const nestedMatch of selectedMatch.match!) {
        props.matches.push(nestedMatch);
      }
    const index = getIndexOfMatch(selectedMatch, props.matches);
    if (index !== -1) props.matches.splice(index, 1);
    const selectedIndex = getIndexOfMatch(selectedMatch, props.selectedMatches);
    if (selectedIndex !== -1) props.selectedMatches.splice(index, 1);
  }
}

function getIndexOfMatch(searchMatch: Match, matchList: Match[]) {
  return (searchMatch as any).key
    ? matchList.findIndex(match => (searchMatch as any).key === (match as any).key)
    : matchList.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
}

function onRightClick(event: any, match: Match) {
  if (!isSelected(match) || props.selectedMatches.length <= 1) singleselect(match);
  rClickOptions.value = getRightClickOptions();
  rClickMenu.value.show(event);
}

function getRightClickOptions() {
  if (props.selectedMatches.length > 1) {
    return rClickItemsGroup.value;
  }
  const options = rClickItemsSingle.value;
  if (isArrayHasLength(props.selectedMatches[0].match))
    options.push({
      label: "Ungroup",
      icon: "pi pi-fw pi-trash",
      command: () => {
        ungroup();
      }
    });
  return options;
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
  border: 1px dotted;
  background-color: var(--highlight-bg);
  color: var(--text-color);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}

.p-dialog-content {
  height: 100% !important;
}
</style>
