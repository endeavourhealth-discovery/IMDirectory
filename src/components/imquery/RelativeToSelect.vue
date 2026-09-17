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

import { DisplayMode } from "@endeavour/vue-library";
import type { Query, Where } from "@endeavour/vue-library/models";

import { addFrom, getRelativePropertyOptions, getRelativeToOptions, injectReturn } from "@/helpers/buildQuery";
import { type UIProperty } from "@/models";
import { QueryService } from "@/services";

interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
  from?: Query;
}

const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const match = defineModel<Query>("match", { required: true });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const relativeTo: Ref<string | undefined> = ref();
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Query>>>;
const relativeToOptions = computed(() => getRelativeToOptions(props.uiProperty.valueType, keepAs.value));
const relativeProperty: Ref<string> = ref("");
const relativePropertyOptions: Ref<any[]> = ref([]);

onMounted(() => {
  initValues();
});

watch(
  () => where.value,
  () => initValues()
);

async function updateRelativeTo(relative: string) {
  relativeTo.value = relative;
  if (!where.value.compare) where.value.compare = {};
  if (!where.value.compare.right) where.value.compare.right = {};
  const relativeMatch: Ref<Query> = keepAs.value[relativeTo.value];
  if (relativeMatch) {
    where.value.compare.right.nodeRef = relativeMatch.value.as;
    addFrom(match.value, relativeMatch.value.as!);
    delete where.value.compare.right.parameter;
    relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch.value, props.uiProperty.valueType);
    if (relativePropertyOptions.value.length === 0) {
      return;
    }
    relativeProperty.value = relativePropertyOptions.value[0].value;
    await updateRelativeProperty(relativeProperty.value);
  } else {
    where.value.compare.right.parameter = relativeTo.value;
    delete where.value.compare.right.nodeRef;
  }
  emit("updateCompare");
}

async function updateRelativeProperty(relativeIri: any) {
  if (relativeTo.value) {
    if (where.value.compare && where.value.compare.right) {
      const right = where.value.compare.right;
      const relativeMatch = keepAs.value[relativeTo.value];
      if (relativeMatch) {
        right.iri = relativeIri;
        relativeProperty.value = relativeIri;
        const ref = relativeIri.substring(relativeIri.lastIndexOf("#") + 1);
        injectReturn(relativeMatch.value, relativeIri, ref);
        const relativeMatchAsQuery = relativeMatch.value;
        const updatedMatch = await QueryService.getQueryDisplayFromQuery(relativeMatchAsQuery, DisplayMode.ORIGINAL);
        Object.assign(keepAs.value[relativeTo.value].value, updatedMatch);
        emit("updateCompare");
      }
    }
  }
}

function cancel() {
  showTreeSearch.value = false;
}

async function initValues() {
  if (relativeToOptions.value.length > 0) {
    if (where.value.compare && where.value.compare.right) {
      if (where.value.compare.right.parameter) {
        relativeTo.value = relativeToOptions.value.find(opt => opt.value === where.value.compare!.right!.parameter!).value;
      } else if (where.value.compare.right.nodeRef) {
        const relativeMatch = keepAs.value[where.value.compare.right.nodeRef];
        relativeTo.value = where.value.compare.right.nodeRef;
        if (where.value.compare.right.iri) relativeProperty.value = where.value.compare.right.iri;
        if (relativeMatch.value) {
          relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch.value, props.uiProperty.valueType);
        }
      } else relativeTo.value = relativeToOptions.value[0].value;
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
