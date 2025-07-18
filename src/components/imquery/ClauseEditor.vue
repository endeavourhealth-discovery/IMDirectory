<template>
  <MatchEditor
    v-if="showMatchEditor"
    v-model:match="match"
    v-model:showMatchEditor="showMatchEditor"
    @cancel="cancelEditMatch"
    :baseType="baseType"
    v-model:visible="showMatchEditor"
  />
  <!--<AddFeature v-if="addFeature" v-model:match="match" @cancel="addFeature = false" :baseType="baseType" />-->
  <div class="nested-match">
    <div v-if="parentOperator === Bool.rule" class="rule">Rule {{ clauseIndex }}</div>
    <span v-if="hasBoolGroups(match)">
      <span v-for="operator in operators" :key="operator">
        <div v-if="match[operator]">
          <div class="match-clause">
            <BooleanEditor
              v-if="showBoolean && operator !== 'not'"
              v-model:match="match"
              v-model:parentMatch="parentMatch"
              :depth="depth"
              :hasSubgroups="true"
              :parentOperator="operator as Bool"
              :clauseIndex="clauseIndex"
              v-model:parentGroup="parentGroup"
              @updateOperator="onUpdateOperator"
              :rootBool="false"
            />
          </div>
          <div v-for="(item, index) in match[operator]" :key="item.uuid">
            <ClauseEditor
              v-model:match="match[operator]![index]"
              v-model:parentMatch="match"
              :depth="depth + 1"
              :baseType="baseType"
              :parentOperator="operator as Bool"
              :parentIndex="clauseIndex"
              :clauseIndex="index"
              v-model:parentGroup="group"
              @updateBool="updateBool"
              :rootBool="false"
            />
          </div>
        </div>
      </span>
    </span>
    <div v-else class="match-clause">
      <div v-if="parentMatch?.union && !from" class="number">{{ getSubrule(parentIndex, clauseIndex + 1) }}</div>
      <BooleanEditor
        v-if="showBoolean"
        v-model:match="match"
        v-model:parentMatch="parentMatch"
        :depth="depth"
        :parentOperator="parentOperator"
        :clauseIndex="clauseIndex"
        v-model:parentGroup="parentGroup"
        @update-operator="val => onUpdateOperator(val)"
        :rootBool="false"
      />
      <div class="match-display">
        <MatchContentDisplay :match="match" :parentMatch="parentMatch" :from="from" :depth="depth" :clauseIndex="clauseIndex" :expandSet="expandSet" />
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
    <div v-if="match.then">
      <ClauseEditor
        v-model:match="match.then"
        :from="match"
        :depth="depth + 1"
        :parentOperator="Bool.and"
        :parentIndex="clauseIndex"
        :clauseIndex="0"
        :rootBool="false"
        :baseType="baseType"
      />
    </div>
    <div v-if="parentOperator === Bool.rule">
      <RuleActionEditor :rule="match" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match, Bool, Node } from "@/interfaces/AutoGen";
import { inject, Ref, ref, computed, onMounted } from "vue";
import {
  hasBoolGroups,
  updateBooleans,
  updateFocusConcepts,
  isGroupable,
  addMatchToParent,
  matchDefined,
  deleteMatchFromParent
} from "@/composables/buildQuery";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import MatchEditor from "@/components/imquery/MatchEditor.vue";
import { cloneDeep } from "lodash-es";
interface Props {
  isVariable?: boolean;
  depth: number;
  rootBool?: boolean;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  from?: Match;
  parentOperator?: Bool;
  parentIndex: number;
  baseType: Node;
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
const showEditor = ref(false);
const operators = ["and", "or", "not"] as const;
const originalMatch: Ref<Match> = ref({});
const showBoolean = computed(() => {
  if (props.from) return false;
  if (props.parentOperator) {
    return props.parentOperator !== Bool.rule;
  }
  return false;
});
const showMatchEditor = computed(() => {
  if (!matchDefined(match.value)) return true;
  else if (showEditor.value) return true;
  else return false;
});
onMounted(async () => {
  init();
});

function init() {
  originalMatch.value = cloneDeep(match.value);
}

function onUpdateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val, props.clauseIndex);
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool, index, group.value);
}
function addMatch() {
  addMatchToParent({}, parentMatch.value);
}
function deleteMatch() {}
function editMatch() {
  showEditor.value = true;
}
function mouseover(event: any) {
  event.stopPropagation();
}
function getSubrule(parentIndex: number, index: number): string {
  return parentIndex + String.fromCharCode(96 + index);
}

function cancelEditMatch() {
  match.value = originalMatch.value;
  if (!matchDefined(match.value)) {
    deleteMatchFromParent(parentMatch.value, props.clauseIndex);
  }
  showEditor.value = false;
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
