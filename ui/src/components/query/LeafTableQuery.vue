<template>
  <div class="leaf">
    <div class="property-value" v-for="property in Object.keys(value)">
      <div v-if="'where' !== property">
        <TableQueryIri
          v-if="'@id' === property || '@set' === property || '@type' === property"
          :value="value"
          :property="property"
          :edit-mode="editModeSet.has(property)"
          @on-edit="edit"
        />
        <TableQueryIn v-else-if="'in' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
        <TableQueryRange v-else-if="'range' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
        <TableQueryOperator v-else-if="'operator' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
        <TableQueryBoolean v-else-if="'exclude' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
        <TableQueryLogicBool v-else-if="'bool' === property" :property="property" :value="value" :edit-mode="editModeSet.has(property)" @on-edit="edit" />

        <TableQueryDefault v-else-if="'name' !== property" :value="value" :property="property" :edit-mode="editModeSet.has(property)" @on-edit="edit" />
      </div>
      <div class="action-button-container" v-if="!editModeSet.has(property)">
        <Button
          icon="fa-solid fa-pen-to-square"
          class="p-button-rounded p-button-text p-button-plain action-button"
          v-tooltip.top="'Edit'"
          data-testid="edit-button"
          @click="edit(property)"
        />
        <Button
          icon="fa-solid fa-trash"
          class="p-button-rounded p-button-text p-button-plain action-button"
          v-tooltip.top="'Remove'"
          data-testid="edit-button"
          @click="remove(property)"
        />
      </div>
    </div>
    <div>
      <Button class="add-button" severity="success" label="Add" @click="addPropertyDialog = true" />
    </div>
    <Dialog v-model:visible="addPropertyDialog" modal header="Add rule" :style="{ width: '50vw' }">
      <AddProperty :value="value" :objectType="objectType" @on-close="addPropertyDialog = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import TableQueryBoolean from "./leafTableQuery/TableQueryBoolean.vue";
import TableQueryDefault from "./leafTableQuery/TableQueryDefault.vue";
import TableQueryIn from "./leafTableQuery/TableQueryIn.vue";
import TableQueryIri from "./leafTableQuery/TableQueryIri.vue";
import TableQueryOperator from "./leafTableQuery/TableQueryOperator.vue";
import TableQueryRange from "./leafTableQuery/TableQueryRange.vue";
import TableQueryLogicBool from "./leafTableQuery/TableQueryLogicBool.vue";
import AddProperty from "./leafTableQuery/AddProperty.vue";

const props = defineProps({
  value: { type: Object, required: true },
  objectType: { type: String, required: true }
});
const addPropertyDialog: Ref<boolean> = ref(false);
const editModeSet: Ref<Set<string>> = ref(new Set());

function edit(property: string) {
  if (!editModeSet.value.has(property)) editModeSet.value.add(property);
  else editModeSet.value.delete(property);
}

function remove(property: string) {
  delete props.value[property];
}
</script>

<style scoped>
.leaf {
  display: flex;
  flex-flow: column;
  padding: 0.5em 1em;
}

.add-button {
  display: none;
}

.action-button {
  display: none;
}

.property-value:hover .action-button {
  display: block;
}

.leaf:hover .add-button {
  display: block;
}

.leaf:hover .add-button {
  display: block;
}

.property-value {
  display: flex;
  flex-flow: row;
  align-items: center;
}

.action-button-container {
  display: flex;
}
</style>
