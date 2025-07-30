<template>
  <div id="tree-container" @click.stop>
    <Tree
      v-model:expandedKeys="expandedKeys"
      :selectionKeys="selectedNodeKey"
      :loading="loading"
      :value="data"
      :lazy="true"
      icon="loading"
      @node-expand="expandNode"
      @node-collapse="collapseNode"
      @nodeSelect="onNodeSelect"
      selectionMode="single"
    >
      <template #default="{ node }: any">
        <div class="items-center">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <span class="tree-node-label">{{ node.label }}</span>
          <IMFontAwesomeIcon
            v-if="node.data.rangeTypeIcon && !node.loading"
            :icon="node.data.rangeTypeIcon"
            :style="'color:' + node.data.rangeTypeColor"
            class="mr-2"
            fixed-width
          />
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import type { TreeNode } from "primevue/treenode";
import { IM, RDF, RDFS } from "@/vocabulary";
import { PropertyShape, Match, Node } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { TreeSelectionKeys } from "primevue/tree";
import setupPropertyTree from "@/composables/setupPropertyTree";
import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";
import setupTree from "@/composables/setupTree";

const visible = defineModel<boolean>("visible");

const props = defineProps<{
  baseType: Node;
}>();

const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "onCancel", visible: boolean): void;
}>();

const data: Ref<TreeNode[]> = ref([]);
const { createFeatureTree, expandNode, collapseNode, expandedKeys, loading } = setupPropertyTree();
function onNodeSelect(node: any) {
  if (node.selectable) {
    emit("node-selected", node);
  }
}

const selectedNodeKey = ref<TreeSelectionKeys | undefined>(undefined);

watch(
  () => props.baseType,
  async () => {
    loading.value = true;
    data.value = await createFeatureTree(props.baseType);
    loading.value = false;
  }
);

onMounted(async () => {
  data.value = await createFeatureTree(props.baseType);
});

</script>

<style scoped>
#tree-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}
.tree-node-label {
  padding-right: 1rem;
}

.progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}
</style>
