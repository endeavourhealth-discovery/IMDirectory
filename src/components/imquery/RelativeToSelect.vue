<template>
  <div class="relative-to-select-dialog">
    <TreeSelect
      :model:value="selectedTarget"
      :options="nodes"
      :placeholder="defaultTargetLabel"
      :loading="loading"
      :expanded-keys="expandedKeys"
      selection-mode="single"
      @node-select="onNodeSelect"
    >
    </TreeSelect>
  </div>
</template>

<script setup lang="ts">
import { Where, Query } from "@/interfaces/AutoGen";
import type { TreeNode } from "primevue/treenode";
import { Ref, inject, onMounted, ref, watch } from "vue";
import setupRelationTree from "@/composables/setupRelationTree";
import { UIProperty } from "@/interfaces";
import { updateRelativeTo } from "@/composables/buildQuery";
interface Props {
  propertyIri: string;
  uiProperty: UIProperty;
}

const props = defineProps<Props>();
const { nodes, createRelationTree, collapseNode, getDefaultTarget, expandedKeys, loading } = setupRelationTree();
const property = defineModel<Where>("property", { default: {} });
const showTreeSearch: Ref<boolean> = ref(false);
const variableOptions: Ref<TreeNode[]> = ref([]);
const query = inject("query") as Ref<Query>;
const selectedTarget: Ref<TreeNode> = ref({ key: "" } as TreeNode);
const defaultTarget: Ref<TreeNode> = ref({ key: "" } as TreeNode);
const defaultTargetLabel: Ref<string> = ref("");
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
  }
}

async function initValues() {
  await createRelationTree(query.value, props.uiProperty.valueType);
  defaultTarget.value = getDefaultTarget(property.value!, nodes.value);
  defaultTargetLabel.value = defaultTarget.value.label!;
}
</script>

<style scoped>
.relative-to-select-dialog {
  display: flex;
  min-width: 25rem;
  flex-flow: column;
}
</style>
