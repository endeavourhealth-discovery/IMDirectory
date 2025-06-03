<template>
  <div class="nested-ecl-match">
    <div
      @mouseover="mouseover"
      @mouseout="mouseout"
      @drop="onDrop($event, match, parent, index)"
      @dragover="
        onDragOver($event);
        mouseover($event);
      "
      @dragleave="mouseout"
    >
      <Button
        v-if="!rootBool"
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        draggable="true"
        @dragstart="onDragStart($event, match, parent)"
        @dragend="onDragEnd(match, parent)"
      />
      <span v-for="operator in operators" :key="operator">
        <span v-if="match[operator]">
          <div class="nested-ecl-match" @mouseover="mouseover" @mouseout="mouseout">
            <div
              v-if="match.and || match.or"
              class="conjunction"
              @drop="onDrop($event, match, parent, index)"
              @dragover="
                onDragOver($event);
                mouseover($event);
              "
              @dragleave="mouseout"
            />
            <div v-for="(item, index) in match[operator]" :key="item.uuid">
              <ExpressionConstraint
                v-model:match="match[operator]![index]"
                v-model:parent="match"
                :index="index"
                :operator="operator as Bool"
                :parentOperator="operator"
                v-model:parentGroup="group"
                @updateBool="updateBool"
                @rationalise="emit('rationalise')"
                :rootBool="false"
              />
            </div>
          </div>
        </span>
      </span>
    </div>
    <Button
      type="button"
      icon="fa-solid fa-plus"
      label="Add concept"
      data-testid="add-concept-button"
      :severity="hoverAddConcept ? 'success' : 'secondary'"
      :outlined="!hoverAddConcept"
      :class="!hoverAddConcept && 'hover-button'"
      @click.stop="addConcept()"
      @mouseover="hoverAddConcept = true"
      @mouseout="hoverAddConcept = false"
    />
    <Button
      type="button"
      icon="fa-solid fa-filter"
      :class="!hoverAddRefinement && 'hover-button'"
      :severity="hoverAddRefinement ? 'success' : 'secondary'"
      :outlined="!hoverAddRefinement"
      @click.stop="addRefinement"
      aria-haspopup="true"
      aria-controls="add-filter"
      label="Add attribute"
      data-testid="add-refinement-button"
      @mouseover="hoverAddRefinement = true"
      @mouseout="hoverAddRefinement = false"
    />
    <div v-if="match.where">
      <span>Attributes for Group</span>
      <ECLRefinement
        v-model:where="match.where"
        v-model:parent="match"
        :index="index"
        :rootBool="true"
        :focusConcepts="focusConcepts"
        :parentType="'match'"
        :propertyTreeRoots="propertyTreeRoots"
        :imQueryForPropertySearch="imQueryForPropertySearch"
        class="refinement"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, computed } from "vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Bool, Match, Where, TTIriRef, QueryRequest } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { addConceptToGroup, rationaliseBoolGroups, updateBooleans } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import { cloneDeep } from "lodash-es";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool?: boolean;
  activeInputId?: string;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match | undefined>("parent") as Ref<Match | undefined>;
const parentGroup = defineModel<number[]>("group", { default: [] });
const group: Ref<number[]> = ref([]);
const emit = defineEmits(["updateBool", "rationalise", "activateInput"]);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or", "not"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const hoverAddConcept = ref(false);
const hoverAddRefinement = ref(false);
const hoverDeleteConcept = ref(false);
const focusConcepts = computed(() => {
  return updateFocusConcepts(match.value);
});
const propertyTreeRoots: Ref<string[]> = ref(["http://snomed.info/sct#410662002"]);
const imQueryForPropertySearch: Ref<QueryRequest> = ref({} as QueryRequest);
onMounted(() => {});
function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val);
}

function focusChildren(children: Match[] | undefined): TTIriRef[] {
  const focusConcepts: TTIriRef[] = [];
  if (children) {
    for (const [index, item] of children.entries()) {
      focusConcepts.push(...updateFocusConcepts(item));
    }
  }
  return focusConcepts;
}

function updateFocusConcepts(item: Match): TTIriRef[] {
  if (item.instanceOf && item.instanceOf[0].iri) return [{ iri: item.instanceOf[0].iri }];
  const focusConcepts: TTIriRef[] = [];
  focusConcepts.push(...focusChildren(item.or));
  focusConcepts.push(...focusChildren(item.and));
  return focusConcepts;
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool, props.index, group.value);
  if (newOperator === props.parentOperator) {
    emit("rationalise");
  }
}

function mouseover(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = true;
}

function deleteItem(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
  }
  updateFocusConcepts(match.value);
}
function mouseout(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = false;
}

function addRefinement() {
  const where = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  if (match.value.where) {
    if (match.value.where.and) match.value.where.and.push(where);
    else if (match.value.where.or) match.value.where.or.push(where);
    else {
      const boolWhere = { uuid: v4() } as Where;
      boolWhere.and = [match.value.where];
      boolWhere.and.push(where);
      match.value.where = boolWhere;
    }
  } else match.value.where = where;
}

function addConcept() {
  addConceptToGroup(match.value);
}
</script>

<style scoped>
.conjunction {
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
}

.nested-ecl-match {
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  flex: 1 1 0%;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}

.refinement {
  flex: 1 1 auto;
  min-width: 0;
}

.instance-of {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}

.concept-selector-container {
  flex: 1 1 0%;
  min-width: 0;
}

.display-concept {
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
}

.add-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
  padding: 4px 0 0 4px;
}

.builder-button {
  width: 2rem;
}
.add-refinement-button {
  margin-left: 0.1rem;
  width: 12rem;
  max-height: 1rem;
  padding: 1rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
.not-button {
  margin: 6px 0 6px 6px;
}

.add-filter-button {
  display: flex;
  width: 12rem;
  margin-left: 0.1rem;
}
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
.dropdown-labels {
  min-height: 1rem;
  font-size: 1rem;
}
</style>
