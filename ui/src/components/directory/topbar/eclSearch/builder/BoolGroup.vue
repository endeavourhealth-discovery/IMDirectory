<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <div class="minus-container">
          <Tag v-if="value.exclude" severity="danger" value="NOT" class="builder-button conjunction-button" />
        </div>
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1" class="spacer">&nbsp;</div>
          <Button v-else-if="index === 1" class="builder-button conjunction-button" :label="value.conjunction" @click="toggleBool" />
          <Button v-else-if="index > 1" class="builder-button conjunction-button" severity="secondary" :label="value.conjunction" disabled />
        </span>
        <BoolGroup v-if="item.type === 'BoolGroup'" :value="item" :parent="props.value" :focus="props.focus" @unGroupItems="unGroupItems" :index="index" />
        <component v-else :is="getComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus" :index="index" />
        <div class="right-container">
          <div v-if="groupWithinBoolGroup" class="group-checkbox">
            <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" />
            <label :for="'group' + index">Group</label>
          </div>
          <Button
            @click="deleteItem(index)"
            class="builder-button"
            :severity="hover ? 'danger' : 'secondary'"
            :outlined="!hover"
            :class="!hover && 'hover-button'"
            icon="pi pi-trash"
          />
        </div>
      </div>
    </template>
    <div class="add-group">
      <Button
        class="builder-button"
        :severity="hover ? 'success' : 'secondary'"
        :outlined="!hover"
        :class="!hover && 'hover-button'"
        label="Add Concept"
        @click="addConcept"
      />
      <Button
        class="builder-button"
        :severity="hover ? 'success' : 'secondary'"
        :outlined="!hover"
        :class="!hover && 'hover-button'"
        label="Add Refinement"
        @click="addRefinement"
      />
      <Button
        class="builder-button"
        :severity="hover ? 'success' : 'secondary'"
        :outlined="!hover"
        :class="!hover && 'hover-button'"
        label="Add New Group"
        @click="addGroup"
      />
      <Button
        class="builder-button"
        :severity="hover ? 'help' : 'secondary'"
        :outlined="!hover"
        :class="[!hover && 'hover-button', groupWithinBoolGroup ? 'p-button-danger' : 'p-button-help']"
        :label="groupWithinBoolGroup ? 'Finish Grouping' : 'Group within'"
        @click="processGroup"
      />
      <Button
        v-if="!rootBool"
        class="builder-button"
        :severity="hover ? 'warning' : 'secondary'"
        :outlined="!hover"
        :class="[!hover && 'hover-button', groupWithinBoolGroup ? 'p-button-danger' : 'p-button-warning']"
        label="Ungroup"
        @click="requestUnGroupItems"
      />
      <Button
        v-if="index && index > 0 && isArrayHasLength(value.items) && value.items.length && value.items[0].type === 'Concept'"
        :severity="hover ? 'danger' : 'secondary'"
        :outlined="!hover"
        :class="!hover && 'hover-button'"
        :label="value.exclude ? 'Include' : 'Exclude'"
        @click="toggleExclude"
        class="builder-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, Ref, watch } from "vue";
import Concept from "@/components/directory/topbar/eclSearch/builder/Concept.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import _ from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

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

watch(
  () => _.cloneDeep(props.value),
  () => (props.value.ecl = generateEcl())
);

const emit = defineEmits({ unGroupItems: payload => true });

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const selected = ref("AND");
const groupWithinBoolGroup = ref(false);
const group: Ref<number[]> = ref([]);

const menuBool = ref();

const boolOptions = [
  {
    label: "AND",
    command: () => (props.value.conjunction = "AND")
  },
  {
    label: "OR",
    command: () => (props.value.conjunction = "OR")
  }
];

const hover = ref();
function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}

function toggleBool(event: any) {
  menuBool.value.toggle(event);
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
  add({ type: "Concept", descendants: "<<", conjunction: "AND", concept: { iri: "" } });
}

function addRefinement() {
  if (!props.focus) {
    const anyConcept = {
      type: "Concept",
      descendants: "<<",
      concept: { iri: "any", name: "ANY", code: "any" },
      conjunction: "AND",
      items: [{ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } }]
    };
    add(anyConcept);
  } else add({ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "AND" });
}

function deleteItem(index: number) {
  props.value.items.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "Concept":
      return Concept;
    case "Refinement":
      return Refinement;
  }
}

function generateEcl(): string {
  let ecl = "";
  if (isArrayHasLength(props.value.items)) {
    if (props.value.exclude) ecl += "MINUS ";
    if (props.parent) ecl += "( ";
    for (const [index, item] of props.value.items.entries()) {
      if (index !== 0 && !item.exclude) ecl += props.value.conjunction + " ";
      if (item.ecl) ecl += item.ecl;
      if (index + 1 !== props.value.items.length) ecl += "\n";
    }
    if (props.parent) ecl += " )";
  }
  return ecl.replace(/  +/g, " ");
}

function processGroup() {
  if (groupWithinBoolGroup.value && group.value.length) {
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: "AND", items: [] };
    for (const index of group.value.sort((a, b) => a - b).reverse()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.splice(group.value.sort()[0], 0, newGroup);
  }
  groupWithinBoolGroup.value = !groupWithinBoolGroup.value;
  group.value = [];
}

function requestUnGroupItems() {
  emit("unGroupItems", props.value);
}

function unGroupItems(groupedItems: any) {
  const foundItem = props.value.items.find((item: any) => _.isEqual(item, groupedItems));
  const foundItemIndex = props.value.items.findIndex((item: any) => _.isEqual(item, groupedItems));
  if (foundItem) {
    props.value.items.splice(foundItemIndex, 1);
    for (const groupedItem of groupedItems.items) {
      props.value.items.splice(foundItemIndex, 0, groupedItem);
    }
  }
}
</script>

<style scoped>
.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1 0 auto;
  display: flex;
  flex-flow: column nowrap;
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
  flex: 1 0 auto;
  border: #ff8c00 1px solid;
  display: flex;
  flex-flow: column nowrap;
}
.left-container {
  display: flex;
  align-items: center;
}

.conjunction-button {
  width: 4rem;
  margin: 0;
}

.spacer {
  width: 4rem;
}

.add-group {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
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
  height: 1.5rem;
  align-self: center;
}
</style>
