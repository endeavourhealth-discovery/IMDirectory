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
      @dragover="
        {
          onDragOver($event);
          mouseover($event);
        }
      "
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
          <div v-if="isAliasIriRef(value.concept)" class="concept-container">
            <ConceptSelector :value="value" :parent="value" />
          </div>
          <div v-else-if="isBoolGroup(value.concept)" class="focus-group-container">
            <component :is="getComponent(value.concept.type)" :value="value.concept" :parent="value" @unGroupItems="unGroupItems" />
          </div>
          <div v-else class="add-focus-buttons-container">
            <Button
              :severity="hover ? 'success' : 'secondary'"
              :outlined="hover ? false : true"
              :class="!hover && 'hover-button'"
              label="Add Concept"
              @click="addConcept"
              class="builder-button"
            />
            <Button
              :severity="hover ? 'success' : 'secondary'"
              :outlined="hover ? false : true"
              :class="!hover && 'hover-button'"
              label="Add Group"
              @click="addGroup"
              class="builder-button"
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
            v-tooltip="'Add filter'"
          />
        </div>

        <div class="refinement">
          <div v-if="value?.items?.length > 1" class="conjunction">
            <Button class="builder-button conjunction-button vertical-button" :label="value.conjunction ?? 'OR'" @click="toggleBool" />
          </div>
          <div class="refinements">
            <div v-for="(item, index) in value.items" class="refinement-container">
              <span class="left-container">
                <div class="group-checkbox">
                  <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" />
                  <label :for="'group' + index">Select</label>
                </div>
                <Button
                  v-if="group.includes(index)"
                  icon="fa-solid fa-brackets-curly"
                  severity="help"
                  @click="processGroup()"
                  :disabled="!group.length"
                  v-tooltip="'Bracket selected items'"
                />
              </span>
              <component v-if="!loading" :is="getComponent(item.type)" :value="item" :parent="value" :focus="value.concept" @unGroupItems="unGroupItems" />
              <component v-else :is="getSkeletonComponent(item.type)" :value="item" :parent="value" :focus="value.concept" />
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, watch, inject } from "vue";
import BoolGroup from "./BoolGroup.vue";
import BoolGroupSkeleton from "./skeletons/BoolGroupSkeleton.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import RefinementSkeleton from "./skeletons/RefinementSkeleton.vue";
import _ from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { numberAscending } from "@im-library/helpers/Sorters";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";

interface Props {
  value: {
    type: string;
    descendants: string;
    conjunction: string;
    items: any[];
    concept: { iri: string; name?: string } | { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
    ecl?: string;
    exclude?: boolean;
  };
  parent?: any;
  index?: number;
}
const props = defineProps<Props>();
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const { onDragEnd, onDragStart, onDrop, onDragOver, onDragLeave } = setupECLBuilderActions(wasDraggedAndDropped);

watch(
  () => _.cloneDeep(props.value),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      props.value.ecl = generateEcl();
    }
  }
);

watch(
  () => _.cloneDeep(props.parent),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      props.value.ecl = generateEcl();
    }
  }
);

watch(
  () => _.cloneDeep(props.value.concept),
  async (newValue, oldValue) => {
    if (newValue !== oldValue) await init();
  }
);

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const addMenu = ref();
const loading = ref(false);
const group: Ref<number[]> = ref([]);

const addItems = ref([
  {
    label: "Add",
    items: [
      {
        label: "Refinement",
        command: () => addRefinement()
      },
      {
        label: "Group",
        command: () => addGroup()
      }
    ]
  }
]);

onMounted(async () => {
  await init();
  generateEcl();
});

async function init() {
  if (props.value?.concept) {
    props.value.ecl = generateEcl();
  }
}

const hover = ref();
function mouseover(event: Event) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function toggleBool(event: Event) {
  props.value.conjunction = props.value.conjunction === "AND" ? "OR" : "AND";
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

function toggleAdd(event: any) {
  addMenu.value.toggle(event);
}

function addRefinement() {
  add({ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "AND" });
}

function addConcept() {
  props.value.concept = { iri: "" };
}

function deleteItem(index: number) {
  props.value.items.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "BoolGroup":
      return BoolGroup;
    case "Refinement":
      return Refinement;
    case "Concept":
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

function generateEcl(): string {
  let ecl = "";
  if (isAliasIriRef(props.value.concept)) ecl += builderConceptToEcl(props.value, props.parent, includeTerms.value);
  else if (isBoolGroup(props.value.concept)) {
    if (props.value.concept.ecl) ecl += props.value.concept.ecl;
    else ecl += "[ UNKNOWN CONCEPT ]";
  }
  if (isArrayHasLength(props.value.items)) {
    ecl += " : \n";
    for (const [index, item] of props.value.items.entries()) {
      if (item.ecl) ecl += item.ecl;
      else ecl += "[ INVALID REFINEMENT ]";
      if (index + 1 !== props.value.items.length) ecl += " \n" + props.value.conjunction + " ";
    }
  }
  if (props.parent?.type === "BoolGroup" && props.parent.items?.length > 1 && props.value.items?.length) ecl += " )";
  return ecl;
}

function processGroup() {
  if (group.value.length) {
    const conjunction = props.parent?.conjunction === "OR" ? "AND" : "OR";
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: conjunction, items: [] };
    for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.splice(group.value.toSorted(numberAscending)[0], 0, newGroup);
  }
  group.value = [];
}

function unGroupItems(groupedItems: any) {
  const foundItem = props.value.items.find(item => _.isEqual(item, groupedItems));
  const foundItemIndex = props.value.items.findIndex(item => _.isEqual(item, groupedItems));
  if (foundItem) {
    props.value.items.splice(foundItemIndex, 1);
    for (const groupedItem of groupedItems.items) {
      props.value.items.splice(foundItemIndex, 0, groupedItem);
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
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
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
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
  border: #ff8c00 1px solid;
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
  padding-left: 0.5rem;
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
  margin-left: 0.35rem;
}
</style>
