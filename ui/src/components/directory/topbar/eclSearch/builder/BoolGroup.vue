<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" class="bool-group-content" @mouseover="mouseover" @mouseout="mouseout">
    <div v-if="value?.items?.length > 1" class="conjunction">
      <Button class="builder-button conjunction-button" :label="value.conjunction" @click="toggleBool" />
    </div>
    <div class="children">
      <template v-for="(item, index) in value.items">
        <div class="component-container">
          <div class="minus-container">
            <Tag v-if="value.exclude" severity="danger" value="NOT" class="builder-button conjunction-button" />
          </div>
          <span class="left-container">
            <div class="group-checkbox">
              <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" />
              <label :for="'group' + index">Select</label>
            </div>
          </span>
          <BoolGroup v-if="item.type === 'BoolGroup'" :value="item" :parent="props.value" :focus="props.focus" @unGroupItems="unGroupItems" :index="index" />
          <component v-else :is="getComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus" :index="index" />
          <div class="right-container">
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
    </div>
    <div class="add-group">
      <Button
        type="button"
        icon="fa-solid fa-plus"
        class="builder-button"
        :severity="hover ? 'success' : 'secondary'"
        :outlined="!hover"
        :class="!hover && 'hover-button'"
        @click="toggleAdd"
        aria-haspopup="true"
        aria-controls="add-menu"
      />
      <Menu ref="addMenu" :model="addItems" :popup="true" />
      <Button
        v-if="value?.items?.length > 1"
        class="builder-button group-button"
        :severity="group.length ? 'success' : 'danger'"
        :outlined="!hover"
        :class="[!hover && 'hover-button', !group.length && 'strike-through']"
        label="{...}"
        @click="group.length ? processGroup() : requestUnGroupItems()"
        :disabled="!group.length && !(value?.items?.length > 1)"
        v-tooltip="!group.length ? 'Remove brackets' : 'Bracket selected items'"
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
import { ref, inject, Ref, watch, onMounted } from "vue";
import Concept from "@/components/directory/topbar/eclSearch/builder/Concept.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import _, { isArray } from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { numberAscending } from "@im-library/helpers/Sorters";

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
const group: Ref<number[]> = ref([]);

const menuBool = ref();
const addMenu = ref();

const addItems = ref([
  {
    label: "Add",
    items: [
      {
        label: "Concept",
        command: () => addConcept()
      },
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

onMounted(() => {
  props.value.ecl = generateEcl();
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

function toggleBool(event: any) {
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
    if (props.parent && isArray(props.value.items) && props.value.items.length > 1 && props.value.items.every((i: any) => i.type === "Refinement")) ecl += "{ ";
    else if (props.parent) ecl += "( ";
    for (const [index, item] of props.value.items.entries()) {
      ecl += generateChildEcl(index, item);
    }
    if (props.parent && isArray(props.value.items) && props.value.items.length > 1 && props.value.items.every((i: any) => i.type === "Refinement")) ecl += " }";
    else if (props.parent) ecl += " )";
  }
  return ecl.replace(/ {2,}/g, " ");
}

function generateChildEcl(index: number, item: any) {
  let ecl = "";
  if (index !== 0 && !item.exclude) ecl += props.value.conjunction + " ";
  if (item.ecl) ecl += item.ecl;
  if (index + 1 !== props.value.items.length) ecl += "\n";
  return ecl;
}

function processGroup() {
  console.log("grouping");
  if (group.value.length) {
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: "AND", items: [] };
    for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.splice(group.value.toSorted(numberAscending)[0], 0, newGroup);
  }
  group.value = [];
}

function requestUnGroupItems() {
  console.log("ungrouping");
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

function toggleAdd(event: any) {
  addMenu.value.toggle(event);
}
</script>

<style scoped>
.bool-group-content {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
}

.children {
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
  border: #ff8c00 1px solid;
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
  flex: 0 0 auto;
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

.conjunction-button,
.builder-button {
  padding: 0;
}

.builder-button {
  width: 2rem;
}

.conjunction-button:deep(.p-button-label) {
  transform: rotate(-90deg);
}

.strike-through {
  text-decoration: line-through;
}
</style>
