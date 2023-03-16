<template>
  <div class="table-query-container">
    <div class="bool-tag">
      <Tag :severity="severity as any" :value="bool || 'and'"></Tag>
    </div>
    <ul class="children-list">
      <template v-if="isArrayHasLength(queryData)" v-for="child of queryData" :key="child.name">
        <li :class="{ selected: isSelected(child) }" @click="select(child, level)">
          <div class="name">
            {{ child.data.description || child.data.name || child.label }}
          </div>

          <template v-if="isSelected(child)">
            <teleport to="#query-main-container">
              <RecursiveTableQuery
                v-if="child.children && child.children.length"
                :bool="child.bool"
                :query-data="child.children"
                :selected="selected"
                :level="level + 1"
                @selected="select"
              />
              <LeafTableQuery v-else :value="child.data" />
            </teleport>
          </template>
        </li>
      </template>
      <li class="add-button-container">
        <div class="add-button" @click="add">Add +</div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { TableQuery } from "@im-library/interfaces";
import { ComputedRef, computed } from "vue";
import LeafTableQuery from "./LeafTableQuery.vue";

const props = defineProps({
  bool: { type: String, required: true },
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

const severity: ComputedRef<string> = computed(() => getSeverity());

function getSeverity() {
  switch (props.bool) {
    case "and":
      return "warning";
    case "or":
      return "info";
    case "not":
      return "danger";

    default:
      return "warning";
  }
}
</script>

<style scoped>
.table-query-container {
  display: flex;
  flex-flow: column;
  border-right: 1px solid #b89241;
  min-height: 25vh;
  min-width: 20%;
  max-width: 30%;
}

.bool-tag {
  display: flex;
  justify-content: center;
}

.children-list {
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

.add-button {
  display: none;
}

.children-list:hover .add-button {
  display: block;
}
</style>
