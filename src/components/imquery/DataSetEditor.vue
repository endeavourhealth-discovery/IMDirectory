<template>
  <div>
    <Button
      label="Add Output columns"
      icon="fa-solid fa-plus"
      severity="secondary"
      class="addColumnGroup-btn"
      @click="addColumnGroup"
      data-testid="query-editor-add-column-button"
    />
  </div>
  <div class="column-group-display" v-for="(item, index) in query?.columnGroup">
    <ColumnGroupEditor
      v-if="editorGroups[index]"
      :key="index"
      :baseType="query.typeOf!"
      :clauseIndex="index"
      v-model:match="columnGroups[index]"
      v-model:show="editorGroups[index]"
    />
    <template v-else>
      <ColumnGroupDisplay :match="item" :key="`columnGroupQuery-${index}`" :matchExpanded="false" :returnExpanded="true" :index="index" :parentQuery="query" />
      <div class="flex-1"></div>
      <div class="edit-button">
        <Button
          type="button"
          icon="fa-solid fa-pen-to-square"
          label="Edit group"
          data-testid="edit-clause-button"
          :severity="hoverEditClause[index] ? 'success' : 'secondary'"
          :outlined="!hoverEditClause[index]"
          :class="!hoverEditClause[index] && 'hover-button'"
          @click="editGroup(index)"
          @mouseover="hoverEditClause[index] = true"
          @mouseout="hoverEditClause[index] = false"
        />
      </div>
      <div class="delete-button">
        <Button
          @click.stop="deleteGroup(index)"
          class="builder-button"
          :severity="hoverDeleteClause[index] ? 'danger' : 'secondary'"
          :outlined="!hoverDeleteClause[index]"
          :class="!hoverDeleteClause[index] && 'hover-button'"
          icon="fa-solid fa-trash"
          @mouseover="hoverDeleteClause[index] = true"
          @mouseout="hoverDeleteClause[index] = false"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Query, Bool, Node, SearchResultSummary, Where, Match, DisplayMode } from "@/interfaces/AutoGen";
import { inject, Ref, ref, computed, onMounted, watch } from "vue";
import Button from "primevue/button";
import { useECLBuilderActions } from "@/composables/useECLBuilderActions";
import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import { deleteGroupFromQuery } from "@/helpers/buildQuery";
import ColumnGroupEditor from "@/components/imquery/ColumnGroupEditor.vue";
import { QueryService } from "@/services";
import editor from "@/views/Editor.vue";

const query = defineModel<Query>("query", { default: {} });
const emit = defineEmits(["updateBool", "rationalise", "activateInput", "navigateTo"]);
const hoverEditClause = ref<boolean[]>([]);
const hoverDeleteClause = ref<boolean[]>([]);
const columnGroups = ref<Match[]>([]);
const editorGroups = ref<boolean[]>([]);
const showEditor = ref(false);
const groupToEdit: Ref<Match | undefined> = ref();
const groupIndex = ref(0);

onMounted(async () => {
  await init();
});

function deleteGroup(index: number) {
  editorGroups.value.splice(index, 1);
  columnGroups.value.splice(index, 1);
  hoverEditClause.value.splice(index, 1);
  hoverDeleteClause.value.splice(index, 1);
  deleteGroupFromQuery(query.value, index);
}
function init() {
  if (query.value.columnGroup) {
    for (const group of query.value.columnGroup) {
      columnGroups.value.push(group);
      editorGroups.value.push(false);
      hoverEditClause.value.push(false);
      hoverDeleteClause.value.push(false);
    }
  }
}
async function editGroup(index: number) {
  editorGroups.value[index] = true;
}
function addColumnGroup() {
  if (!query.value.columnGroup) query.value.columnGroup = [];
  groupToEdit.value = {};
  query.value.columnGroup.push(groupToEdit.value);
  groupIndex.value = query.value.columnGroup.length - 1;
  showEditor.value = true;
}
function mouseover(event: any) {}
</script>

<style scoped>
.nested-match {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}

.column-group-display {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}
.drag-drop {
  align-items: flex-start;
  justify-content: flex-start;
}
.boolean-editor {
  min-height: 100%;
  width: 6rem;
}

.match-display {
  width: 30%;
  padding-left: 0.2rem;
  flex: 1 1 auto;
}

.edit-button {
  height: 100%;
  width: 8%;
  display: flex;
  align-items: center;
}
.delete-button {
  height: 100%;
  width: 2%;
  display: flex;
  align-items: center;
}

::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0rem;
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
.rule {
  font-weight: bold;
  padding-right: 1rem;
}
</style>
