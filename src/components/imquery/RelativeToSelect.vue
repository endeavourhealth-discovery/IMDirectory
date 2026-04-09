<template>
  <Select
    :modelValue="relativeTo"
    :options="relativeToOptions"
    scroll-height="50rem"
    option-label="label"
    option-value="value"
    data-testid="operator-selector"
    @update:modelValue="updateRelativeTo"
  >
    <template #option="slotProps">
      <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
        <div>{{ slotProps.option.label }}</div>
      </div>
    </template>
  </Select>
  <span v-if="relativeProperty" class="field">Select property:</span>
  <Select
    v-if="relativeProperty"
    :modelValue="relativeProperty"
    :options="relativePropertyOptions"
    scroll-height="50rem"
    option-label="label"
    option-value="value"
    data-testid="operator-selector"
    @update:modelValue="updateRelativeProperty"
  >
    <template #option="slotProps">
      <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
        <div>{{ slotProps.option.label }}</div>
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { Where, Query, Match, UIProperty } from "@/interfaces/AutoGen";
import type { TreeNode } from "primevue/treenode";
import { Ref, inject, onMounted, ref, watch, computed } from "vue";
import { getRelativeToOptions, getRelativePropertyOptions } from "@/helpers/buildQuery";

interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
  from?: Match;
}

const props = defineProps<Props>();
const assignable = defineModel<Where>("assignable", { default: {} });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const variableOptions: Ref<TreeNode[]> = ref([]);
const nodes: Ref<TreeNode[] | undefined> = ref();
const relativeTo: Ref<string | undefined> = ref();
const keepAs = inject("keepAs") as Ref<Match[]>;
const relativeToOptions = computed(() => getRelativeToOptions(keepAs.value));
const relativeProperty: Ref<string> = ref("");
const relativePropertyOptions: Ref<any[]> = ref([]);
onMounted(() => {
  initValues();
});

watch(
  () => assignable.value,
  () => initValues()
);

async function updateRelativeTo(relativeTo: any) {
  if (!assignable.value.compare) assignable.value.compare = {};
  if (!assignable.value.compare.right) assignable.value.compare.right = {};
  const relativeMatch = keepAs.value.find(match => match.node === relativeTo.value);
  if (relativeMatch) {
    assignable.value.compare.right.nodeRef = relativeMatch.node;
    delete assignable.value.compare.right.parameter;
    relativePropertyOptions.value = await getRelativePropertyOptions(keepAs.value, assignable.value.compare.right.nodeRef!, props.uiProperty.valueType);
  } else {
    assignable.value.compare.right.parameter = relativeTo.value;
    delete assignable.value.compare.right.nodeRef;
  }
  emit("updateCompare");
}

function updateRelativeProperty(relativeIri: any) {
  if (assignable.value.compare && assignable.value.compare.right) {
    assignable.value.compare.right.iri = relativeIri;
    relativeProperty.value = relativeIri;
    emit("updateCompare");
  }
}

function cancel() {
  showTreeSearch.value = false;
}

async function initValues() {
  if (assignable.value.compare && assignable.value.compare.right) {
    if (assignable.value.compare.right.parameter) {
      relativeTo.value = getRelativeToOptions(keepAs.value).find(opt => opt.value === assignable.value.compare!.right!.parameter!).value;
    } else if (assignable.value.compare.right.nodeRef) {
      relativeTo.value = getRelativeToOptions(keepAs.value).find(opt => opt.value === assignable.value.compare!.right!.nodeRef!).value;
      if (assignable.value.compare.right.iri) relativeProperty.value = assignable.value.compare.right.iri;
      relativePropertyOptions.value = await getRelativePropertyOptions(keepAs.value, assignable.value.compare.right.nodeRef, props.uiProperty.valueType);
    }
  }
}
</script>

<style scoped>
.field {
  padding-left: 1rem;
  padding-right: 1.5rem;
}
</style>
