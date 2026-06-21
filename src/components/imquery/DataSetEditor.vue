<template>
  <Dialog
    v-model:visible="showEditor"
    :draggable="false"
    :style="{ width: '90vw', height: '95vh', minWidth: '95vw', minHeight: '95vh' }"
    closable
    maximizable
    modal
    @hide="cancel"
  >
    <template #default>
      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab value="filters">Filters</Tab>
          <Tab value="columns">
            <span>Dataset items</span>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="filters">
            <DatasetFilterEditor
              v-model:match="match"
              :baseType="baseType"
              :depth="0"
              :index="0"
              :parent-index="0"
              :rootBool="true"
              @cancel="cancel"
              @add-linked="addLinked"
              @update-match="edited = true"
            />
          </TabPanel>
          <TabPanel value="columns">
            <ReturnEditor v-if="activeTab === 'columns'" v-model:match="match" :baseType="baseType" @update-match="onUpdate" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="cancel" />
        <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import { DisplayMode } from "@endeavour/vue-library/enums";
import type { Match, Node, Query } from "@endeavour/vue-library/interfaces";

import { v4 } from "uuid";

import DatasetFilterEditor from "@/components/imquery/DatasetFilterEditor.vue";
import ReturnEditor from "@/components/imquery/ReturnEditor.vue";
import AlertDialog from "@/components/shared/dynamicDialogs/AlertDialog.vue";
import { QueryService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";

interface Props {
  index: number;
  query: Query;
}

const props = defineProps<Props>();
const showEditor = defineModel<boolean>("showEditor");
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  (event: "saveColumnGroup", match: Match): void;
  (event: "cancel"): void;
}>();
const activeTab = ref("columns");
const edited = ref(false);

const baseType: Ref<Node> = ref(props.query.typeOf!);
const dialogStore = useDialogStore();

async function onUpdate() {
  edited.value = true;
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
}

function cancel() {
  emit("cancel");
}
async function onSave() {
  const valid = await saveChanges();
  if (valid) {
    emit("saveColumnGroup", match.value);
  }
}
async function showInvalid(match: Match) {
  await dialogStore.open(AlertDialog, {
    props: { modal: true, style: { width: "30vw" }, closable: false },
    data: {
      icon: "fa-regular fa-circle-check",
      title: "Warning",
      text: match.errorMessage + ". Use filter tab to edit.",
      confirmButtonText: "Close"
    }
  });
}
async function addLinked(editedMatch: Match) {
  await saveEditMatch(editedMatch);
  showEditor.value = false;
  const linkedMatch = { uuid: v4(), draft: true };
  match.value.any!.push(linkedMatch);
  showEditor.value = false;
}

async function saveEditMatch(editedMatch: Match) {
  showEditor.value = false;
  match.value = editedMatch;
  match.value.draft = false;
  showEditor.value = false;
}

async function saveChanges(): Promise<boolean> {
  const matchCheck = await QueryService.validateQuery(match.value);
  if (matchCheck.invalid) {
    match.value.draft = true;
    await showInvalid(matchCheck);
    return false;
  } else {
    match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
    match.value.draft = false;
    return true;
  }
}
</script>

<style scoped>
::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0;
  margin-right: 0;
}

::v-deep(.operator-selector .p-select-dropdown) {
  padding-left: 0;
  margin-left: 0;
}

::v-deep(.operator-selector-not .p-select-label) {
  color: var(--p-red-500) !important;
  font-size: 0.85rem;
}
</style>
