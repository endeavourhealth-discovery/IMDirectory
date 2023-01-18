<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index === 1" type="button" :label="value.operator" @click="toggleBool" />
          <Button v-else-if="index > 1" type="button" :label="value.operator" class="p-button-secondary" disabled />
        </span>
        <BoolGroup v-if="item.type === 'BoolGroup'" :value="item" :parent="props.value" :focus="props.focus" />
        <component v-else :is="getComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus"> </component>
        <div class="remove-group">
          <Button @click="deleteItem(index)" :class="[hover ? 'p-button-danger' : 'p-button-placeholder']" icon="pi pi-trash" />
        </div>
      </div>
    </template>
    <div class="add-group">
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Concept" @click="addConcept" />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Refinement" @click="addRefinement" />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add Group" @click="addGroup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Concept from "@/components/directory/topbar/eclSearch/builder/Concept.vue";
import RefinementX from "@/components/directory/topbar/eclSearch/builder/RefinementX.vue";

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
  focus: { type: Object, required: false }
});

const selected = ref("AND");

const menuBool = ref();

const boolOptions = [
  {
    label: "AND",
    command: () => (props.value.operator = "AND")
  },
  {
    label: "OR",
    command: () => (props.value.operator = "OR")
  },
  {
    label: "NOT",
    command: () => (props.value.operator = "MINUS")
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
  add({ type: "Concept", descendants: "<<", operator: "AND" });
}

function addRefinement() {
  add({ type: "RefinementX", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", operator: "AND" });
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
  props.value.items.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "Concept":
      return Concept;
    case "RefinementX":
      return RefinementX;
  }
}
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
