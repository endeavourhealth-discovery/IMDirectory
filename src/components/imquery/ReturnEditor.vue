<template>
  <div class="return-editor">
    <div>
      <span class="name">Dataset item name</span>
      <InputText v-model="match.name" class="match-name" type="text" @update:model-value="updateName" />
    </div>
    <div class="return-column-editor">
      <div class="as-editor font-bold">Column name</div>
      <div class="property-display font-bold">Property / Logic</div>
    </div>
    <template v-if="match.return">
      <div v-for="(_, rIndex) in match.return" :key="rIndex" class="return-column-editor">
        <ReturnColumnEditor v-model:column="match.return[rIndex]" v-model:match="match" :baseType="baseType" @updateMatch="emit('updateMatch')" />
        <div class="flex gap-2 ml-auto">
          <Button class="delete-button" icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeReturn(rIndex)" />
        </div>
      </div>
    </template>
    <div>
      <Button class="add-button" icon="fa-solid fa-plus" label="Add column" size="small" @click="addColumn" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Match, Node, Return, Where } from "@endeavour/vue-library/models";

import Button from "primevue/button";
import InputText from "primevue/inputtext";

import ReturnColumnEditor from "@/components/imquery/ReturnColumnEditor.vue";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
  addProperty: [where: Where];
  updateMatch: [];
}>();

function updateName() {
  emit("updateMatch");
}

function addColumn() {
  if (!match.value.return) match.value.return = [];
  const returnIndex = match.value.return.length - 1;
  match.value.return.push({ as: "new_column_" + returnIndex } as Return);
}

function removeReturn(index: number) {
  match.value.return!.splice(index, 1);
  emit("updateMatch");
}
</script>

<style scoped>
.name {
  padding-right: 1rem;
}
.match-name {
  width: 50rem;
}
.return-editor {
  max-height: 90%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.return-column-editor {
  display: flex;
  width: 100%;
  flex-direction: row;
}
.case-editor {
  display: flex;
  flex-direction: column;
}
.case-display {
  display: flex;
  flex-direction: row;
}
.property-display {
  display: flex;
  flex-direction: row;
}
.as-editor {
  width: 15rem;
}
.add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
</style>
