<template>
  <div>
    <Button
      class="p-button-square p-button-outlined edit-button"
      severity="info"
      :label="label"
      @click="toggleMenu"
      ref="editMenuTrigger"
      :style="{ padding: '2px 6px', lineHeight: '2' }"
    />
    <Menu ref="menu" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Bool, Match } from "@/interfaces/AutoGen";

interface Props {
  icon: string;
  label: string;
  menuItems: Array<any>;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch");
const menu = ref();
const toggleMenu = (event: MouseEvent) => {
  menu.value?.toggle(event);
};
function createNewGroup() {}
function unGroup() {}
function moveMatch() {}
function changeBooleanOperator() {
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
  if (parentMatch.value && parentMatch.value.bool) {
    if (parentMatch.value.bool === match.value.bool) {
      if (parentMatch.value && parentMatch.value.match) {
        const childIndex = parentMatch.value.match.findIndex(m => m === match.value);
        if (childIndex !== -1) {
          parentMatch.value.match.splice(childIndex, 1, ...(match.value.match ?? []));
          for (let i = 0; i < parentMatch.value.match.length; i++) {
            const subMatch = parentMatch.value.match[i];
            if (subMatch.match && subMatch.bool && subMatch.bool === parentMatch.value.bool) {
              parentMatch.value.match.splice(i, 1, ...(subMatch.match ?? []));
              i--;
            }
          }
        }
      }
    }
  }
}
function editMatch() {}
function deleteMatch() {}
function addMatch() {}
function createNestedMatch() {
  const nestedMatch = {} as Match;
  nestedMatch.bool = match.value.bool;
  nestedMatch.match = match.value.match;
  match.value.match = [nestedMatch];
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
}
</script>
