<template>
  <ul class="children-list">
    <template v-if="isArrayHasLength(queryData)" v-for="child of queryData" :key="child.name">
      <li :class="{ selected: isSelected(child) }" @click="select(child, level)">
        <div class="name">
          {{ child.label }}
        </div>

        <template v-if="isSelected(child)">
          <teleport to="#query-main-container">
            <recursive-table-box v-if="child.children" :query-data="child.children" :selected="selected" :level="level + 1" @selected="select" />
            <div v-else class="leaf">{{ child.data }}</div>
          </teleport>
        </template>
      </li>
    </template>
    <li class="add-button-container">
      <div class="add-button" @click="add">Add +</div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { TableQuery } from "@im-library/interfaces";

const props = defineProps({
  queryData: { type: Array<TableQuery>, required: true },
  selected: { type: Array<TableQuery>, required: true },
  level: { type: Number, required: false, default: 0 }
});

const select = (character: any, level: number) => {
  props.selected[level] = character;
  props.selected.splice(level + 1);
};

const isSelected = (queryData: TableQuery) => {
  if (!props.selected || !props.selected.length || !props.selected.some(sel => sel.label === queryData.label)) {
    return false;
  }
  return props.selected[props.level]?.label === queryData.label;
};

function add() {
  console.log("add");
}
</script>

<style scoped>
.children-list {
  border-right: 1px solid #b89241;
  min-height: 25vh;
  width: 200px;
  margin: 0;
  padding: 0;
  position: relative;
}
.children-list li {
  display: flex;
  padding: 0.5em 1em;
}
.children-list li:hover {
  cursor: pointer;
}
.children-list li:not(.selected):hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.children-list li.selected {
  background-color: rgba(0, 0, 0, 0.1);
}

.leaf {
  display: flex;
  padding: 0.5em 1em;
}

.add-button {
  display: none;
}

.children-list:hover .add-button {
  display: block;
}
</style>
