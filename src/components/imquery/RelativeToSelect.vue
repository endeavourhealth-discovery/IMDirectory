<template>
  <TreeSelect
    v-if="nodes?.length"
    v-model="selectedTarget"
    :options="nodes"
    :key="nodes.length"
    placeholder="compare to"
    :loading="loading"
    :expanded-keys="expandedKeys"
    selection-mode="single"
    @node-select="onNodeSelect"
    @nodeExpand="onNodeExpand"
  >
  </TreeSelect>
</template>

<script setup lang="ts">
import { Where, Query,Match } from "@/interfaces/AutoGen";
import type { TreeNode } from "primevue/treenode";
import { Ref, inject, onMounted, ref, watch } from "vue";
import { useRelationTree } from "@/composables/useRelationTree";
import {NodePropertyFilter} from "@/composables/useRelationTree";
import { UIProperty } from "@/interfaces";
import { updateRelativeTo } from "@/helpers/buildQuery";
interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
  from?: Match;
}

const props = defineProps<Props>();
const { createRelationTree, collapseNode, expandNode,getDefaultTarget, expandedKeys, loading } = useRelationTree();
const property = defineModel<Where>("property", { default: {} });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const variableOptions: Ref<TreeNode[]> = ref([]);
const nodes: Ref<TreeNode[] | undefined> = ref();
const selectedTarget = ref<Record<string, boolean>>({});

onMounted(async () => {
  await initValues();
});

watch(
  () => property.value,
  async () => await initValues()
);

function cancel() {
  showTreeSearch.value = false;
}

function onNodeSelect(node: any) {
  if (node.data && node.data.type != "nodeShape") {
    updateRelativeTo(property.value, node);
    emit("updateCompare", node);
  }
}

async function onNodeExpand(node: TreeNode) {
  await expandNode(node,{rangeType:props.uiProperty.valueType,rangeTypeName :props.uiProperty.valueLabel});
}

async function initValues() {
  const nodeFilter={
    skipProperty: props.uiProperty.iri,
    rangeType:props.uiProperty.valueType,
    rangeTypeName :props.uiProperty.valueLabel
  } as NodePropertyFilter;
  nodes.value = await createRelationTree(props.from &&props.from.typeOf ?props.from.typeOf.iri : undefined,nodeFilter);
  const key = getDefaultTarget(property.value!, nodes.value);
  selectedTarget.value = { [key]: true };
}
</script>

<style scoped>
.relative-to-select-dialog {
  display: flex;
  min-width: 25rem;
  flex-flow: column;
}
</style>
