<template>
  <Button
    icon="drag-icon fa-solid fa-grip-vertical"
    severity="secondary"
    text
    draggable="true"
    @dragstart="onDragStart($event, match, parentMatch)"
    @dragend="onDragEnd(match, parentMatch)"
  />
  <span v-if="parentOperator != Bool.rule">
    <div :class="parentOperator === 'not' ? 'operator-selector-not' : 'operator-selector'">
      <Select
        :disabled="parentGroup.length > 0 && (!parentGroup.includes(clauseIndex) || parentGroup.length === 1)"
        :modelValue="parentOperator"
        :options="getBooleanOptions(match, parentMatch!, parentOperator as Bool, 'Match', clauseIndex, true)"
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
      v-if="groupable(rootBool, parentMatch, parentOperator)"
      :disabled="parentGroup.length + 1 === (parentMatch[parentOperator as keyof typeof parentMatch] as Match[]).length && !parentGroup.includes(clauseIndex)"
      :inputId="'group' + clauseIndex"
      name="Group"
      :value="clauseIndex"
      v-model="parentGroup"
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
import { getBooleanOptions, getOperatorText, groupable, hasBoolGroups, updateBooleans, updateFocusConcepts } from "@/helpers/IMQueryBuilder";
import MatchClauseDisplay from "@/components/imquery/MatchClauseDisplay.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  rootBool?: boolean;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  from?: Match;
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const parentGroup = defineModel<number[]>("group", { default: [] });
const emit = defineEmits(["updateBool", "rationalise", "activateInput", "navigateTo"]);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const group: Ref<number[]> = ref([]);
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);


function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val, props.clauseIndex);
}


</script>

<style scoped>


.operator-selector {
  width: 6rem;
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
