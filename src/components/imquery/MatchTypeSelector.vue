<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Select a cohort, type of entry, or property"
    :pt="{
      root: { style: 'z-index: 1500 !important;' }
    }"
    :style="{ width: '40vw', height: '70vh', minWidth: '20vw', minHeight: '20vh' }"
    class="search-dialog"
    @update:visible="handleClose"
  >
    <div id="tree-container" @click.stop>
      <Tree
        v-model:expandedKeys="expandedKeys"
        :selectionKeys="selectedNodeKey"
        :loading="loading"
        :value="data"
        icon="loading"
        @node-expand="onNodeExpand"
        @node-collapse="onNodeCollapse"
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
    <template #footer>
      <div class="button-footer">
        <Button label="Cancel" @click="handleClose" />
      </div>
    </template>
  </Dialog>
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

const visible = defineModel<boolean>("visible");

const props = defineProps<{
  baseType: Node;
}>();

const emit = defineEmits<{
  (event: "node-selected", query: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "onCancel", visible: boolean): void;
}>();

const loading = ref(false);
const data: Ref<TreeNode[]> = ref([]);
const expandedKeys = ref<Record<string, boolean>>({});

const onNodeSelect = (node: any) => {
  if (node.selectable) {
    emit("node-selected", node);
  }
};

const handleClose = () => {
  visible.value = false;
  emit("onCancel", false);
};
const selectedNodeKey = ref<TreeSelectionKeys | undefined>(undefined);

watch(
  () => props.baseType,
  async () => await createFeatureTree()
);

onMounted(async () => {
  expandedKeys.value = {};
  await createFeatureTree();
});

async function onNodeExpand(node: TreeNode) {
  if (node.children && node.children.length > 0) {
    loading.value = true;
    for (const child of node.children) {
      if (child.children && !child.children.length) {
        child.loading = true;
        if (child.data.range) await createPropertyTree(child.data.range, child, false);
        child.loading = false;
      }
    }
    loading.value = false;
  } else if (node.data.range) {
    loading.value = true;
    await createPropertyTree(node.data.range, node, false);
    loading.value = false;
  }
}

function onNodeCollapse(node: TreeNode) {
  expandedKeys.value = { ...expandedKeys.value, [node.key]: false };
  for (const key of Object.keys(expandedKeys.value)) {
    if (key.toString().startsWith(node.key!)) {
      delete expandedKeys.value[key];
    }
  }
}
async function createPropertyTree(iri: string, parent: TreeNode, pathsOnly: boolean) {
  const entity = await DataModelService.getDataModelProperties(iri, pathsOnly);
  const propertyList = [] as TreeNode[];
  if (entity.property && isArrayHasLength(entity.property)) {
    for (const [index, property] of entity.property.entries()) {
      if (!isBase(property)) propertyList.push(createPropertyNode(index.toString(), property, parent, null));
    }
    if (propertyList.length > 0) parent.children = propertyList;
  }
}

async function createFeatureTree() {
  loading.value = true;
  data.value.push(createNode("0", "Add a cohort as feature", "cohort", "cohort", IM.QUERY, "", null, null));
  data.value.push(createNode("1", "Add " + props.baseType.name + " features", "features", "folder", IM.FOLDER, "", null, null));
  data.value[0].selectable = true;
  await createPropertyTree(props.baseType.iri!, data.value[1], false);
  expandedKeys.value = { 1: true };
  loading.value = false;
}

function isBase(property: PropertyShape): boolean {
  if (property.node) {
    if (property.node.iri === props.baseType.iri) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function createNode(
  index: string,
  conceptName: string | undefined,
  conceptIri: string,
  type: string,
  iconType: string,
  rangeType: string,
  parent: TreeNode | null,
  pathMatch: Match | null
): TreeNode {
  const key = parent === null ? index : parent.key + "_" + index;
  const node = {
    key: key,
    label: conceptName,
    expanded: false,
    data: {
      typeIcon: getFAIconFromType([{ iri: iconType }]),
      color: getColourFromType([{ iri: iconType }]),
      iri: conceptIri,
      match: pathMatch
    },
    loading: false,
    children: [] as TreeNode[],
    parentNode: parent,
    type: type
  } as TreeNode;
  if (rangeType != "") {
    node.data.rangeTypeIcon = getFAIconFromType([{ iri: rangeType }]);
    node.data.rangeTypeColor = getColourFromType([{ iri: rangeType }]);
  }
  return node;
}

function createGroupNode(index: string, property: PropertyShape, parent: TreeNode, pathMatch: Match | null): TreeNode {
  loading.value = true;
  const name = property.group!.name;
  const groupNode = createNode(index, name, property.group!.iri, "folder", IM.FOLDER, "", parent, pathMatch) as TreeNode;
  if (property.property) {
    const propertyList = [] as TreeNode[];
    for (const [propertyIndex, groupedProperty] of property.property.entries()) {
      propertyList.push(createPropertyNode(propertyIndex.toString(), groupedProperty, groupNode, pathMatch));
    }
    groupNode.children = propertyList;
  }
  loading.value = true;
  groupNode.selectable = false;
  return groupNode;
}

function createPropertyNode(index: string, property: PropertyShape, parent: TreeNode, pathMatch: Match | null): TreeNode {
  if (property.group) {
    return createGroupNode(index, property, parent, pathMatch);
  }
  let rangeType = "";
  if (property.clazz) {
    rangeType = property.clazz.type!.iri;
  } else if (property.node) {
    rangeType = property.node.type!.iri;
  }

  let name = "";
  if (property.path.name) name = property.path.name;
  if (property.hasValue) {
    const value = property.hasValueType?.iri === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
    name += ` (${value})`;
  }
  const propertyNode = createNode(index, name!, property.path.iri, "property", RDF.PROPERTY, rangeType, parent, pathMatch);
  propertyNode.selectable = true;
  if (property.node) {
    propertyNode.data.range = property.node.iri;
    propertyNode.data.rangeName = property.node.name;
  }
  return propertyNode;
}
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
