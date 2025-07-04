<template>
  <div class="nested-match">
    <span v-if="parentOperator === Bool.rule">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </span>
    <div v-if="hasBoolGroups(match)">
      <BooleanEditor
        v-model:match="match"
        v-model:parentMatch="parentMatch"
        :index="clauseIndex"
        :depth="depth"
        :parentOperator="parentOperator"
        :clauseIndex="clauseIndex"
        v-model:parentGroup="group"
        @updateBool="updateBool"
        @rationalise="onRationalise"
        :rootBool="false"
      />
      <span v-for="operator in operators" :key="operator">
        <span v-if="match[operator]">
          <div v-if="match.union">
            <span class="field">Select one of the following</span>
          </div>
          <div class="nested-match" @mouseover="mouseover" @mouseout="mouseout">
            <div
              v-if="match.and || match.or"
              class="conjunction"
              @drop="onDrop($event, match, parentMatch, clauseIndex)"
              @dragover="
                onDragOver($event);
                mouseover($event);
              "
              @dragleave="mouseout"
            />
            <div v-for="(item, index) in match[operator]" :key="item.uuid">
              <MatchClauseDisplay
                v-model:match="match[operator]![index]"
                v-model:parentMatch="match"
                :index="index"
                :depth="depth + 1"
                :parentOperator="operator as Bool"
                :clauseIndex="index"
                v-model:parentGroup="group"
                @updateBool="updateBool"
                @rationalise="onRationalise"
                :rootBool="false"
              />
            </div>
          </div>
        </span>
      </span>
    </div>
    <div class="match-clause">
      <BooleanEditor
        v-model:match="match"
        v-model:parentMatch="parentMatch"
        :index="clauseIndex"
        :depth="depth"
        :parentOperator="parentOperator"
        :clauseIndex="clauseIndex"
        v-model:parentGroup="group"
        @updateBool="updateBool"
        @rationalise="onRationalise"
        :rootBool="false"
      />
      <div class="match-display">
        <MatchContentDisplay :match="match" :parentMatch="parentMatch" :depth="depth" :clauseIndex="clauseIndex" :expandSet="expandSet" />
      </div>
      <div class="edit-button">
        <Button
          type="button"
          icon="fa-solid fa-pen-to-square"
          label="Edit clause"
          data-testid="edit-clause-button"
          :severity="hoverEditClause ? 'success' : 'secondary'"
          :outlined="!hoverEditClause"
          :class="!hoverEditClause && 'hover-button'"
          @click="editMatch()"
          @mouseover="hoverEditClause = true"
          @mouseout="hoverEditClause = false"
        />
      </div>
      <div class="add-button">
        <Button
          type="button"
          icon="fa-solid fa-plus"
          label="Add clause"
          data-testid="add-clause-button"
          :severity="hoverAddClause ? 'success' : 'secondary'"
          :outlined="!hoverAddClause"
          :class="!hoverAddClause && 'hover-button'"
          @click="addMatch()"
          @mouseover="hoverAddClause = true"
          @mouseout="hoverAddClause = false"
        />
      </div>
      <div class="delete-button">
        <Button
          @click.stop="deleteMatch"
          class="builder-button"
          :severity="hoverDeleteClause ? 'danger' : 'secondary'"
          :outlined="!hoverDeleteClause"
          :class="!hoverDeleteClause && 'hover-button'"
          icon="fa-solid fa-trash"
          @mouseover="hoverDeleteClause = true"
          @mouseout="hoverDeleteClause = false"
        />
      </div>
    </div>
    <div v-if="parentOperator === Bool.rule">
      <RuleActionEditor :rule="match" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match, Bool } from "@/interfaces/AutoGen";
import { inject, Ref, ref } from "vue";
import { getBooleanOptions, getOperatorText, hasBoolGroups, updateBooleans, updateFocusConcepts, groupable } from "@/helpers/IMQueryBuilder";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  rootBool?: boolean;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  from?: Match;
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const parentGroup = defineModel<number[]>("group", { default: [] });
const emit = defineEmits(["updateBool", "rationalise", "activateInput", "navigateTo"]);
const expandSet: Ref<boolean> = ref(false);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const group: Ref<number[]> = ref([]);
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const hoverEditClause = ref(false);
const hoverDeleteClause = ref(false);
const hoverAddClause = ref(false);
const operators = ["and", "or", "not"] as const;

function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val, props.clauseIndex);
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool, index, group.value);
  if (newOperator === props.parentOperator) {
    emit("rationalise");
  }
}
function addMatch() {}
function deleteMatch() {}
function editMatch() {}
function mouseover(event: any) {
  event.stopPropagation();
}

function mouseout(event: any) {
  event.stopPropagation();
}
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
.match-clause {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.match-display {
  width: 30%;
  padding-left: 0.2rem;
  flex: 1 1 auto;
}

.operator-selector {
  width: 6rem;
}
.group-checkbox {
  height: 100%;
  width: 2rem;
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
