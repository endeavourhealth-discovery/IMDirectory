import { getColourFromType, getFAIconFromType, isProperty } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/tree";
import { ref, Ref } from "vue";
import rowClick from "./rowClick";
import { getKey, getParentNode } from "@im-library/helpers";
import { isObject } from "lodash";
import { IM } from "@im-library/vocabulary";

function setupQueryTree() {
  const OS: Ref<any> = ref();
  const overlayLocation: Ref<any> = ref({});

  const { onRowClick } = rowClick();

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

  async function showOverlay(event: any, node: any): Promise<void> {
    const placeholderData = [IM.NAMESPACE + "Favourites", IM.NAMESPACE + "Data models", IM.NAMESPACE + "Queries", "loadMore"];
    if (!placeholderData.includes(node.data) && OS.value) {
      await OS.value.showOverlay(event, node.data);
    }
  }

  function hideOverlay(event: any): void {
    if (OS.value) OS.value.hideOverlay(event);
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
    showOverlay,
    hideOverlay,
    overlayLocation,
    removeOverlay,
    unselect,
    select,
    selectedNodes
  };
}

export default setupQueryTree;
