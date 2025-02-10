<template>
  <div class="match-container" v-if="isArrayHasLength(editMatch.instanceOf)">
    <InputText value="is member of" disabled />

    <span v-if="isArrayHasLength(editMatch.instanceOf)" @click="showBuildFeatureDialog = true">
      <InputText v-if="editMatch.name ?? editMatch.description" :value="editMatch.name ?? editMatch.description" @click="showBuildFeatureDialog = true" />
      <InputText v-else :value="`${editMatch.instanceOf!.map(instanceOf => getNameFromRef(instanceOf)).join(', ')}`" @click="showBuildFeatureDialog = true" />
    </span>
    <AddNewFeatureDialog
      v-model:show-dialog="showBuildFeatureDialog"
      :dataModelIri="dataModelIri"
      :header="'Add new feature'"
      :show-variable-options="false"
      :can-clear-path="false"
      :has-next-step="false"
      :isList="editMatch.instanceOf"
      :show-all-type-filters="false"
      @on-match-add="onMatchAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { Match } from "@/interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

import AddNewFeatureDialog from "./addNewFeatureDialog/AddNewFeatureDialog.vue";
import { getNameFromRef } from "@/helpers/TTTransform";

interface Props {
  editMatch: Match;
  dataModelIri: string;
}
const props = defineProps<Props>();
const showBuildFeatureDialog: Ref<boolean> = ref(false);

function onMatchAdd(updatedMatch: Match) {
  props.editMatch.instanceOf = updatedMatch.instanceOf;
}
</script>

<style scoped lang="scss">
.match-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}

.search-text {
  flex: 1 1 auto;
  min-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--p-text-color);
  background: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: var(--p-textarea-border-radius);
  height: 2.7rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.any-checkbox-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem 0 0;
}

.clickable {
  cursor: pointer;
}

.inactive {
  color: var(--p-text-color-secondary);
}

.selected-label {
  padding-left: 0.5rem;
}

.multi-select {
  display: flex;
}
</style>
