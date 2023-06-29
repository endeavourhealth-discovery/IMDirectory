<template>
  <EditDisplayMatch :match="match" :index="index" v-for="(match, index) of matches" :query-type-iri="queryTypeIri" />

  <!-- <EditDisplayMatch
      v-if="!showEdit"
      :base-entity-match-iri="baseEntityMatchIri"
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
        <EditDisplayMatch :match="match" :index="index" />
      </template>
      <template #content>
        <EditMatch :base-entity-match-iri="baseEntityMatchIri" :match="match" @remove-match="remove()" @cancel="showEdit = false" @save="save" />
      </template>
    </Card>

    <ul class="list-item" v-if="isArrayHasLength(props.match.match)" v-for="(nestedMatch, index) of props.match.match">
      <RecursiveQueryEdit
        class="nested-feature"
        :base-entity-match-iri="baseEntityMatchIri"
        :match="nestedMatch"
        :selectedMatches="selectedMatches"
        :index="index"
        :parent-match="match"
      />
    </ul> -->

  <!-- <Dialog v-model:visible="keepAsDialog" modal :header="'Keep as variable'" :style="{ width: '20vw' }">
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
  <Dialog v-model:visible="showAddProperty" modal :header="'Add property'" :style="{ width: '60vw' }">
    <AddProperty :match="editMatch" :base-type="baseEntityMatchIri" @on-close="showAddProperty = false" @on-add-property="addMatch" />
  </Dialog>
  <DirectorySearchDialog
    v-model:showDialog="showSearchDialog"
    @on-close="showSearchDialog = false"
    @on-save="saveConceptSummaryAsMatch"
    @update:selected="onUpdateSelected"
  />
  <ContextMenu ref="rClickMenu" :model="rClickOptions" /> -->
</template>

<script setup lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, ref } from "vue";
import { describeMatch, describeWhere } from "@im-library/helpers/QueryDescriptor";
import { MenuItem } from "primevue/menuitem";
import { PrimeIcons } from "primevue/api";
import EditMatch from "./EditMatch.vue";
import EditDisplayMatch from "./display/EditDisplayMatch.vue";
import AddProperty from "./edit/AddProperty.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

const emit = defineEmits({ onAdd: (_matchIndex: number, _newMatch: Match) => true, onRemove: (_matchIndex: number) => true });

interface Props {
  // parentMatch?: Match;
  // match: Match;
  // selectedMatches: Match[];
  // index: number;
  matches: Match[];
  queryTypeIri: string;
}

const props = defineProps<Props>();
// const showEdit: Ref<boolean> = ref(false);
// const keepAsDialog: Ref<boolean> = ref(false);
// const viewDialog: Ref<boolean> = ref(false);
// const rClickMenu = ref();
// const showAddProperty: Ref<boolean> = ref(false);
// const showSearchDialog: Ref<boolean> = ref(false);
// const editMatch: Ref<Match> = ref({ where: [] } as Match);
// const selectedCS: Ref<any> = ref({} as any);

// const rClickOptions: Ref<MenuItem[]> = ref([]);
// const rClickItemsSingle: Ref<MenuItem[]> = ref([
//   {
//     label: "Add",
//     icon: "pi pi-fw pi-plus",
//     items: [
//       {
//         label: "Property",
//         command: () => {
//           showAddPropertyDialog();
//         }
//       },
//       {
//         label: "Match",
//         command: () => {
//           showAddMatchDialog();
//         }
//       }
//     ]
//   },
//   {
//     label: "Move",
//     icon: PrimeIcons.SORT,
//     items: [
//       {
//         label: "Up",
//         icon: PrimeIcons.SORT_UP,
//         command: () => {
//           moveUp();
//         }
//       },
//       {
//         label: "Down",
//         icon: PrimeIcons.SORT_DOWN,
//         command: () => {
//           moveDown();
//         }
//       }
//     ]
//   },
//   {
//     label: "Edit",
//     icon: "pi pi-fw pi-pencil",
//     command: () => {
//       edit();
//     }
//   },
//   {
//     label: "Keep as",
//     icon: PrimeIcons.SAVE,
//     command: () => {
//       keepAs();
//     }
//   },
//   {
//     label: "Toggle bool",
//     icon: PrimeIcons.ARROW_V,
//     command: () => {
//       toggleBoolMatch(props.selectedMatches[0]);
//     }
//   },
//   {
//     label: "View",
//     icon: PrimeIcons.EYE,
//     command: () => {
//       view();
//     }
//   },
//   {
//     label: "Delete",
//     icon: "pi pi-fw pi-trash",
//     command: () => {
//       remove();
//     }
//   }
// ]);

// const rClickItemsGroup = ref([
//   {
//     label: "Group",
//     icon: "pi pi-fw pi-link",
//     command: () => {
//       group();
//     }
//   },
//   {
//     label: "Delete",
//     icon: "pi pi-fw pi-trash",
//     command: () => {
//       remove();
//     }
//   }
// ]);

// function view() {
//   viewDialog.value = true;
// }

// function keepAs() {
//   keepAsDialog.value = true;
// }

// function edit() {
//   showEdit.value = !showEdit;
// }

// function discardKeepAs() {
//   delete props.selectedMatches[0].variable;
//   keepAsDialog.value = false;
// }

// function save(editMatch: Match) {
//   for (const key of Object.keys(editMatch)) {
//     (props.match as any)[key] = (editMatch as any)[key];
//   }
//   describeMatch([props.match], "match");
//   showEdit.value = false;
// }

// function moveUp() {
//   if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
//     if (props.index !== 0) {
//       props.parentMatch.match!.splice(props.index - 1, 0, { ...props.match });
//       props.parentMatch.match!.splice(props.index + 1, 1);
//     }
//   }
// }

// function moveDown() {
//   if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
//     if (props.index !== props.parentMatch.match!.length - 1) {
//       props.parentMatch.match!.splice(props.index + 2, 0, { ...props.match });
//       props.parentMatch.match!.splice(props.index, 1);
//     }
//   }
// }

// function showAddPropertyDialog() {
//   showAddProperty.value = true;
// }

// function addMatch(newMatch: Match) {
//   if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
//     props.parentMatch.match!.splice(props.index + 1, 0, newMatch);
//   } else {
//     emit("onAdd", props.index, newMatch);
//   }
//   showAddProperty.value = false;
// }

// function showAddMatchDialog() {
//   showSearchDialog.value = true;
// }

// function addNested() {
//   if (!isArrayHasLength(props.match.match)) props.match.match = [];
//   props.match.match!.push({});
// }

// function remove() {
//   if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
//     props.parentMatch.match!.splice(props.index, 1);
//   } else {
//     emit("onRemove", props.index);
//   }
//   props.selectedMatches.length = 0;
//   showEdit.value = false;
// }

// function saveConceptSummaryAsMatch() {
//   const match = {} as Match;
//   match.name = selectedCS.value.label;
//   if (isRecordModel(selectedCS.value.entityType)) match["@type"] = selectedCS.value.data;
//   if (isValueSet(selectedCS.value.entityType)) match["@set"] = selectedCS.value.data;
//   else match["@id"] = selectedCS.value.data;
//   describeMatch([match], "match");
//   addMatch(match);
//   showSearchDialog.value = false;
// }

// function onUpdateSelected(cs: any) {
//   selectedCS.value = cs;
// }

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

// function getIndexOfMatch(searchMatch: Match, matchList: Match[]) {
//   return (searchMatch as any).key
//     ? matchList.findIndex(match => (searchMatch as any).key === (match as any).key)
//     : matchList.findIndex(match => JSON.stringify(props.selectedMatches[0]) === JSON.stringify(match));
// }

// function onRightClick(event: any) {
//   select(event);
//   rClickOptions.value = rClickItemsSingle.value;
//   rClickMenu.value.show(event);
// }

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

// function select(event: any) {
//   if (event.ctrlKey) {
//     multiselect();
//   } else {
//     singleselect();
//   }
// }

// function toggleBoolMatch(match: Match) {
//   if (match.boolMatch === "and") match.boolMatch = "or";
//   else if (match.boolMatch === "or") match.boolMatch = "and";
// }

// function singleselect() {
//   props.selectedMatches.length = 0;
//   props.selectedMatches.push(props.match);
// }

// function multiselect() {
//   if (isSelected()) {
//     const toAddList = props.selectedMatches.filter(selected => JSON.stringify(selected) !== JSON.stringify(props.match));
//     props.selectedMatches.length = 0;
//     for (const toAddItem of toAddList) {
//       props.selectedMatches.push(toAddItem);
//     }
//   } else props.selectedMatches.push(props.match);
// }

// function isSelected() {
//   return !!props.selectedMatches.find(selected => JSON.stringify(selected) === JSON.stringify(props.match));
// }
</script>

<style>
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
