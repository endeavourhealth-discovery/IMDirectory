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

  <template v-if="relativePropertyOptions && relativePropertyOptions.length > 0 && where.compare && where.compare.iri">
    <span class="field">Select property:</span>
    <TreeSelect
      v-model="relativeProperty"
      v-model:expandedKeys="expandedKeys"
      :options="relativePropertyOptions"
      :placeholder="relativeLabel"
      option-label="label"
      scroll-height="50rem"
      @node-expand="expandNode"
      @update:modelValue="updateRelativeProperty"
    >
    </TreeSelect>
  </template>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref, watch } from "vue";

import { DisplayMode } from "@endeavour/vue-library";
import type { Node, Query, Where } from "@endeavour/vue-library/models";

import { TreeNode } from "primevue/treenode";

import {
  addFrom,
  deleteReturn,
  expandPropertyNode,
  getNodeFromKey,
  getRelativePropertyOptions,
  getRelativeToOptions,
  injectReturn,
  setPathGetNodeRef
} from "@/helpers/buildQuery";
import { type UIProperty } from "@/models";
import { QueryService } from "@/services";

interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
  from?: Query;
  baseType: Node;
}

const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const match = defineModel<Query>("match", { required: true });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const expandedKeys = ref<Record<string, boolean>>({});
const relativeTo: Ref<string | undefined> = ref();
const keepAs = inject("keepAs") as Ref<Record<string, Query>>;
const relativeToOptions = computed(() => getRelativeToOptions(props.uiProperty.valueType, keepAs.value));
const relativeProperty = ref();
const relativePropertyOptions: Ref<TreeNode[]> = ref([]);
const relativeLabel = ref();
onMounted(() => {
  initValues();
});

watch(
  () => where.value,
  () => initValues()
);

async function expandNode(node: TreeNode) {
  await expandPropertyNode(node, props.uiProperty.valueType);
}

async function updateRelativeTo(relative: string) {
  relativeTo.value = relative;
  if (!where.value.compare) where.value.compare = {};
  if (!where.value.compare) where.value.compare = {};
  const relativeMatch: Query | undefined = keepAs.value[relativeTo.value];
  if (relativeMatch) {
    where.value.compare.nodeRef = relativeMatch.as;
    addFrom(match.value, relativeMatch.as!);
    delete where.value.compare.parameter;
    relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch, props.uiProperty.valueType, keepAs.value, props.baseType.iri!);
    if (relativePropertyOptions.value.length === 0) {
      return;
    }
  } else {
    where.value.compare.parameter = relativeTo.value;
    delete where.value.compare.nodeRef;
  }
  emit("updateCompare");
}

async function updateRelativeProperty(selection: any) {
  const key = Object.keys(selection)[0];
  const node = getNodeFromKey(key, relativePropertyOptions.value);
  if (!node) return;
  const relativeIri = node.data.iri;
  if (relativeTo.value) {
    if (where.value.compare) {
      const right = where.value.compare;
      const relativeMatch = keepAs.value[relativeTo.value];
      if (relativeMatch) {
        if (relativeMatch.return && right.iri) deleteReturn(relativeMatch, right.iri, right.propertyRef);
        const nodeRef = node.data.path ? setPathGetNodeRef(relativeMatch, node.data.path, true) : undefined;
        right.iri = relativeIri;
        relativeProperty.value = relativeIri;
        relativeLabel.value = node.label;

        const newReturn = injectReturn(relativeMatch, relativeIri, nodeRef);
        right.propertyRef = newReturn.as;
        const updatedMatch = await QueryService.getQueryDisplayFromQuery(relativeMatch, DisplayMode.ORIGINAL);
        Object.assign(keepAs.value[relativeTo.value], updatedMatch);
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
    if (where.value.compare) {
      if (where.value.compare.parameter) {
        relativeTo.value = relativeToOptions.value.find(opt => opt.value === where.value.compare!.parameter!).value;
      } else if (where.value.compare.nodeRef) {
        const relativeMatch = keepAs.value[where.value.compare.nodeRef];
        relativeTo.value = where.value.compare.nodeRef;
        if (relativeMatch) {
          relativePropertyOptions.value = await getRelativePropertyOptions(relativeMatch, props.uiProperty.valueType, keepAs.value, props.baseType.iri!);
          if (where.value.compare.name) {
            relativeLabel.value = where.value.compare.name;
          }
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
