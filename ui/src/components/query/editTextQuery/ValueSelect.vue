<template>
  Value:
  <InputText v-if="isObjectHasKeys(selectedProperty.data, ['http://www.w3.org/ns/shacl#class'])" type="text" @click="visible = true" />
  <InputText v-else-if="isObjectHasKeys(selectedProperty.data, ['http://www.w3.org/ns/shacl#datatype'])" type="text" />
  <EntitySearch v-else :entity-value="entityValue" />
  <Dialog v-model:visible="visible" modal header="Header" :style="{ width: '50vw' }">
    {{ selectedProperty.data }}
    <Tree
      :value="nodes"
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
      <Button class="action-button" severity="secondary" label="Cancel" @click="visible = false"></Button>
      <Button class="action-button" label="Select" @click="select"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityReferenceNode, TTIriRef, TTProperty } from "@im-library/interfaces";
import { TTAlias, Where } from "@im-library/interfaces/AutoGen";
import { IM, SHACL } from "@im-library/vocabulary";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import EntitySearch from "./EntitySearch.vue";

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: true }
});
const visible: Ref<boolean> = ref(false);
const selectedKey = ref(undefined);
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);
const expandedKeys: Ref<any> = ref({});
const nodes: Ref<TreeNode[]> = ref([]);
const entityValue: Ref<TTAlias> = ref({} as TTAlias);
const emit = defineEmits({ onCancel: () => true, onSelect: (payload: any) => payload });

onMounted(async () => {
  // TODO get tree from set/query
  const classIri = (props.selectedProperty.data as TTProperty)["http://www.w3.org/ns/shacl#class"]![0]["@id"];
  nodes.value = await getTreeNodes(classIri, { children: [] });
});

async function getTreeNodes(iri: string, parent: TreeNode): Promise<TreeNode[]> {
  const children = await EntityService.getEntityChildren(iri);
  for (const child of children) {
    parent.children?.push(buildClassTreeNode(child, parent));
  }

  return parent.children!;
}

function selectNode(node: TreeNode) {
  selectedNode.value = node;
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

function getKey(parent: TreeNode) {
  if (!parent) return "0";
  return parent.key! + parent.children!.length;
}

async function expandNode(node: TreeNode) {
  if (!isArrayHasLength(node.children)) {
    node.children = await getTreeNodes(node.data.iri, node);
  }
}

function cancel() {
  emit("onCancel");
}

function select() {
  emit("onSelect", selectedNode.value);
  emit("onCancel");
}
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
F
