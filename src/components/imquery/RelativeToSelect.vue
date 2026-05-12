<template>
  <Select
    :modelValue="relativeTo"
    :options="relativeToOptions"
    data-testid="operator-selector"
    option-label="label"
    option-value="value"
    scroll-height="50rem"
    @update:modelValue="updateRelativeTo"
  >
    <template #option="slotProps">
      <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
        <div>{{ slotProps.option.label }}</div>
      </div>
    </template>
  </Select>
  <span v-if="relativeToOptions.length === 0">Nothing to compare with. You may need to add a keep as reference to another clause to compare with.</span>

  <template v-if="relativePropertyOptions && relativePropertyOptions.length > 0">
    <span class="field">Select property:</span>
    <Select
      :modelValue="relativeProperty"
      :options="relativePropertyOptions"
      data-testid="operator-selector"
      option-label="label"
      option-value="value"
      scroll-height="50rem"
      @update:modelValue="updateRelativeProperty"
    >
      <template #option="slotProps">
        <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
  </template>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref, watch } from "vue";

import type { Match, UIProperty, Where } from "@endeavour/vue-library/interfaces";

import { getRelativePropertyOptions, getRelativeToOptions, injectReturn } from "@/helpers/buildQuery";

interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
  from?: Match;
}

const props = defineProps<Props>();
const assignable = defineModel<Where>("assignable", { default: {} });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const relativeTo: Ref<string | undefined> = ref();
const keepAs = inject("keepAs") as Ref<Record<string, Match>>;
const relativeToOptions = computed(() => getRelativeToOptions(props.uiProperty.valueType, keepAs.value));
const relativeProperty: Ref<string> = ref("");
const relativePropertyOptions: Ref<any[]> = ref([]);
const relativeMatch: Ref<Match | undefined> = ref();

onMounted(() => {
  initValues();
});

watch(
  () => assignable.value,
  () => initValues()
);

async function updateRelativeTo(relativeTo: string) {
  if (!assignable.value.compare) assignable.value.compare = {};
  if (!assignable.value.compare.right) assignable.value.compare.right = {};
  relativeMatch.value = keepAs.value[relativeTo];
  if (relativeMatch.value) {
    assignable.value.compare.right.nodeRef = relativeMatch.value.node;
    delete assignable.value.compare.right.parameter;
    relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch.value, props.uiProperty.valueType);
    relativeProperty.value = relativePropertyOptions.value[0].value;
  } else {
    assignable.value.compare.right.parameter = relativeTo;
    delete assignable.value.compare.right.nodeRef;
  }
  emit("updateCompare");
}

function updateRelativeProperty(relativeIri: any) {
  if (assignable.value.compare && assignable.value.compare.right) {
    const right = assignable.value.compare.right;
    if (relativeMatch.value) {
      right.iri = relativeIri;
      relativeProperty.value = relativeIri;
      const ref = relativeIri.substring(relativeIri.lastIndexOf("#") + 1);
      injectReturn(relativeMatch.value, relativeIri, ref);
      emit("updateCompare");
    }
  }
}

function cancel() {
  showTreeSearch.value = false;
}

async function initValues() {
  if (assignable.value.compare && assignable.value.compare.right) {
    if (assignable.value.compare.right.parameter) {
      relativeTo.value = relativeToOptions.value.find(opt => opt.value === assignable.value.compare!.right!.parameter!).value;
    } else if (assignable.value.compare.right.nodeRef) {
      relativeMatch.value = keepAs.value[assignable.value.compare.right.nodeRef];
      relativeTo.value = assignable.value.compare.right.nodeRef;
      if (assignable.value.compare.right.iri) relativeProperty.value = assignable.value.compare.right.iri;
      relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch.value, props.uiProperty.valueType);
    } else relativeTo.value = relativeToOptions.value[0].value;
  }
}
</script>

<style scoped>
.field {
  padding-left: 1rem;
  padding-right: 1.5rem;
}
</style>
