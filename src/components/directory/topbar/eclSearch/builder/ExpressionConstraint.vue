<template>
  <div class="tag-concept-container">
    <Button
      v-if="index && index > 0"
      :severity="value.exclude ? 'danger' : 'secondary'"
      :outlined="!value.exclude"
      label="NOT"
      @click="toggleExclude"
      class="builder-button exclude-button vertical-button not-button"
      :class="!value.exclude && 'hover-button'"
      v-tooltip="'Exclude'"
      size="small"
    />
    <div
      :class="[hover ? 'nested-div-hover' : 'nested-div']"
      class="concept"
      @mouseover="mouseover"
      @mouseout="mouseout"
      @drop="onDrop($event, value, parent, index)"
      @dragover="mouseover"
      @dragleave="mouseout"
    >
      <Button
        icon="drag-icon fa-solid fa-grip-vertical"
        severity="secondary"
        text
        draggable="true"
        @dragstart="onDragStart($event, value, parent)"
        @dragend="onDragEnd(value, parent)"
      />
      <div class="focus-container">
        <div class="focus">
          <div v-if="value.conceptSingle" class="concept-container">
            <ConceptSelector :value="value" :parent="value" />
          </div>
          <div v-else-if="value.conceptBool" class="focus-group-container">
            <component :is="getComponent(value.conceptBool.type)" :value="value.conceptBool" :parent="value" @unGroupItems="unGroupItems" />
          </div>
          <div v-else class="add-focus-buttons-container">
            <Button
              :severity="hover ? 'success' : 'secondary'"
              :outlined="hover ? false : true"
              :class="!hover && 'hover-button'"
              label="Add Concept"
              @click="addConcept"
            />
            <Button
              :severity="hover ? 'success' : 'secondary'"
              :outlined="hover ? false : true"
              :class="!hover && 'hover-button'"
              label="Add Group"
              @click="addGroup"
            />
          </div>
          <Button
            type="button"
            icon="fa-solid fa-filter"
            class="builder-button"
            :severity="hover ? 'success' : 'secondary'"
            :outlined="!hover"
            :class="!hover && 'hover-button'"
            @click="addRefinement"
            aria-haspopup="true"
            aria-controls="add-filter"
            v-tooltip="'Add refinement'"
            data-testid="add-refinement-button"
          />
        </div>

        <div class="refinement">
          <div v-if="value?.refinementItems?.length > 1" class="conjunction">
            <Button class="builder-button conjunction-button vertical-button" :label="value.conjunction ?? 'or'" @click="toggleBool" />
          </div>
          <div class="refinements">
            <div v-for="(item, index) in value.refinementItems" class="refinement-container" v-bind:key="index">
              <span class="left-container">
                <div class="group-checkbox">
                  <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" data-testid="group-checkbox" />
                  <label :for="'group' + index">Select</label>
                </div>
                <Button
                  v-if="group.includes(index)"
                  icon="fa-solid fa-brackets-curly"
                  severity="help"
                  @click="processGroup()"
                  :disabled="!group.length"
                  v-tooltip="'Bracket selected items'"
                  data-testid="group-button"
                />
              </span>
              <component
                v-if="!loading"
                :is="getComponent(item.type)"
                :value="item"
                :parent="value"
                :focus="value.conceptSingle ? value.conceptSingle : value.conceptBool"
                @unGroupItems="unGroupItems"
              />
              <component
                v-else
                :is="getSkeletonComponent(item.type)"
                :value="item"
                :parent="value"
                :focus="value.conceptSingle ? value.conceptSingle : value.conceptBool"
              />
              <span class="add-group">
                <Button
                  @click="deleteItem(index)"
                  :severity="hover ? 'danger' : 'secondary'"
                  :outlined="!hover"
                  :class="!hover && 'hover-button'"
                  icon="fa-solid fa-trash"
                  class="builder-button"
                />
              </span>
            </div>
            <Button
              v-if="value?.refinementItems?.length > 0"
              type="button"
              icon="fa-solid fa-filter"
              label="Add refinement"
              class="add-filter-button"
              :severity="hover ? 'success' : 'secondary'"
              :outlined="!hover"
              :class="!hover && 'hover-button'"
              @click="addRefinement()"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, inject } from "vue";
import BoolGroup from "./BoolGroup.vue";
import BoolGroupSkeleton from "./skeletons/BoolGroupSkeleton.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import RefinementSkeleton from "./skeletons/RefinementSkeleton.vue";
import { isEqual } from "lodash-es";
import { numberAscending } from "@/helpers/Sorters";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";

interface Props {
  value: {
    type: string;
    constraintOperator: string;
    conjunction: string;
    refinementItems: any[];
    conceptSingle: { iri: string; name?: string } | undefined;
    conceptBool: { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
    exclude?: boolean;
    id?: string;
  };
  parent?: any;
  index?: number;
}
const props = defineProps<Props>();
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop } = setupECLBuilderActions(wasDraggedAndDropped);
const childLoadingState = inject("childLoadingState") as Ref<any>;

const loading = ref(false);
const group: Ref<number[]> = ref([]);

onMounted(() => {
  if (props.value.id && Object.hasOwn(childLoadingState.value, props.value.id)) childLoadingState.value[props.value.id] = true;
});

const hover = ref();
function mouseover(event: Event) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function toggleBool() {
  props.value.conjunction = props.value.conjunction === "and" ? "or" : "and";
}

function toggleExclude() {
  props.value.exclude = !props.value.exclude;
}

function add(item: any) {
  if (!props.value.refinementItems) {
    props.value.refinementItems = [item];
  } else {
    props.value.refinementItems.push(item);
  }
}

function addRefinement() {
  add({ type: "Refinement", property: { constraintOperator: "<<" }, operator: "=", value: { constraintOperator: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "and" });
}

function addConcept() {
  props.value.conceptBool = undefined;
  props.value.conceptSingle = { iri: "" };
  props.value.constraintOperator = "<<";
}

function deleteItem(index: number) {
  props.value.refinementItems.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "BoolGroup":
      return BoolGroup;
    case "Refinement":
      return Refinement;
    case "ExpressionConstraint":
      return ConceptSelector;
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

function processGroup() {
  if (group.value.length) {
    const conjunction = props.parent?.conjunction === "or" ? "and" : "or";
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: conjunction, items: [] };
    for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
      const item = props.value.refinementItems.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.refinementItems.splice(group.value.toSorted(numberAscending)[0], 0, newGroup);
  }
  group.value = [];
}

function unGroupItems(groupedItems: any) {
  const foundItem = props.value.refinementItems.find(item => isEqual(item, groupedItems));
  const foundItemIndex = props.value.refinementItems.findIndex(item => isEqual(item, groupedItems));
  if (foundItem) {
    props.value.refinementItems.splice(foundItemIndex, 1);
    for (const groupedItem of groupedItems.items) {
      props.value.refinementItems.splice(foundItemIndex, 0, groupedItem);
    }
  }
}
</script>

<style scoped>
.tag-concept-container {
  display: flex;
  flex-flow: row nowrap;
  flex: 1 1 auto;
}
.concept {
  display: flex;
  flex-flow: row nowrap;
  flex: 1 1 auto;
}
.focus-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1 1 auto;
}

.focus {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
}

.conjunction {
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
}

.refinements {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.concept-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.focus-group-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: column nowrap;
}

.nested-div {
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  flex: 1;
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
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
}

.refinement-container {
  display: flex;
}

/* .drag-icon {
  display: flex;
  cursor: pointer;
  padding: 0.5rem;
} */

.left-container {
  display: flex;
  align-items: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.add-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
  padding: 4px 0 0 4px;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.right-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}

.spacer {
  width: 4rem;
}

.builder-button {
  width: 2rem;
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
</style>
