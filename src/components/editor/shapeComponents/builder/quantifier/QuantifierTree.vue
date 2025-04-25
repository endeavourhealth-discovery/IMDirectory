<template>
  <div id="quantifier-tree-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selected"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      class="tree-root"
      :loading="loading"
    >
      <template #default="{ node }: any">
        <div class="tree-row">
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" fixed-width :style="'color:' + node.color" />
          </span>
          <ProgressSpinner v-else />
          <span>{{ node.label }}</span>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { EntityReferenceNode } from "@/interfaces";
import { TTIriRef } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { byKey } from "@/helpers/Sorters";
import { EntityService } from "@/services";
import type { TreeNode } from "primevue/treenode";
import { useToast } from "primevue/usetoast";

const props = defineProps<{
  quantifier?: TTIriRef;
  isAs: string[];
}>();

const emit = defineEmits<{
  treeNodeSelected: [payload: TTIriRef];
}>();

const toast = useToast();

const selected: Ref<any> = ref({});
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);
const root: Ref<TreeNode[]> = ref([]);
const loading = ref(true);
const expandedKeys: Ref<any> = ref({});

onMounted(async () => {
  loading.value = true;
  await addIsAsToRoot();
  if (props.quantifier) await findPathToNode(props.quantifier["@id"]);
  loading.value = false;
});

async function addIsAsToRoot() {
  for (const isA of props.isAs) {
    const asNode = await EntityService.getEntityAsEntityReferenceNode(isA);
    const hasNode = !!root.value.find(node => node.data === asNode["@id"]);
    if (!hasNode) root.value.push(createTreeNode(asNode.name, asNode["@id"], asNode.type, asNode.hasGrandChildren));
  }
  root.value.sort(byKey);
}

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean): TreeNode {
  return {
    key: conceptName,
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as TreeNode[]
  };
}

function onNodeSelect(node: any): void {
  selectedNode.value = node;
  emit("treeNodeSelected", { "@id": node.data, name: node.label } as TTIriRef);
}

async function onNodeExpand(node: any) {
  if (isObjectHasKeys(node)) {
    node.loading = true;
    const children = await EntityService.getEntityChildren(node.data);
    children.forEach(child => {
      if (!nodeHasChild(node, child)) node.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
    node.loading = false;
  }
}

function nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
  return !!node.children?.find(nodeChild => child["@id"] === nodeChild.data);
}

function selectKey(selectedKey: string) {
  Object.keys(selected.value).forEach(key => {
    selected.value[key] = false;
  });
  selected.value[selectedKey] = true;
}

async function findPathToNode(iri: string) {
  loading.value = true;
  let path = [] as any[];
  for (const isA of props.isAs) {
    const result = await EntityService.getPathBetweenNodes(iri, isA);
    if (isArrayHasLength(result)) path = result;
  }
  if (!isArrayHasLength(path)) {
    loading.value = false;
    return;
  }
  // Recursively expand
  let n = root.value.find(c => path.find(p => p["@id"] === c.data));
  let i = 0;
  if (n) {
    expandedKeys.value = {};
    while (n && n.data != path[0]["@id"] && i++ < 50) {
      selectKey(n.key!);
      if (!n.children || n.children.length == 0) {
        await onNodeExpand(n);
      }
      expandedKeys.value[n.key!] = true;

      // Find relevant child
      n = n.children?.find(c => path.find(p => p["@id"] === c.data));
    }

    if (n && n.data === path[0]["@id"]) {
      selectKey(n.key!);
      // Expand node if necessary
      if (!n.children || n.children.length == 0) {
        await onNodeExpand(n);
      }
      for (const gc of n.children!) {
        if (gc.data === iri) {
          selectKey(gc.key!);
        }
      }
      expandedKeys.value[n.key!] = true;
      selectedNode.value = n;
    } else {
      toast.add({
        severity: "warn",
        summary: "Unable to locate",
        detail: "Unable to locate concept in the current hierarchy"
      });
    }
    const container = document.getElementById("quantifier-tree-container") as HTMLElement;
    const highlighted = container.getElementsByClassName("p-tree-node-selected")?.[0];
    if (highlighted) highlighted.scrollIntoView();
  }
}
</script>

<style scoped>
#quantifier-tree-container {
  max-height: 30vh;
  display: flex;
  flex-flow: column nowrap;
}

.tree-root {
  height: 100%;
  overflow: auto;
  border: none;
  padding: 0;
}
.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.tree-row {
  width: 1.25em !important;
  height: 1.25em !important;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0rem !important;
  transition: box-shadow 3600s 3600s !important;
}
</style>
