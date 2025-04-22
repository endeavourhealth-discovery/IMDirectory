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
  if (parentMatch.value && parentMatch.value.bool) {
    items.push({
      label: `Add nested ${parentMatch.value.bool === "and" ? "'or'" : "'and'"}`,
      command: () => createNewGroup()
    });
    items.push({
      label: `Ungroup this feature`,
      command: () => unGroup()
    });
  } else {
    items.push({
      label: `Create nested group "}`,
      command: () => createNewGroup()
    });
  }
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
  if (match.value.bool === "or") {
    items.push({
      label: "Must have all of the following (and)",
      command: () => changeBooleanOperator()
    });
  }

  if (match.value.bool === "and") {
    items.push({
      label: "Must have at least one of the following (or)",
      command: () => changeBooleanOperator()
    });
  }
  if (!match.value.match) {
    items.push({
      label: `Create nested ${parentMatch?.value.bool === "and" ? "or" : "and"}`,
      command: () => createNestedMatch()
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
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
  if (parentMatch.value && parentMatch.value.bool) {
    if (parentMatch.value.bool === match.value.bool) {
      if (parentMatch.value && parentMatch.value.match) {
        const childIndex = parentMatch.value.match.findIndex(m => m === match.value);
        if (childIndex !== -1) {
          parentMatch.value.match.splice(childIndex, 1, ...(match.value.match ?? []));
          for (let i = 0; i < parentMatch.value.match.length; i++) {
            const subMatch = parentMatch.value.match[i];
            if (subMatch.match && subMatch.bool && subMatch.bool === parentMatch.value.bool) {
              parentMatch.value.match.splice(i, 1, ...(subMatch.match ?? []));
              i--;
            }
          }
        }
      }
    }
  }
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
  const describedMatch = await QueryService.getQueryDisplayFromQuery(newMatch as Match, DisplayMode.ORIGINAL);
  if (!parentMatch.value.match) parentMatch.value.match = [];
  parentMatch.value.match.push(describedMatch);
  if (parentMatch.value.match.length > 1 && !parentMatch.value.bool) parentMatch.value.bool = Bool.and;
  selectedMatch.value = describedMatch;
  editFeature.value = true;
}
async function addInstanceOf(newMatch: Match) {
  addFeature.value = false;
  if (!parentMatch?.value.match) parentMatch.value.match = [];
  const describedMatch = await QueryService.getQueryDisplayFromQuery(newMatch as Match, DisplayMode.ORIGINAL);
  parentMatch.value.match.push(describedMatch);
  if (parentMatch.value.match.length > 1 && !parentMatch.value.bool) parentMatch.value.bool = Bool.and;
}
function addSubMatch() {}
function createNestedMatch() {
  const nestedMatch = {} as Match;
  nestedMatch.bool = match.value.bool;
  nestedMatch.match = match.value.match;
  match.value.match = [nestedMatch];
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
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
