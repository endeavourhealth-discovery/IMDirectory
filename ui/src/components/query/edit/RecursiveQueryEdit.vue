<template>
  <div class="feature">
    <DisplayMatch
      v-if="!showEdit"
      :base-entity-match="baseEntityMatch"
      :match="match"
      :parent-match="parentMatch"
      :index="index"
      @click="select"
      @dblclick="showEdit = !showEdit"
      @contextmenu="onRightClick"
      :class="isSelected() ? 'selected' : ''"
    />

    <Card v-if="showEdit">
      <template #title>
        <DisplayMatch :base-entity-match="baseEntityMatch" :match="match" :index="index" />
      </template>
      <template #content>
        <EditMatch :base-entity-match="baseEntityMatch" :match="match" @cancel="showEdit = false" @save="save" />
      </template>
    </Card>

    <ul class="list-item" v-if="isArrayHasLength(props.match.match)" v-for="(nestedMatch, index) of props.match.match">
      <RecursiveQueryEdit
        class="nested-feature"
        :base-entity-match="baseEntityMatch"
        :match="nestedMatch"
        :selectedMatches="selectedMatches"
        :index="index"
        :parent-match="match"
      />
    </ul>
  </div>

  <Dialog v-model:visible="keepAsDialog" modal :header="'Keep as variable'" :style="{ width: '20vw' }">
    <InputText type="text" v-model="selectedMatches[0].variable" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="discardKeepAs" text />
      <Button label="Save" @click="keepAsDialog = false" text />
    </template>
  </Dialog>
  <Dialog v-model:visible="viewDialog" modal :header="'JSON Viewer'" :style="{ width: '75vw' }">
    <VueJsonPretty class="json" :path="'res'" :data="(selectedMatches[0] as any)" />
    <template #footer>
      <Button label="OK" @click="viewDialog = false" text />
    </template>
  </Dialog>
  <ContextMenu ref="rClickMenu" :model="rClickOptions" />
</template>

<script setup lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, ref } from "vue";
import { describeMatch, describeWhere } from "@im-library/helpers/QueryDescriptor";
import EditDialog from "./EditDialog.vue";
import { MenuItem } from "primevue/menuitem";
import AddBaseType from "./AddBaseType.vue";
import RecursiveQueryEditDisplay from "./RecursiveQueryEditDisplay.vue";
import Swal from "sweetalert2";
import { PrimeIcons } from "primevue/api";
import EditMatch from "./EditMatch.vue";
import DisplayMatch from "../editTextQuery/DisplayMatch.vue";

interface Props {
  parentMatch?: Match;
  match: Match;
  selectedMatches: Match[];
  baseEntityMatch: Match;
  index: number;
}

enum Direction {
  ABOVE,
  BELOW
}

const props = defineProps<Props>();
const showEdit: Ref<boolean> = ref(false);
const editDialog: Ref<boolean> = ref(false);
const keepAsDialog: Ref<boolean> = ref(false);
const viewDialog: Ref<boolean> = ref(false);
const rClickMenu = ref();
const isBaseSelected: ComputedRef<boolean> = computed(() => {
  return JSON.stringify(props.selectedMatches[0]) === JSON.stringify(props.baseEntityMatch);
});
const rClickOptions: Ref<MenuItem[]> = ref([]);
const rClickItemsSingle: Ref<MenuItem[]> = ref([
  {
    label: "Add",
    icon: "pi pi-fw pi-plus",
    items: [
      // {
      //   label: "Above",
      //   command: () => {
      //     add(Direction.ABOVE);
      //     edit();
      //   }
      // },
      // {
      //   label: "Below",
      //   command: () => {
      //     add(Direction.BELOW);
      //     edit();
      //   }
      // }
    ]
  },
  {
    label: "Move",
    icon: PrimeIcons.SORT,
    items: [
      {
        //   label: "Up",
        //   icon: PrimeIcons.SORT_UP,
        //   command: () => {
        //     moveUp();
        //   }
        // },
        // {
        //   label: "Down",
        //   icon: PrimeIcons.SORT_DOWN,
        //   command: () => {
        //     moveDown();
        //   }
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
    label: "View",
    icon: PrimeIcons.EYE,
    command: () => {
      view();
    }
  }
  // {
  //   label: "Delete",
  //   icon: "pi pi-fw pi-trash",
  //   command: () => {
  //     remove();
  //   }
  // }
]);

function toggleSelect() {}

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

function view() {
  viewDialog.value = true;
}

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

function save(editMatch: Match) {
  console.log(JSON.stringify(props.match));
  for (const key of Object.keys(editMatch)) {
    (props.match as any)[key] = (editMatch as any)[key];
  }
  describeMatch([props.match], "match");
  console.log(JSON.stringify(props.match));
  showEdit.value = false;
}

function moveUp() {
  if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
    if (props.index !== 0) {
      props.parentMatch.match!.splice(props.index - 1, 0, { ...props.match });
      props.parentMatch.match!.splice(props.index + 1, 1);
    }
  }
}

function moveDown() {
  if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
    if (props.index !== props.parentMatch.match!.length - 1) {
      props.parentMatch.match!.splice(props.index + 2, 0, { ...props.match });
      props.parentMatch.match!.splice(props.index, 1);
    }
  }
}

// function add(direction: Direction) {
//   const index = props.matches.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
//   if (index >= 1 || (index === 0 && direction !== Direction.ABOVE)) {
//     let indexToAdd = 0;
//     if (direction === Direction.ABOVE) indexToAdd = index;
//     if (direction === Direction.BELOW) indexToAdd = index + 1;
//     if (indexToAdd) {
//       const newMatch = {} as Match;
//       props.matches.splice(indexToAdd, 0, newMatch);
//       singleselect(newMatch);
//     }
//   }
// }

function edit() {
  editDialog.value = true;
}

function remove() {
  if (props.parentMatch) {
    props.parentMatch.match?.splice(props.index, 1);
  }
  props.selectedMatches.length = 0;
}

// function deleteBaseType() {
//   Swal.fire({
//     icon: "info",
//     title: "Confirm delete",
//     text: "Are you sure you want to delete the base type of your query? All other clauses will be deleted.",
//     showCancelButton: true,
//     confirmButtonText: "Yes",
//     reverseButtons: true,
//     confirmButtonColor: "#2196F3",
//     cancelButtonColor: "#607D8B",
//     showLoaderOnConfirm: true,
//     allowOutsideClick: () => !Swal.isLoading(),
//     backdrop: true
//   }).then((result: any) => {
//     if (result.isConfirmed) props.matches.length = 0;
//   });
// }

function group() {
  //   const firstSelected = props.selectedMatches[0];
  //   const indexOfFirstSelected = props.matches.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
  //   const groupedMatch = { boolMatch: "and", match: [] } as Match;
  //   for (const selectedMatch of props.selectedMatches) {
  //     groupedMatch.match!.push(selectedMatch);
  //   }
  //   describeMatch([groupedMatch], "match");
  //   remove();
  //   props.matches.splice(indexOfFirstSelected, 0, groupedMatch);
  //   props.selectedMatches.push(groupedMatch);
}

// function ungroup() {
//   for (const selectedMatch of props.selectedMatches) {
//     if (isArrayHasLength(selectedMatch.match)) {
//       const index = getIndexOfMatch(selectedMatch, props.matches);
//       if (index !== -1) props.matches.splice(index, 1);
//       for (const nestedMatch of selectedMatch.match!) {
//         props.matches.splice(index, 0, nestedMatch);
//       }
//     }
//   }
//   remove();
// }

function getIndexOfMatch(searchMatch: Match, matchList: Match[]) {
  return (searchMatch as any).key
    ? matchList.findIndex(match => (searchMatch as any).key === (match as any).key)
    : matchList.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
}

function onRightClick(event: any) {
  select(event);
  rClickOptions.value = rClickItemsGroup.value;
  rClickMenu.value.show(event);
}

// function getRightClickOptions() {
//   if (props.selectedMatches.length > 1) {
//     return rClickItemsGroup.value;
//   }
//   const options = [...rClickItemsSingle.value];

//   if (index === 0) options[0].items![0].disabled = true;
//   if (isArrayHasLength(props.selectedMatches[0].match))
//     options.push({
//       label: "Ungroup",
//       icon: "pi pi-fw pi-eject",
//       command: () => {
//         ungroup();
//       }
//     });
//   return options;
// }

function select(event: any) {
  if (event.ctrlKey) {
    multiselect();
  } else {
    singleselect();
  }
}

function toggleBoolMatch(match: Match) {
  if (match.boolMatch === "and") match.boolMatch = "or";
  else if (match.boolMatch === "or") match.boolMatch = "and";
}

function singleselect() {
  props.selectedMatches.length = 0;
  props.selectedMatches.push(props.match);
}

function multiselect() {
  if (isSelected()) {
    const toAddList = props.selectedMatches.filter(selected => JSON.stringify(selected) !== JSON.stringify(props.match));
    props.selectedMatches.length = 0;
    for (const toAddItem of toAddList) {
      props.selectedMatches.push(toAddItem);
    }
  } else props.selectedMatches.push(props.match);
}

function isSelected() {
  return !!props.selectedMatches.find(selected => JSON.stringify(selected) === JSON.stringify(props.match));
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
