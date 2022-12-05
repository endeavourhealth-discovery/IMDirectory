<template>
  <Card>
    <template #title>Query contents</template>
    <template #content>
      <Tree
        :value="(queryNodes as unknown as TreeNode[])"
        selectionMode="single"
        @node-select="nodeSelect"
        :expandedKeys="expandedKeys"
        v-model:selectionKeys="selectedKey"
      >
      </Tree>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { QueryObject } from "im-library/interfaces";
import { TreeNode } from "primevue/tree";
import { PropType, ref, watch } from "vue";
import _ from "lodash";

const props = defineProps({ queryNodes: { type: Object as PropType<QueryObject[]>, required: true }, selectedNodeKey: { type: Number, required: true } });
const emits = defineEmits({ selected: (_payload: any) => true });
const expandedKeys = ref<any>({});
const selectedKey = ref<any>({});

watch(
  () => _.cloneDeep(props.queryNodes),
  newValue => {
    expandAll();
  }
);

watch(
  () => props.selectedNodeKey,
  newValue => {
    selectedKey.value[newValue.toString()] = true;
    selectedKey.value = { ...selectedKey.value };
  }
);

function expandAll() {
  for (let node of props.queryNodes) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
}
function expandNode(node: any) {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
}

function nodeSelect(node: any) {
  emits("selected", node);
}
</script>

<style scoped></style>
