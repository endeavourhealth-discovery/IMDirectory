<template>
  <span v-if="editor === 'booleanEditor'">
    <Button
      class="p-button-rounded p-button-outlined"
      severity="info"
      v-tooltip="'Click to manage boolean logic or add to group'"
      @click="toggleBooleanMenu"
      ref="booleanMenuTrigger"
      :style="{ padding: '2px 6px', lineHeight: '2' }"
    >
      ...
    </Button>
    <Menu ref="booleanMenu" :model="booleanMenuItems" :popup="true" />
  </span>
  <span v-if="editor === 'matchEditor'" class="relative-inline-block">
    <Button
      class="p-button-square p-button-outlined"
      severity="info"
      @click="toggleEditMenu"
      v-tooltip="'Click to edit or add feature or manage the group'"
      ref="editMenuTrigger"
      :style="{ padding: '2px 6px', lineHeight: '2' }"
    >
      ...
    </Button>
    <Menu ref="editMenu" :model="editMenuItems" :popup="true" />
  </span>
  <EditMatchDialog v-if="editFeature" v-model:visible="editFeature" :match="match" :match-base-type-iri="match.typeOf!['@id']" @save-changes="onSaveChanges" />
  <AddFeature v-if="addFeature" v-model:addFeature="addFeature" :base-type="parentMatch?.typeOf!" @onAddMatch="addNewMatch" @on-add-cohort="addInstanceOf" />
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { Bool, DisplayMode, Match } from "@/interfaces/AutoGen";
import { QueryService } from "@/services";
import AddFeature from "@/components/imquery/AddFeature.vue";
import EditMatchDialog from "@/components/imquery/EditMatchDialog.vue";

interface Props {
  editor: string;
}
const props = defineProps<Props>();

const booleanMenu = ref();
const editMenu = ref();
const addFeature: Ref<boolean> = ref(false);
const editFeature: Ref<boolean> = ref(false);
const selectedMatch: Ref<Match> = ref({});

const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const editMenuItems = computed(() => {
  const items = [];
  items.push({
    label: "Add feature",
    command: () => addMatch()
  });
  items.push({
    label: "Edit this feature",
    command: () => editMatch()
  });
  items.push({
    label: "Delete this feature",
    command: () => deleteMatch()
  });
  items.push({
    label: `Create nested group "}`,
    command: () => createNewGroup()
  });
  items.push({
    label: `Move this feature`,
    command: () => moveMatch()
  });

  return items;
});
const toggleEditMenu = (event: MouseEvent) => {
  editMenu.value?.toggle(event);
};

const booleanMenuItems = computed(() => {
  const items = [];
  if (match.value.or) {
    items.push({
      label: "Must have all of the following (and)",
      command: () => changeBooleanOperator()
    });
  }

  if (match.value.and) {
    items.push({
      label: "Must have at least one of the following (or)",
      command: () => changeBooleanOperator()
    });
  }
  if (!match.value.or && !match.value.and) {
    items.push({
      label: `Create nested ${parentMatch?.value.and ? "or" : "and"}`,
      command: () => createNestedMatch(parentMatch?.value.and ? Bool.or : Bool.and)
    });
  }
  if (!match.value.not) {
    items.push({
      label: `Create nested not"}`,
      command: () => createNestedMatch(Bool.not)
    });
  }

  items.push({
    label: "Add feature to this group",
    command: () => addSubMatch()
  });
  return items;
});
const toggleBooleanMenu = (event: MouseEvent) => {
  booleanMenu.value?.toggle(event);
};
function createNewGroup() {}
function unGroup() {}
function moveMatch() {}

function changeBooleanOperator() {
  const oldBool = match.value.and ? Bool.and : Bool.or;
  const newBool = match.value.and ? Bool.or : Bool.and;
  match.value[newBool] = match.value[oldBool];
}
function editMatch() {
  editFeature.value = true;
}
function deleteMatch() {}
function addMatch() {
  addFeature.value = true;
}
async function addNewMatch(newMatch: Match) {
  addFeature.value = false;
  const boolGroup = parentMatch.value.or ? Bool.or : parentMatch.value.and ? Bool.and : parentMatch.value.not ? Bool.not : Bool.and;
  const describedMatch = await QueryService.getQueryDisplayFromQuery(newMatch as Match, DisplayMode.ORIGINAL);
  if (!parentMatch.value[boolGroup]) parentMatch.value[boolGroup] = [];
  parentMatch.value[boolGroup]!.push(describedMatch);
  selectedMatch.value = describedMatch;
  editFeature.value = true;
}
async function addInstanceOf(newMatch: Match) {
  addNewMatch(newMatch);
}

function addSubMatch() {}
function createNestedMatch(operator: Bool) {
  const nestedMatch = {} as Match;
  match.value[operator] = [nestedMatch];
}
function deleteNodeRef() {
  match.value.nodeRef = undefined;
}
function editTarget() {}
async function onSaveChanges(editMatch: Match) {
  match.value = await QueryService.getQueryDisplayFromQuery(editMatch, DisplayMode.ORIGINAL);
}
</script>

<style scoped>
.relative-inline-block {
  padding-left: 0rem;
  padding-right: 0.5rem;
}
</style>
