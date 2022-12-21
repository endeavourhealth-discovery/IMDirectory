<template>
  <div class="nested-div">
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <span class="left-container">
          <div v-if="index == 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index == 1" type="button" :label="value.operator" @click="toggleBool" />
          <Button v-else-if="index > 1" type="button" :label="value.operator" class="p-button-secondary" disabled />
        </span>

        <component
            :is="item.type"
            :value="item"
            :parent="props.value"
        >
        </component>
        <span class="move-group hover-show">
            <Button @click="deleteItem(index)" class="p-button-sm p-button-danger" icon="pi pi-times"/>
            <Button @click="move(index, -1)" :disabled="index == 0" class="p-button-sm p-button-secondary" icon="pi pi-arrow-up"/>
            <Button @click="move(index, +1)" :disabled="index == value.items.length - 1" class="p-button-sm p-button-secondary" icon="pi pi-arrow-down"/>
        </span>
      </div>
    </template>
    <div class="add-group hover-show">
      <Button type="button" class="p-button-success" label="Add" @click="toggleAdd" />
      <Menu ref="menuAdd" :model="addOptions" :popup="true" />
    </div>
  </div>
</template>


<!--
<template>
  <div class="nested-div">
    <Button type="button" :label="value.operator" @click="toggleBool" v-if="value.items && value.items.length > 1" />
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <component
            :is="item.type"
            :value="item"
            :parent="props.value"
        >
        </component>
        <span class="move-group hover-show">
          <Button @click="deleteItem(index)" class="p-button-sm p-button-secondary">X</Button>
          <Button @click="move(index, -1)" :disabled="index == 0" class="p-button-sm p-button-secondary">^</Button>
          <Button @click="move(index, +1)" :disabled="index == value.items.length - 1" class="p-button-sm p-button-secondary">v</Button>
        </span>
      </div>
    </template>
    <div class="add-group hover-show">
      <Button type="button" class="p-button-success" label="Add" @click="toggleAdd" />
      <Menu ref="menuAdd" :model="addOptions" :popup="true" />
    </div>
  </div>
</template>
-->


<script setup lang="ts">
import {ref, Ref} from 'vue';

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
});

const selected = ref("AND");

const menuBool = ref();
const menuAdd = ref();

const boolOptions = [
  {
    label: 'AND',
    command: () => props.value.operator = 'AND'
  },
  {
    label: 'OR',
    command: () => props.value.operator = 'OR'
  },
  {
    label: 'MINUS',
    command: () => props.value.operator = 'MINUS'
  }
];

const addOptions = [
  {
    label: 'Add Concept',
    command: () => addConcept()
  },
  {
    label: 'Add Refinement',
    command: () => addRefinement()
  },
  {
    label: 'Add Group',
    command: () => addGroup()
  }
];

function toggleBool(event :any) {
  menuBool.value.toggle(event);
}

function toggleAdd(event: any) {
  menuAdd.value.toggle(event);
}

function add(item: any) {
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

function addConcept() {
  add({ "type": "Concept", "descendants": "<<"});
}

function addRefinement() {
  add({ "type": "RefinementX", "property": {"descendants": "<<"}, "operator": "=", "value": {"descendants": "<<"}});
}

function addGroup() {
  add({ "type": "BoolGroup", "operator": "AND"});
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
  props.value.items.splice(index, 1);
}

function move(index: number, direction: number) {
  let t = props.value.items[index];
  props.value.items[index] = props.value.items[index + direction];
  props.value.items[index + direction] = t;
}

</script>

<style scoped>

.left-container {
  display: flex;
  align-items: center;
}

.left-container > * {
  width: 6rem;
  margin: 0;
}

.add-group {
  width: 100%;
}

.move-group {
  width: 10rem;
}

.hover-show {
  display: flex;
  content-visibility: hidden;
  min-height: 1.5rem;
}

.hover-show:hover {
  content-visibility: visible;
}

.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
}

.component-container {
  display: flex;
}

Button {
  margin-right: 8px;
  height: 1.5rem;
  align-self: center;
}
</style>
