<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index === 1" type="button" :label="value.conjunction" @click="toggleBool" />
          <Button v-else-if="index > 1" type="button" :label="value.conjunction" class="p-button-secondary" disabled />
        </span>
        <BoolGroup v-if="item.type === 'BoolGroup'" :value="item" :parent="props.value" :focus="props.focus" :groupWithin="groupWithin" />
        <component v-else :is="getComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus" :groupWithin="groupWithin" />
        <div class="remove-group">
          <Button @click="deleteItem(index)" :class="[hover ? 'p-button-danger' : 'p-button-placeholder']" icon="pi pi-trash" />
        </div>
      </div>
    </template>
    <div class="add-group">
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Concept" @click="addConcept" />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Refinement" @click="addRefinement" />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add New Group" @click="addGroup" />
      <Button
        type="button"
        :class="[hover ? 'p-button-help' : 'p-button-placeholder', groupWithin ? 'p-button-danger' : 'p-button-help']"
        :label="groupWithin ? 'Finish Grouping' : 'Group within'"
        @click="groupWithin = !groupWithin"
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

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

watch(
  () => _.cloneDeep(props.value),
  () => (props.value.ecl = generateEcl())
);

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const selected = ref("AND");
const groupWithin = ref(false);

const menuBool = ref();

const boolOptions = [
  {
    label: "AND",
    command: () => (props.value.conjunction = "AND")
  },
  {
    label: "OR",
    command: () => (props.value.conjunction = "OR")
  },
  {
    label: "NOT",
    command: () => (props.value.conjunction = "MINUS")
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

function add(item: any) {
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

function addConcept() {
  add({ type: "Concept", descendants: "<<", conjunction: "AND" });
}

function addRefinement() {
  add({ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "AND" });
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
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
    for (const [index, item] of props.value.items.entries()) {
      if (props.focus || props.value.conjunction === "MINUS") ecl += "( ";
      ecl += item.ecl;
      if (props.focus || props.value.conjunction === "MINUS") ecl += " ) ";
      if (index + 1 !== props.value.items.length) ecl += "\n" + props.value.conjunction + " ";
    }
  }
  return ecl.replace(/  +/g, " ");
}

function enableGroupWithin(): void {}
</script>

<style scoped lang="scss">
@use "primevue/resources/themes/saga-blue/theme.css";

.p-button-placeholder {
  @extend .p-button-secondary;
  @extend .p-button-outlined;
  color: #00000030 !important;
  border-style: dashed !important;
}

.left-container {
  display: flex;
  align-items: center;
}

.left-container > * {
  width: 4rem;
  margin: 0;
}

.add-group {
  width: 100%;
}

.remove-group {
  width: 2rem;
  display: flex;
}

.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
  overflow: auto;
}

.nested-div-hover {
  @extend .nested-div;
  border: #ff8c00 1px solid;
}

.component-container {
  display: flex;
}

Button {
  margin-right: 4px;
  height: 1.5rem;
  align-self: center;
}
</style>
