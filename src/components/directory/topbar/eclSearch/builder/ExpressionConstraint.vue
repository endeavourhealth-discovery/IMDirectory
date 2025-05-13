<template>
  <div class="nested-ecl-match">
    <div v-if="!match.instanceOf && !hasBoolGroups()" class="flex flex-row">
      <Button
        icon="fa-solid fa-plus"
        :severity="hoverAddConcept ? 'success' : 'secondary'"
        :outlined="hoverAddConcept ? false : true"
        :class="!hoverAddConcept && 'hover-button'"
        label="Add concept"
        @click="addInstanceOf"
        @mouseover="hoverAddConcept = true"
        @mouseout="hoverAddConcept = false"
      />
      <Button
        type="button"
        icon="fa-solid fa-filter"
        :class="!hoverAddRefinement && 'hover-button'"
        :severity="hoverAddRefinement ? 'success' : 'secondary'"
        :outlined="hoverAddRefinement ? false : true"
        @click="addRefinement"
        aria-haspopup="true"
        aria-controls="add-filter"
        label="Add refinement"
        data-testid="add-refinement-button"
        @mouseover="hoverAddRefinement = true"
        @mouseout="hoverAddRefinement = false"
      />
    </div>
    <div v-else-if="match.instanceOf">
      <div class="match-container">
        <div class="expression-constraint">
          <Select
            v-if="!rootBool"
            class="operator-selector"
            :modelValue="parentOperator"
            :options="getBooleanOptions(parent!, parentOperator as Bool)"
            option-label="label"
            option-value="value"
            @update:modelValue="val => toggleBool(val as Bool)"
          />
          <span class="left-container">
            <div v-if="parent && (parent[parentOperator as keyof typeof parent] as Match[]).length > 2" class="group-checkbox">
              <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" data-testid="group-checkbox" />
              <label :for="'group' + index">Select</label>
            </div>
            <Button
              v-if="group.includes(index)"
              data-testid="group-button"
              icon="fa-solid fa-brackets-curly"
              severity="help"
              @click="processGroup()"
              :disabled="!group.length"
              v-tooltip="'Bracket selected items'"
            />
          </span>
          <span class="concept-selector-container">
            <ConceptSelector v-model:node="match.instanceOf[0]" :parent="parent" />
          </span>
          <span class="add-group">
            <Button
              type="button"
              icon="fa-solid fa-filter"
              label="Add concept"
              data-testid="add-concept-button"
              :severity="hoverAddConcept ? 'success' : 'secondary'"
              :outlined="!hoverAddConcept"
              :class="!hoverAddConcept && 'hover-button'"
              @click="addConceptToGroup()"
              @mouseover="hoverAddConcept = true"
              @mouseout="hoverAddConcept = false"
            />
          </span>
          <span class="add-group">
            <Button
              type="button"
              icon="fa-solid fa-plus"
              label="Add attribute"
              data-testid="add-refinement-button"
              :severity="hoverAddRefinement ? 'success' : 'secondary'"
              :outlined="!hoverAddRefinement"
              :class="!hoverAddRefinement && 'hover-button'"
              @click="addRefinement()"
              @mouseover="hoverAddRefinement = true"
              @mouseout="hoverAddRefinement = false"
            />
          </span>
          <span class="add-group">
            <Button
              @click="deleteItem(index)"
              class="builder-button"
              :severity="hoverDeleteConcept ? 'danger' : 'secondary'"
              :outlined="!hoverDeleteConcept"
              :class="!hoverDeleteConcept && 'hover-button'"
              icon="fa-solid fa-trash"
              @mouseover="hoverDeleteConcept = true"
              @mouseout="hoverDeleteConcept = false"
            />
          </span>
        </div>
      </div>
    </div>
    <div v-else-if="hasBoolGroups()">
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
              <div v-for="(item, index) in match[operator]" :key="index">
                <ExpressionConstraint
                  v-model:match="match[operator]![index]"
                  :parent="match"
                  :index="index"
                  :operator="operator as Bool"
                  :parentOperator="operator"
                />
              </div>
            </div>
          </span>
        </span>
      </div>
      <div v-if="match.where">
        <span v-if="hasBoolGroups()">Attributes for Group</span>
        <span v-else>"With these attributes:</span>
        <ECLRefinement v-model:where="match.where" v-model:parent="match" :index="index" class="refinement" />
      </div>
    </div>
    <div v-else>
      <Button
        type="button"
        icon="fa-solid fa-filter"
        label="Add attributes to this group"
        :severity="hoverAddRefinement ? 'success' : 'secondary'"
        :outlined="!hoverAddRefinement"
        :class="!hoverAddRefinement && 'hover-button'"
        @click="addRefinement"
        aria-haspopup="true"
        aria-controls="add-filter"
        data-testid="add-match-refinement-button"
        @mouseover="hoverAddRefinement = true"
        @mouseout="hoverAddRefinement = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, inject, computed } from "vue";
import BoolGroupSkeleton from "./skeletons/BoolGroupSkeleton.vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import RefinementSkeleton from "./skeletons/RefinementSkeleton.vue";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Match, Bool, Where } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { getBooleanOptions } from "@/helpers/IMQueryBuilder";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool?: boolean;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match | undefined>("parent") as Ref<Match | undefined>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or", "not"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver, onDragLeave } = setupECLBuilderActions(wasDraggedAndDropped);

const addMenu = ref();
const loading = ref(false);
const group: Ref<number[]> = ref([]);
const refinementGroup: Ref<number[]> = ref([]);

onMounted(() => {});
const hoverAddConcept = ref(false);
const hoverAddRefinement = ref(false);
const hoverDeleteWhere = ref(false);
const hoverDeleteConcept = ref(false);

const emit = defineEmits<{
  (e: "update:parentOperator", value: string): void;
}>();
function mouseover(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = true;
}
function hasBoolGroups() {
  if (match.value.or || match.value.and) return true;
  return false;
}

function deleteItem(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
  }
}
function mouseout(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = false;
}

function toggleAdd(event: any) {
  addMenu.value.toggle(event);
}

function addRefinement() {
  const where = { descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  match.value.where = where;
}

function addGroup() {}

function addInstanceOf() {
  match.value.instanceOf = [{ descendantsOrSelfOf: true }];
}

function addConceptToGroup() {
  if (!props.parentOperator || !parent.value) return;
  const operator = props.parentOperator as keyof Match;
  const concept = { instanceOf: [{ descendantsOrSelfOf: true }] };

  if (parent.value[operator]) {
    (parent.value[operator] as Match[]).splice(props.index + 1, 0, concept);
  } else {
    if (match.value.instanceOf) {
      const bool = props.rootBool || props.parentOperator === Bool.and ? Bool.or : Bool.and;
      const boolMatch = { [bool]: [] } as Match;
      boolMatch[bool]!.push(match.value);
      boolMatch[bool]!.push(concept);
      parent.value = boolMatch;
    }
  }
}

function toggleBool(bool: Bool) {
  if (!props.parentOperator || !parent.value) return;
  const from = props.parentOperator as Bool;
  const to = bool as keyof Match;
  if (from === to) return;
  if (to === Bool.not) {
    const sourceArray = parent.value[from];
    if (Array.isArray(sourceArray) && sourceArray.length > 1) {
      sourceArray.splice(props.index, 1);
      parent.value.not = parent.value.not || [];
      parent.value.not.push(match.value);
    }
    return;
  }
  if (from === Bool.not) {
    if (parent.value.or) parent.value.or.push(match.value);
    else if (parent.value.and) parent.value.and.push(match.value);
    parent.value.not!.splice(props.index, 1);
    if (parent.value.not!.length === 0) delete parent.value.not;
  } else if (parent.value[from]) {
    (parent.value as any)[to] = parent.value[from];
    delete parent.value[from];
  }
}

function getSkeletonComponent(componentName: string) {
  switch (componentName) {
    case "BoolGroup":
      return BoolGroupSkeleton;
    case "Refinement":
      return RefinementSkeleton;
  }
}

function processGroup() {}
function processRefinementGroup() {}
function unGroupItems(groupedItems: any) {}
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

.nested-div:deep(.hover-button) {
  color: #00000030 !important;
  border-style: dashed !important;
}

.nested-div-hover {
  padding: 0.5rem;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  flex: 1;
  border: #488bc2 1px solid;
}

.refinement {
  flex: 1 1 auto;
  min-width: 0;
}

.match-container {
  display: flex;
  border: #488bc230 1px solid;
  border-radius: 5px;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.expression-constraint {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
}

.left-container {
  display: flex;
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

.operator-selector {
  font-size: 0.85rem;
}
</style>
