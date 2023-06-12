import { getColourFromType, getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
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
  const pageSize = ref(20);

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
      parent: getParentNode(parent as any)
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

  return {
    selectedKeys,
    selectedNode,
    root,
    expandedKeys,
    createTreeNode,
    onRowClick,
    pageSize,
    OS,
    showOverlay,
    hideOverlay,
    overlayLocation,
    removeOverlay
  };
}

export default setupQueryTree;
