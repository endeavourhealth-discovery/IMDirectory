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
  >
  </TreeSelect>
</template>

<script setup lang="ts">
import { Where, Query } from "@/interfaces/AutoGen";
import type { TreeNode } from "primevue/treenode";
import { Ref, inject, onMounted, ref, watch } from "vue";
import { useRelationTree } from "@/composables/useRelationTree";
import { UIProperty } from "@/interfaces";
import { updateRelativeTo } from "@/helpers/buildQuery";
interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
}

const props = defineProps<Props>();
const { createRelationTree, collapseNode, getDefaultTarget, expandedKeys, loading } = useRelationTree();
const property = defineModel<Where>("property", { default: {} });
const emit = defineEmits(["updateCompare"]);
const showTreeSearch: Ref<boolean> = ref(false);
const variableOptions: Ref<TreeNode[]> = ref([]);
const query = inject("query") as Ref<Query>;
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

async function initValues() {
  nodes.value = await createRelationTree(query.value, props.uiProperty.valueType);
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
