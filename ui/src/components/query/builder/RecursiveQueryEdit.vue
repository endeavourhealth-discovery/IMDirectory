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
  /> -->
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

const emit = defineEmits({
  onAdd: (_matchIndex: number, _newMatch: Match) => true,
  onRemove: (_matchIndex: number) => true,
  onGroup: (_matchIndex: number) => true,
  onUngroup: (_matchIndex: number) => true,
  onMoveUp: (_matchIndex: number) => true,
  onMoveDown: (_matchIndex: number) => true
});

interface Props {
  // parentMatch?: Match;
  // match: Match;
  // index: number;
  matches: Match[];
  queryTypeIri: string;
}

const props = defineProps<Props>();

const rClickOptions: Ref<MenuItem[]> = ref([]);
const rClickMenu = ref();
const selectedMatches: Ref<Match[]> = ref([]);

// const showEdit: Ref<boolean> = ref(false);
// const keepAsDialog: Ref<boolean> = ref(false);
// const viewDialog: Ref<boolean> = ref(false);
// const showAddProperty: Ref<boolean> = ref(false);
// const showSearchDialog: Ref<boolean> = ref(false);
// const editMatch: Ref<Match> = ref({ where: [] } as Match);
// const selectedCS: Ref<any> = ref({} as any);

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
//   delete selectedMatches.value[0].variable;
//   keepAsDialog.value = false;
// }

// function save(editMatch: Match) {
//   for (const key of Object.keys(editMatch)) {
//     (props.match as any)[key] = (editMatch as any)[key];
//   }
//   describeMatch([props.match], "match");
//   showEdit.value = false;
// }

function moveUp() {
  if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
    if (props.index !== 0) {
      props.parentMatch.match!.splice(props.index - 1, 0, { ...props.match });
      props.parentMatch.match!.splice(props.index + 1, 1);
    }
  } else {
    emit("onMoveUp", props.index);
  }
}

function moveDown() {
  if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
    if (props.index !== props.parentMatch.match!.length - 1) {
      props.parentMatch.match!.splice(props.index + 2, 0, { ...props.match });
      props.parentMatch.match!.splice(props.index, 1);
    }
  } else {
    emit("onMoveDown", props.index);
  }
}

function showAddPropertyDialog() {
  showAddProperty.value = true;
}

function addMatch(newMatch: Match) {
  if (props.parentMatch && isArrayHasLength(props.parentMatch.match)) {
    props.parentMatch.match!.splice(props.index + 1, 0, newMatch);
  } else {
    emit("onAdd", props.index, newMatch);
  }
  showAddProperty.value = false;
}

function showAddMatchDialog() {
  showSearchDialog.value = true;
}

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
//   selectedMatches.value.length = 0;
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
  if (props.parentMatch) {
    console.log(props.parentMatch);
    const firstSelected = selectedMatches.value[0];
    const indexOfFirstSelected = props.parentMatch.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
    const groupedMatch = { boolMatch: "and", match: [] } as Match;
    for (const selectedMatch of selectedMatches.value) {
      groupedMatch.match!.push(selectedMatch);
      props.parentMatch.match!.splice(indexOfFirstSelected, 1);
    }
    remove();
    describeMatch([groupedMatch], "match");
    props.parentMatch.match!.splice(indexOfFirstSelected, 0, groupedMatch);
  } else {
    emit("onGroup", props.index);
  }
}

function ungroup() {
  if (props.parentMatch) {
    for (const selectedMatch of selectedMatches.value) {
      if (isArrayHasLength(selectedMatch.match)) {
        const index = getIndexOfMatch(selectedMatch, props.parentMatch.match!);
        if (index !== -1) props.parentMatch.match!.splice(index, 1);
        for (const nestedMatch of selectedMatch.match!.reverse()) {
          props.parentMatch.match!.splice(index, 0, nestedMatch);
        }
      }
    }
  }
}

function getIndexOfMatch(searchMatch: Match, matchList: Match[]) {
  return (searchMatch as any).key
    ? matchList.findIndex(match => (searchMatch as any).key === (match as any).key)
    : matchList.findIndex(match => JSON.stringify(selectedMatches.value[0]) === JSON.stringify(match));
}

function onRightClick(event: any, match: Match) {
  select(event, match);
  rClickOptions.value = getRightClickOptions();
  rClickMenu.value.show(event);
}

function getRightClickOptions() {
  if (selectedMatches.value.length > 1) {
    return rClickItemsGroup.value;
  }
  const options = [...rClickItemsSingle.value];

  if (isArrayHasLength(selectedMatches.value[0].match))
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
  }
}

function toggleBoolMatch(match: Match) {
  if (match.boolMatch === "and") match.boolMatch = "or";
  else if (match.boolMatch === "or") match.boolMatch = "and";
}

function singleselect(match: Match) {
  selectedMatches.value.length = 0;
  selectedMatches.value.push(match);
}

function multiselect(match: Match) {
  if (isSelected(match)) {
    const toAddList = selectedMatches.value.filter(selected => JSON.stringify(selected) !== JSON.stringify(match));
    selectedMatches.value.length = 0;
    for (const toAddItem of toAddList) {
      selectedMatches.value.push(toAddItem);
    }
  } else selectedMatches.value.push(match);
}

function isSelected(match: Match) {
  return !!selectedMatches.value.find(selected => JSON.stringify(selected) === JSON.stringify(match));
}
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
