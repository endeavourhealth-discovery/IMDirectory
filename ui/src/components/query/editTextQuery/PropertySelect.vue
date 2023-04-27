<template>
  <InputText type="text" @click="visible = true" v-model="selectedProperty.label" placeholder="Property" />
  <Dialog v-model:visible="visible" modal header="Property" :style="{ width: '50vw' }">
    <Tree
      :value="(nodes as any)"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      @node-select="selectNode"
      :expanded-keys="expandedKeys"
      @node-expand="expandNode"
    >
      <template #default="{ node }: { node: any}">
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
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { TreeNode } from "@im-library/interfaces";
import { TreeSelectionKeys } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import { getTreeNodes } from "@im-library/helpers/PropertyTreeNodeBuilder";
import { SHACL } from "@im-library/vocabulary";
import { IriLD, Node, Relationship } from "@im-library/interfaces/AutoGen";

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  property: { type: Object as PropType<TreeNode>, required: true },
  path: { type: Object as PropType<Relationship>, required: true }
});
const visible: Ref<boolean> = ref(false);
const selectedKey: Ref<TreeSelectionKeys> = ref({} as TreeSelectionKeys);
const selectedProperty: Ref<TreeNode> = ref({} as TreeNode);
const expandedKeys: Ref<any> = ref({});
const nodes: Ref<TreeNode[]> = ref([]);

onMounted(async () => {
  const iri = resolveIri(props.baseEntityIri);
  const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
  nodes.value = getTreeNodes(entity, { children: [] as TreeNode[] } as TreeNode);
  if (isObjectHasKeys(props.property.data, [SHACL.PATH])) {
    setSelectedProperty(nodes.value);
  }
});

async function setSelectedProperty(nodes: TreeNode[]) {
  const iri = props.property.data[SHACL.PATH][0]["@id"];
  const found = [] as TreeNode[];
  for (const node of nodes) {
    if (isObjectHasKeys(props.path)) findNodeWithPath(props.path, node, iri, found);
    else findNodeByIri(node, iri, found);
  }
  if (!isArrayHasLength(found)) {
    const foundDMIri = [] as string[];
    getLeafDataModelFromPath(props.path, foundDMIri);
    if (isArrayHasLength(foundDMIri)) {
      const dmIri = resolveIri(foundDMIri[0]);
      const entity = await EntityService.getPartialEntity(dmIri, [SHACL.PROPERTY]);
      const pathNodes = getTreeNodes(entity, { children: [] as TreeNode[] } as TreeNode);
      for (const node of pathNodes) {
        findNodeByIri(node, iri, found);
      }
    }
  }
  if (isArrayHasLength(found)) {
    const keys = {} as any;
    keys[found[0].label] = true;
    selectedKey.value = { ...keys };
    selectNode(found[0]);

    props.property.data = found[0].data;
    props.property.label = found[0].label;
    props.property.iri = found[0].iri;
  }
}

function selectNode(node: any) {
  selectedProperty.value = node;
}

async function expandNode(node: any) {
  if (!isArrayHasLength(node.children) && "dataModel" === node.type) {
    const iri = node.data[SHACL.NODE][0]["@id"];
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    node.children = getTreeNodes(entity, node);
  }
}

function select() {
  props.property.data = selectedProperty.value.data;
  visible.value = false;
}

function getLeafDataModelFromPath(pathOrNode: Relationship | Node, found: string[]) {
  if (isObjectHasKeys(pathOrNode, ["node"])) {
    getLeafDataModelFromPath((pathOrNode as Relationship).node, found);
  } else if (isObjectHasKeys(pathOrNode, ["path"])) {
    getLeafDataModelFromPath((pathOrNode as Node).path, found);
  } else {
    found.push(pathOrNode["@id"] || pathOrNode["@type"]);
  }
}

function findNodeWithPath(path: Relationship | Node, node: TreeNode, iri: string, nodes: TreeNode[]) {
  let pathIri = path["@id"] || path["@type"];
  pathIri = resolveIri(pathIri);
  const found = [] as TreeNode[];
  findNodeByIri(node, pathIri, found);
  if (isArrayHasLength(found)) {
    if (isObjectHasKeys(path, ["node"])) {
      findNodeWithPath((path as Relationship).node, found[0], iri, nodes);
    } else if (isObjectHasKeys(path, ["path"])) {
      findNodeWithPath((path as Node).path, found[0], iri, nodes);
    } else {
      findNodeByIri(found[0], iri, nodes);
    }
  }
}

function findNodeByIri(node: TreeNode, iri: string, nodes: TreeNode[]): void {
  if (node.iri === iri) {
    nodes.push(node);
  } else {
    if (!isArrayHasLength(node.children)) expandNode(node);
    if (isArrayHasLength(node.children)) {
      for (const child of node.children) {
        findNodeByIri(child, iri, nodes);
      }
    }
  }
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
