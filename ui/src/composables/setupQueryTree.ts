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
    parent?: TreeNode,
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
      order: order,
      parent: getParentNode(parent as any),
      selectable: isProperty(conceptTypes)
    };
  }

  async function showOverlay(event: any, node: any): Promise<void> {
    const placeholderData = [IM.NAMESPACE + "Favourites", IM.NAMESPACE + "Data models", IM.NAMESPACE + "Queries", "loadMore"];
    if (!placeholderData.includes(node.data)) {
      await OS.value.showOverlay(event, node.data);
    }
  }

  function hideOverlay(event: any): void {
    OS.value.hideOverlay(event);
  }

  function removeOverlay() {
    if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
      hideOverlay(overlayLocation.value);
    }
  }

  function select(node: TreeNode) {
    selectedNodes.value.push(node);
    selectedKeys.value[node.key!] = { checked: true, partialChecked: false };
  }

  function unselect(key: string) {
    selectedNodes.value = selectedNodes.value.filter((selected: TreeNode) => selected.key !== key);
    delete selectedKeys.value[key];
  }

  function partialSelect(key: string) {
    selectedKeys.value[key] = { checked: true, partialChecked: false };
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
    partialSelect,
    selectedNodes
  };
}

export default setupQueryTree;
