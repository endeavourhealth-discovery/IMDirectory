<template>
  <div class="not-bool-container">
    <Button
      v-if="
        isArrayHasLength(value.items) &&
        value.items.length &&
        (value.items[0].type === 'ExpressionConstraint' || value.items[0].type === 'BoolGroup') &&
        index &&
        index > 0
      "
      :severity="value.exclude ? 'danger' : 'secondary'"
      :outlined="!value.exclude"
      label="NOT"
      @click="toggleExclude"
      class="builder-button exclude-button vertical-button not-button"
      :class="!value.exclude && 'hover-button'"
      v-tooltip="'Exclude'"
      size="small"
      data-testid="bool-not-button"
    />
    <div :class="[hover ? 'nested-div-hover' : 'nested-div']" class="bool-group-content" @mouseover="mouseover" @mouseout="mouseout">
      <div v-if="value?.items?.length > 1" class="conjunction" @drop="onDrop($event, value, parent, index)" @dragover="mouseover" @dragleave="mouseout">
        <Button
          class="p-button-secondary p-button-outlined builder-button conjunction-button vertical-button"
          :label="value.conjunction"
          @click="toggleBool"
          draggable="true"
          @dragstart="onDragStart($event, value, parent)"
          @dragend="onDragEnd(value, parent)"
        />
      </div>
      <div class="children">
        <template v-for="(item, index) in value.items" v-bind:key="index">
          <div class="component-container">
            <span class="left-container">
              <div class="group-checkbox">
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
            <BoolGroup
              v-if="item.type === 'BoolGroup'"
              :value="item"
              :parent="props.value"
              :focus="props.focus"
              @unGroupItems="unGroupItems"
              :index="index"
              @mouseover="mouseover"
              @mouseout="mouseout"
            />
            <component
              v-else-if="item.type === 'Refinement' && props.value.items.length > 1 && props.value.items[index - 1].type === 'BoolGroup'"
              :is="getComponent(item.type)"
              :value="item"
              :parent="props.value"
              :focus="props.value.items[index - 1]"
              :index="index"
            />
            <component v-else :is="getComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus" :index="index" />
            <div class="add-group">
              <Button
                @click="deleteItem(index)"
                class="builder-button"
                :severity="hover ? 'danger' : 'secondary'"
                :outlined="!hover"
                :class="!hover && 'hover-button'"
                icon="fa-solid fa-trash"
              />
            </div>
          </div>
        </template>
        <div class="add-attribute-container">
          <Button
            v-if="props.focus || (value?.items?.length > 0 && value.items[value.items.length - 1].type === 'BoolGroup')"
            type="button"
            icon="fa-solid fa-filter"
            label="Add refinement"
            class="add-button"
            data-testid="add-refinement-button"
            :severity="hover ? 'success' : 'secondary'"
            :outlined="!hover"
            :class="!hover && 'hover-button'"
            @click="addRefinement()"
          />
          <Button
            v-if="!props.focus"
            type="button"
            icon="fa-solid fa-plus"
            label="Add concept"
            class="add-button"
            data-testid="add-concept-button"
            :severity="hover ? 'success' : 'secondary'"
            :outlined="!hover"
            :class="!hover && 'hover-button'"
            @click="addConcept()"
          />
          <div v-if="canBeAttributeGroup" class="attribute-group-checkbox">
            <Checkbox v-model="attributeGroup" :binary="true" data-testid="attribute-checkbox" />
            <label>Attribute group</label>
          </div>
        </div>
      </div>
      <div class="add-group">
        <Button
          v-if="parent && !group.length && value?.items?.length > 1"
          class="builder-button group-button"
          severity="warn"
          icon="fa-solid fa-brackets-curly"
          :outlined="!hover"
          :class="[!hover && 'hover-button', 'strike-through']"
          @click="requestUnGroupItems()"
          :disabled="!group.length && !(value?.items?.length > 1)"
          v-tooltip="'Remove brackets'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, Ref, watch, onMounted, computed, ComputedRef } from "vue";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import { cloneDeep, isArray, isEqual } from "lodash-es";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { numberAscending } from "@/helpers/Sorters";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";

interface Props {
  value: any;
  parent?: any;
  focus?: any;
  rootBool?: boolean;
  index?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rootBool: false
});

const emit = defineEmits<{
  unGroupItems: [groupedItems: any];
}>();

const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop } = setupECLBuilderActions(wasDraggedAndDropped);
watch(
  () => cloneDeep(props.value),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      if (props.value.attributeGroup) attributeGroup.value = true;
    }
  }
);
const childLoadingState = inject("childLoadingState") as Ref<any>;

const canBeAttributeGroup: ComputedRef<boolean> = computed(
  () => props.parent && isArray(props.value.items) && props.value.items.length >= 1 && props.value.items.every((i: any) => i.type === "Refinement")
);

const group: Ref<number[]> = ref([]);
const attributeGroup = ref(false);

watch(attributeGroup, () => {
  if (props.value.attributeGroup === undefined && attributeGroup.value) props.value.attributeGroup = attributeGroup.value;
  else delete props.value.attributeGroup;
});

onMounted(() => {
  if (props.value.attributeGroup) attributeGroup.value = true;
  if (props.value.id && Object.hasOwn(childLoadingState.value, props.value.id)) childLoadingState.value[props.value.id] = true;
});

const hover = ref();
function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
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
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

function addConcept() {
  add({ type: "ExpressionConstraint", constraintOperator: "<<", conjunction: "and", conceptSingle: { iri: "" } });
}

function deleteItem(index: number) {
  props.value.items.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "ExpressionConstraint":
      return ExpressionConstraint;
    case "Refinement":
      return Refinement;
  }
}

function processGroup() {
  if (group.value.length) {
    const conjunction = props.parent?.conjunction === "or" ? "and" : "or";
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: conjunction, items: [] };
    for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.splice(group.value.toSorted(numberAscending)[0], 0, newGroup);
  }
  group.value = [];
}

function addRefinement() {
  if (props.focus || (props.value?.items?.length > 0 && props.value?.items[props.value?.items?.length - 1].type === "BoolGroup")) {
    add({ type: "Refinement", property: { constraintOperator: "<<" }, operator: "=", value: { constraintOperator: "<<" } });
  } else {
    const anyConcept = {
      type: "ExpressionConstraint",
      constraintOperator: "<<",
      conceptSingle: { iri: "any", name: "ANY", code: "any" },
      conjunction: "and",
      items: [{ type: "Refinement", property: { constraintOperator: "<<" }, operator: "=", value: { constraintOperator: "<<" } }]
    };
    add(anyConcept);
  }
}

function requestUnGroupItems() {
  emit("unGroupItems", props.value);
}

function unGroupItems(groupedItems: any) {
  const foundItem = props.value.items.find((item: any) => isEqual(item, groupedItems));
  const foundItemIndex = props.value.items.findIndex((item: any) => isEqual(item, groupedItems));
  if (foundItem) {
    props.value.items.splice(foundItemIndex, 1);
    for (const groupedItem of groupedItems.items) {
      props.value.items.splice(foundItemIndex, 0, groupedItem);
    }
  }
}
</script>

<style scoped>
.not-bool-container {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
  overflow: auto;
  width: 100%;
}
.bool-group-content {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
  overflow: auto;
}

.children {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}
.nested-div {
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
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
  border: #488bc2 1px solid;
}
.left-container {
  display: flex;
  align-items: center;
}
.conjunction {
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
}

.spacer {
  width: 4rem;
}

.add-group {
  padding: 4px 0 0 4px;
  flex: 0 0 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
}

.attribute-group-checkbox {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.1rem;
}

.add-attribute-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.25rem;
}

.minus-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.right-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.component-container {
  flex: 0 1 auto;
  display: flex;
  flex-flow: row nowrap;
}

.builder-button {
  width: 2rem;
}

.strike-through {
  text-decoration: line-through;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}

.add-button {
  margin-left: 0.1rem;
  width: 12rem;
  max-height: 1rem;
  padding: 1rem;
}

.not-button {
  margin: 6px 0 6px 6px;
}

.attribute-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
</style>
