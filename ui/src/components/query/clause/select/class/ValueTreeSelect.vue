<template>
  <Tree
    :value="nodes"
    selectionMode="single"
    v-model:selectionKeys="selectedKey"
    @node-select="selectNode"
    :expanded-keys="expandedKeys"
    @node-expand="expandNode"
  >
    <template #default="{ node }: { node: TreeNode }">
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
import { getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { EntityReferenceNode } from "@im-library/interfaces";
import { TreeNode } from "primevue/tree";
import { Ref, onMounted, ref, watch } from "vue";
const emit = defineEmits({ onSelect: (payload: TreeNode) => payload, close: () => true });

const props = defineProps({
  classIri: { type: String, required: true }
});
const nodes: Ref<TreeNode[]> = ref([]);
const selectedKey = ref(undefined);
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);

const expandedKeys: Ref<any> = ref({});

function selectNode(node: TreeNode) {
  selectedNode.value = node;
  emit("onSelect", selectedNode);
}

async function expandNode(node: TreeNode) {
  if (!isArrayHasLength(node.children)) {
    node.children = await getTreeNodes(node.data.iri, node);
  }
}

async function getTreeNodes(iri: string, parent: TreeNode): Promise<TreeNode[]> {
  const children = await EntityService.getEntityChildren(iri);
  for (const child of children) {
    parent.children?.push(buildClassTreeNode(child, parent));
  }

  return parent.children!;
}

function getKey(parent: TreeNode) {
  if (!parent) return "0";
  return parent.key! + parent.children!.length;
}

function buildClassTreeNode(entityReferenceNode: EntityReferenceNode, parent: TreeNode): TreeNode {
  return {
    key: getKey(parent),
    label: entityReferenceNode.name,
    type: "class",
    icon: getFAIconFromType(entityReferenceNode.type) as any,
    children: [],
    leaf: entityReferenceNode.hasChildren,
    data: entityReferenceNode,
    parent: parent
  };
}

function select() {
  selectedNode.value;
}
onMounted(async () => {
  nodes.value = await getTreeNodes(props.classIri, { children: [] });
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
