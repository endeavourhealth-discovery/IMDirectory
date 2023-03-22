<template>
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
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" label="Select" @click="select"></Button>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TableQuery, TTIriRef } from "@im-library/interfaces";
import { Where } from "@im-library/interfaces/AutoGen";
import { IM, SHACL } from "@im-library/vocabulary";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";

interface TTProperty {
  "http://www.w3.org/ns/shacl#order": number;
  "http://www.w3.org/ns/shacl#path": TTIriRef[];
  "http://www.w3.org/ns/shacl#group"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#class"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#datatype"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#node"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#function"?: TTIriRef[];
  "http://endhealth.info/im#inversePath"?: TTIriRef[];
  "http://www.w3.org/ns/shacl#maxCount"?: number;
  "http://www.w3.org/ns/shacl#minCount"?: number;
}

const props = defineProps({
  queryData: { type: Array<TableQuery>, required: true },
  from: { type: Object as PropType<TableQuery>, required: true },
  selected: { type: Array<TableQuery>, required: true },
  level: { type: Number, required: false, default: 0 }
});

const selectedKey = ref(undefined);
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);
const expandedKeys: Ref<any> = ref({});
const nodes: Ref<TreeNode[]> = ref([]);
const emit = defineEmits({ onCancel: () => true, onSelect: (payload: any) => payload });

onMounted(async () => {
  nodes.value = await getTreeNodes(props.from.data["@id"], { children: [] });
});

async function getTreeNodes(dataModelIri: string, parent: TreeNode): Promise<TreeNode[]> {
  const entity = await EntityService.getPartialEntity(dataModelIri, [SHACL.PROPERTY]);
  const dataModelProperties = entity[SHACL.PROPERTY];
  const groupMap = new Map<string, TreeNode>();
  for (const property of dataModelProperties) {
    if (isObjectHasKeys(property, [SHACL.GROUP])) {
      addGroup(groupMap, property, parent.children!);
    } else {
      const propertyTreeNode = buildPropertyTreeNode(property, parent);
      addDataModel(property, propertyTreeNode);
      parent.children?.push(propertyTreeNode);
    }
  }

  return parent.children!;
}

function selectNode(node: TreeNode) {
  selectedNode.value = node;
}

function addGroup(groupMap: Map<string, TreeNode>, property: TTProperty, treeNodes: TreeNode[]) {
  const group = property["http://www.w3.org/ns/shacl#group"]![0];
  const treeNode = groupMap.get(group["@id"]);
  if (treeNode) {
    const propertyTreeNode = buildPropertyTreeNode(property, treeNode);
    addDataModel(property, propertyTreeNode);
    treeNode.children?.push(propertyTreeNode);
  } else {
    const newGroup = buildGroupTreeNode(group.name, String(treeNodes.length), {});
    const propertyTreeNode = buildPropertyTreeNode(property, newGroup);
    addDataModel(property, propertyTreeNode);
    newGroup.children?.push(propertyTreeNode);
    treeNodes.push(newGroup);
    groupMap.set(group["@id"], newGroup);
  }
}

function addDataModel(property: TTProperty, propertyTreeNode: TreeNode) {
  if ("node" === propertyTreeNode.type) {
    const dataModelTreeNode = buildDataModelTreeNode(property, propertyTreeNode);
    propertyTreeNode.children?.push(dataModelTreeNode);
  }
}

function buildDataModelTreeNode(property: TTProperty, parent: TreeNode) {
  const imtype = { "@id": SHACL.NODESHAPE } as TTIriRef;

  return {
    key: getKey(parent),
    label: property["http://www.w3.org/ns/shacl#node"]![0].name,
    data: property,
    type: "dataModel",
    icon: getFAIconFromType([imtype]) as any,
    leaf: false,
    children: [],
    selectable: false,
    parent: parent
  } as TreeNode;
}

function buildGroupTreeNode(label: string, key: string, parent: TreeNode) {
  return {
    key: key,
    label: label,
    type: "group",
    icon: "fa-solid fa-layer-group",
    children: [],
    selectable: false,
    parent: parent
  } as TreeNode;
}

function buildPropertyTreeNode(property: TTProperty, parent: TreeNode) {
  // "http://www.w3.org/ns/shacl#datatype" "http://www.w3.org/ns/shacl#class" "http://www.w3.org/ns/shacl#node"
  const imtype = { "@id": IM.NAMESPACE + "Property" } as TTIriRef;
  let type;
  if (isObjectHasKeys(property, [SHACL.DATATYPE])) type = "datatype";
  else if (isObjectHasKeys(property, [SHACL.CLASS])) type = "class";
  else if (isObjectHasKeys(property, [SHACL.NODE])) type = "node";

  return {
    key: getKey(parent),
    label: property["http://www.w3.org/ns/shacl#path"][0].name,
    data: property,
    type: type,
    icon: getFAIconFromType([imtype]) as any,
    leaf: "node" === type ? false : true,
    children: [],
    parent: parent
  } as TreeNode;
}

function getKey(parent: TreeNode) {
  if (!parent) return "0";
  return parent.key! + parent.children!.length;
}

async function expandNode(node: TreeNode) {
  if (!isArrayHasLength(node.children) && "dataModel" === node.type) {
    const iri = (node.data as TTProperty)["http://www.w3.org/ns/shacl#node"]![0]["@id"];
    node.children = await getTreeNodes(iri, node);
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
