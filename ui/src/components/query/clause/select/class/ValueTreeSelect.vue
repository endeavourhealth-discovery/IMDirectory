<template>
  <Tree
    :value="(nodes as any)"
    selectionMode="single"
    v-model:selectionKeys="selectedKey"
    @node-select="selectNode"
    :expanded-keys="expandedKeys"
    @node-expand="expandNode"
  >
    <template #default="{ node }">
      {{ node.label }}
    </template>
  </Tree>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('close')"></Button>
    <Button class="action-button" label="Select" @click="select"></Button>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { getKey } from "@im-library/helpers";
import { getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { EntityReferenceNode } from "@im-library/interfaces";
import { TreeNode } from "@im-library/interfaces/TreeNode";
import { TreeSelectionKeys } from "primevue/tree";
import { Ref, onMounted, ref } from "vue";
const emit = defineEmits({ onSelect: (payload: TreeNode) => payload, close: () => true });

const props = defineProps({
  classIri: { type: String, required: true }
});
const nodes: Ref<TreeNode[]> = ref([]);
const selectedKey: Ref<TreeSelectionKeys> = ref({} as TreeSelectionKeys);
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);

const expandedKeys: Ref<any> = ref({});

function selectNode(node: any) {
  selectedNode.value = node;
  emit("onSelect", selectedNode.value);
}

async function expandNode(node: any) {
  if (!isArrayHasLength(node.children)) {
    node.children = await getTreeNodes(node.data.iri, node);
  }
}

async function getTreeNodes(iri: string, parent: TreeNode): Promise<TreeNode[]> {
  const children = await EntityService.getEntityChildren(iri);
  if (!isArrayHasLength(parent.children)) parent.children = [];
  for (const child of children) {
    parent.children.push(buildClassTreeNode(child, parent));
  }

  return parent.children;
}

function buildClassTreeNode(entityReferenceNode: EntityReferenceNode, parent: TreeNode): TreeNode {
  return {
    key: getKey(parent),
    label: entityReferenceNode.name,
    type: "class",
    icon: getFAIconFromType(entityReferenceNode.type),
    children: [] as TreeNode[],
    leaf: entityReferenceNode.hasChildren,
    data: entityReferenceNode,
    parent: parent
  } as TreeNode;
}

function select() {
  selectedNode.value;
}
onMounted(async () => {
  nodes.value = await getTreeNodes(props.classIri, { children: [] as TreeNode[] } as TreeNode);
});
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
}
</style>
