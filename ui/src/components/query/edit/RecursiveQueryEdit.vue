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
  <Dialog v-model:visible="keepAsDialog" modal :header="'Keep as variable'" :style="{ width: '20vw' }">
    <InputText type="text" v-model="selectedMatches[0].variable" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="discardKeepAs" text />
      <Button label="Save" @click="keepAsDialog = false" text />
    </template>
  </Dialog>
  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, ref } from "vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import EditDialog from "./EditDialog.vue";
import { MenuItem } from "primevue/menuitem";
import AddBaseType from "./AddBaseType.vue";
import RecursiveQueryEditDisplay from "./RecursiveQueryEditDisplay.vue";
import Swal from "sweetalert2";
import { PrimeIcons } from "primevue/api";

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
const keepAsDialog: Ref<boolean> = ref(false);
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
    label: "Move",
    icon: PrimeIcons.SORT,
    items: [
      {
        label: "Up",
        icon: PrimeIcons.SORT_UP,
        command: () => {
          moveUp();
        }
      },
      {
        label: "Down",
        icon: PrimeIcons.SORT_DOWN,
        command: () => {
          moveDown();
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
    label: "Keep as",
    icon: PrimeIcons.SAVE,
    command: () => {
      keepAs();
    }
  },
  {
    label: "Toggle bool",
    icon: PrimeIcons.ARROW_V,
    command: () => {
      toggleBoolMatch(props.selectedMatches[0]);
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
    icon: "pi pi-fw pi-link",
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

function keepAs() {
  keepAsDialog.value = true;
}

function addFirstMatch() {
  editDialog.value = true;
}

function discardKeepAs() {
  delete props.selectedMatches[0].variable;
  keepAsDialog.value = false;
}

function moveUp() {
  const index = getIndexOfMatch(props.selectedMatches[0], props.matches);
  if (index !== -1 && index !== 0) {
    props.matches.splice(index - 1, 0, { ...props.selectedMatches[0] });
    props.matches.splice(index + 1, 1);
  }
}

function moveDown() {
  const index = getIndexOfMatch(props.selectedMatches[0], props.matches);
  if (index !== -1 && index !== 0) {
    props.matches.splice(index + 2, 0, { ...props.selectedMatches[0] });
    props.matches.splice(index, 1);
  }
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
    const index = props.matches.findIndex(match => JSON.stringify(selectedMatch) === JSON.stringify(match));
    if (index === 0) deleteBaseType();
    else if (index !== -1) props.matches.splice(index, 1);
  }
  props.selectedMatches.length = 0;
}

function deleteBaseType() {
  Swal.fire({
    icon: "info",
    title: "Confirm delete",
    text: "Are you sure you want to delete the base type of your query? All other clauses will be deleted.",
    showCancelButton: true,
    confirmButtonText: "Yes",
    reverseButtons: true,
    confirmButtonColor: "#2196F3",
    cancelButtonColor: "#607D8B",
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    backdrop: true
  }).then((result: any) => {
    if (result.isConfirmed) props.matches.length = 0;
  });
}

function group() {
  const firstSelected = props.selectedMatches[0];
  const indexOfFirstSelected = props.matches.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
  const groupedMatch = { boolMatch: "and", match: [] } as Match;
  for (const selectedMatch of props.selectedMatches) {
    groupedMatch.match!.push(selectedMatch);
  }
  describeMatch([groupedMatch], "match");
  remove();
  props.matches.splice(indexOfFirstSelected, 0, groupedMatch);
  props.selectedMatches.push(groupedMatch);
}

function ungroup() {
  for (const selectedMatch of props.selectedMatches) {
    if (isArrayHasLength(selectedMatch.match)) {
      const index = getIndexOfMatch(selectedMatch, props.matches);
      if (index !== -1) props.matches.splice(index, 1);
      for (const nestedMatch of selectedMatch.match!) {
        props.matches.splice(index, 0, nestedMatch);
      }
    }
  }
  remove();
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
  const options = [...rClickItemsSingle.value];
  const index = getIndexOfMatch(props.selectedMatches[0], props.matches);
  if (index === 0) options[0].items![0].disabled = true;
  if (isArrayHasLength(props.selectedMatches[0].match))
    options.push({
      label: "Ungroup",
      icon: "pi pi-fw pi-eject",
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
    if (!isArrayHasLength(match.match)) edit();
  }
}

function toggleBoolMatch(match: Match) {
  if (match.boolMatch === "and") match.boolMatch = "or";
  else if (match.boolMatch === "or") match.boolMatch = "and";
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

/* .feature:hover .feature {
  background-color: var(--highlight-bg);
} */

.feature:hover .feature:hover > * {
  background-color: var(--highlight-bg);
}

/* .feature:hover {
  background-color: var(--highlight-bg);
} */

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
