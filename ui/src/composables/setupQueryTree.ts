import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/treenode";
import { ref, Ref } from "vue";
import rowClick from "./rowClick";
import { getKey, getParentNode } from "@im-library/helpers";
import { isObject } from "lodash";
import { IM } from "@im-library/vocabulary";
import setupOverlay from "./setupOverlay";

function setupQueryTree() {
  const overlayLocation: Ref<any> = ref({});

  const { onRowClick } = rowClick();

  const { OS, showOverlay, hideOverlay } = setupOverlay();

  const selectedKeys: Ref<any> = ref({});
  const selectedNode: Ref<TreeNode> = ref({});
  const root: Ref<TreeNode[]> = ref([]);
  const expandedKeys: Ref<any> = ref({});
  const selectedNodes: Ref<TreeNode[]> = ref([]);

  function createTreeNode(
    conceptName: string,
    conceptIri: string,
    conceptTypes: TTIriRef[],
    hasChildren: boolean,
    selectable: boolean,
    parent?: TreeNode,
    hasVariable?: string,
    order?: number
  ): TreeNode {
    return {
      key: getKey(parent as any),
      label: conceptName,
      typeIcon: getFAIconFromType(conceptTypes),
      color: getColourFromType(conceptTypes),
      conceptTypes: conceptTypes,
      data: conceptIri,
      leaf: !hasChildren,
      loading: false,
      children: [] as TreeNode[],
      parent: getParentNode(parent as any),
      order: order,
      selectable: selectable,
      hasVariable: hasVariable
    };
  }

  function displayOverlay(event: any, node: any): void {
    const placeholderData = [IM.NAMESPACE + "Favourites", "loadMore"];
    if (!placeholderData.includes(node.data)) {
      showOverlay(event, node.data);
    }
  }

  function removeOverlay() {
    if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
      hideOverlay(overlayLocation.value);
    }
  }

  function select(node: TreeNode) {
    node.selected = true;
    selectedNodes.value.push(node);
  }

  function unselect(node: TreeNode) {
    node.selected = false;
    selectedNodes.value = selectedNodes.value.filter((selected: TreeNode) => selected.key !== node.key);
  }

  return {
    selectedKeys,
    selectedNode,
    root,
    expandedKeys,
    createTreeNode,
    onRowClick,
    OS,
    displayOverlay,
    hideOverlay,
    overlayLocation,
    removeOverlay,
    unselect,
    select,
    selectedNodes
  };
}

export default setupQueryTree;
