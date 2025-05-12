<template>
  <div class="children">
    <template v-for="operator in operators" :key="operator">
      <span v-if="match[operator]">
        <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
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
          <Button
            class="p-button-secondary p-button-outlined conjunction-button"
            :label="getOperatorText(operator)"
            @click="toggleBool"
            v-tooltip="getOperatorToggle(operator)"
            draggable="true"
            @dragstart="onDragStart($event, match, parent)"
            @dragend="onDragEnd(match, parent)"
          />
          <div v-for="(item, index) in match[operator]" :key="index">
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
              <ConceptSelector v-model:node="item.instanceOf![0]" :parent="parent" />
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
          </div>
        </div>
      </span>
    </template>
    <div class="add-attribute-container">
      <Button
        v-if="props.focus || match.or || match.and"
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
    <span v-if="match.where">
      <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
        <span>Where {{ getOperatorText("and") }}</span>
      </div>
    </span>
  </div>
  <div class="add-group">
    <Button
      v-if="parent && !group.length && childLength(match) > 1"
      class="builder-button group-button"
      severity="warn"
      icon="fa-solid fa-brackets-curly"
      :outlined="!hover"
      :class="[!hover && 'hover-button', 'strike-through']"
      @click="requestUnGroupItems()"
      :disabled="!group.length"
      v-tooltip="'Remove brackets'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, Ref, computed, ComputedRef } from "vue";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Match, Bool, SearchResultSummary } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { getOperatorText, getOperatorToggle } from "@/helpers/IMQueryBuilder";
import { IM } from "@/vocabulary";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import ConceptSelector from "@/components/directory/topbar/eclSearch/builder/ConceptSelector.vue";
interface Props {
  focus?: any;
  rootBool?: boolean;
  index?: number;
  operator?: Bool;
}

const props = withDefaults(defineProps<Props>(), {
  rootBool: false
});
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match>("parent", { default: {} });
const operators = ["and", "or", "not"] as const;
const attributeGroup: Ref<boolean> = ref(false);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop, onDragOver, onDragLeave } = setupECLBuilderActions(wasDraggedAndDropped);

const childLoadingState = inject("childLoadingState") as Ref<any>;

const emit = defineEmits({ unGroupItems: _payload => true });

const canBeAttributeGroup: ComputedRef<boolean> = computed(() => {
  if (match.value.where) return true;
  else return false;
});

const group: Ref<number[]> = ref([]);

const hover = ref();
function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function childLength(match: Match): number {
  if (!match.or && !match.and) return 0;
  if (match.or) return match.or.length;
  else return match.and!.length;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}

function toggleExclude() {
  if (parent.value) {
    if (parent.value.or) {
      parent.value.or.push(...parent.value.not!);
    } else if (parent.value.and) {
      parent.value.and.push(...parent.value.not!);
    }
    delete parent.value.not;
  }
}

function toggleBool(event: any) {
  if (match.value.and) {
    match.value.or = match.value.and;
    delete match.value.and;
  } else if (match.value.or) {
    match.value.and = match.value.or;
    delete match.value.or;
  }
}

function add(item: any) {
  if (match.value.or) {
    match.value.or.push(item);
  } else if (match.value.and) {
    match.value.and.push(item);
  } else {
    match.value.or = [];
    match.value.or.push(item);
  }
}

function addConcept() {
  const item = {
    instanceOf: [{ descendantsOrSelfOf: true }]
  } as Match;
  add(item);
}

function deleteItem(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
  }
}

function processGroup() {
  if (group.value.length > 1 && !props.rootBool) {
    const conjunction = props.operator === Bool.and ? "and" : "or";
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: conjunction, items: [] };
    const newMatch = {} as Match;
    if (props.operator === Bool.and) {
      newMatch.or = [];
      for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
        newMatch.or.push(parent.value.and![index]);
      }
    } else if (props.operator === Bool.or) {
      newMatch.and = [];
      for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
        newMatch.and.push(parent.value.or![index]);
      }
    }
  }
}

function addRefinement() {
  match.value.where = {
    descendantsOrSelfOf: true,
    is: [
      {
        descendantsOrSelfOf: true
      }
    ]
  };
}

function requestUnGroupItems() {
  emit("unGroupItems", match.value);
}

function unGroupItems(groupedItems: any) {
  console.log("unGroupItems", groupedItems);
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
  flex: 1 0 auto;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
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
