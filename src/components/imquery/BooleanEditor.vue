<template>
  <div class="drag-drop">
    <Button
      icon="drag-icon fa-solid fa-grip-vertical"
      severity="secondary"
      text
      draggable="true"
      @dragstart="onDragStart($event, match, parentMatch)"
      @dragend="onDragEnd(match, parentMatch)"
    />
  </div>
  <span v-if="parentOperator != Bool.rule">
    <div :class="hasSubgroups ? 'operator-selector-subgroups' : parentOperator === 'not' ? 'operator-selector-not' : 'operator-selector'">
      <Select
        :disabled="parentGroup.length > 0 && (!parentGroup.includes(clauseIndex) || parentGroup.length === 1)"
        :modelValue="parentOperator"
        :options="getBooleanOptions(match, parentMatch!, parentOperator as Bool, 'Match', clauseIndex, true, hasSubgroups)"
        option-label="label"
        option-value="value"
        data-testid="operator-selector"
        @update:modelValue="val => updateOperator(val)"
      >
        <template #option="slotProps">
          <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem" v-html="slotProps.option.label" />
        </template>
      </Select>
    </div>
  </span>
  <div class="group-checkbox">
    <Checkbox
      v-if="isGroupable(rootBool, parentMatch, parentOperator)"
      :disabled="parentGroup.length + 1 === (parentMatch[parentOperator as keyof typeof parentMatch] as Match[]).length && !parentGroup.includes(clauseIndex)"
      :inputId="'group' + clauseIndex"
      name="Group"
      :value="clauseIndex"
      v-model="checked"
      @update:modelValue="onCheckGroupChange"
      data-testid="group-checkbox"
      v-tooltip="'Select to create boolean subgroup'"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, computed } from "vue";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Bool, Match, Where } from "@/interfaces/AutoGen";
import { checkGroupChange, getBooleanOptions, isGroupable, hasBoolGroups, updateBooleans, updateFocusConcepts } from "@/helpers/IMQueryBuilder";

interface Props {
  isVariable?: boolean;
  depth: number;
  rootBool?: boolean;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  from?: Match;
  parentOperator?: Bool;
  hasSubgroups?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const emit = defineEmits(["updateOperator", "activateInput", "navigateTo"]);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const group: Ref<number[]> = ref([]);
const checked = ref(false);
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);

function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateOperator",val);
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.clauseIndex);
}
</script>

<style scoped>
.operator-selector {
  min-height: 100%;
  width: 6.5rem;
}
.operator-selector-not {
  min-height: 100%;
  width: 6.5rem;
}
.operator-selector-subgroups {
  min-height: 100%;
  width: 14.5rem;
}

.drag-drop {
  min-height: 100%;
  width: 2rem;
}
.group-checkbox {
  height: 100%;
  width: 2rem;
}

::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0rem;
  margin-right: 0;
}

::v-deep(.operator-selector .p-select-dropdown) {
  padding-left: 0;
  margin-left: 0;
}

::v-deep(.operator-selector-not .p-select-label) {
  color: var(--p-red-500) !important;
  font-size: 0.85rem;
}
</style>
