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
      <ReturnEditor v-model:match="match" :baseType="baseType" @update-match="onUpdate" />
    </template>
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="cancel" />
        <Button v-if="edited" autofocus data-testid="save-feature-button" label="OK" @click="onSave" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import { AlertDialog } from "@endeavour/vue-library/components";
import { DisplayMode } from "@endeavour/vue-library/enums";
import type { Node, Query } from "@endeavour/vue-library/models";
import { useDialogStore } from "@endeavour/vue-library/stores";

import ReturnEditor from "@/components/imquery/ReturnEditor.vue";
import { QueryService } from "@/services";

interface Props {
  index: number;
  booleanMatch: Query;
  baseType: Node;
}

const props = defineProps<Props>();
const showEditor = defineModel<boolean>("showEditor");
const query = defineModel<Query>("query", { default: {} });
const match: Ref<Query> = ref(props.booleanMatch);
const emit = defineEmits<{
  (event: "saveBooleanMatch", match: Query, index: number): void;
  (event: "cancel"): void;
}>();
const edited = ref(false);

const dialogStore = useDialogStore();

async function onUpdate(newMatch: Query) {
  match.value = newMatch;
  edited.value = true;
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
}

function cancel() {
  showEditor.value = false;
  emit("cancel");
}
async function onSave() {
  showEditor.value = false;
  emit("saveBooleanMatch", match.value, props.index);
}
async function showInvalid(match: Query) {
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
