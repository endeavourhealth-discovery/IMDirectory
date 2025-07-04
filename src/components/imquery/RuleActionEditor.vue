<template>
  <Select
    :modelValue="ruleAction"
    :options="getRuleActionOptions()"
    option-label="label"
    option-value="value"
    data-testid="operator-selector"
    scroll-height="40rem"
    @update:modelValue="val => updateRuleAction(val)"
  >
    <template #option="slotProps">
      <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem" v-html="slotProps.option.label" />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value" v-html="getRuleActionLabel(slotProps.value)"></div>
      <span v-else class="p-placeholder">Select an item</span>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { getRuleActionOptions, getRuleAction, setRuleAction, getRuleActionLabel } from "@/helpers/IMQueryBuilder";
import { Match } from "@/interfaces/AutoGen";
import { onMounted, ref, Ref, watch } from "vue";

const ruleAction: Ref<string> = ref("");
const match = defineModel<Match>("rule", { default: {} });

watch(match, (newValue, oldValue) => {
  if (newValue != oldValue) {
    ruleAction.value = getRuleAction(newValue);
  }
});

onMounted(() => {
  ruleAction.value = getRuleAction(match.value);
});

function updateRuleAction(value: string) {
  setRuleAction(match.value, value);
}
</script>

<style scoped></style>
