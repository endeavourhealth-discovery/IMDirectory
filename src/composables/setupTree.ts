import { DirectService, EntityService } from "@/services";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { EntityReferenceNode } from "@/interfaces";
import { TTIriRef } from "@/interfaces/AutoGen";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { computed, ref, Ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useUserStore } from "@/stores/userStore";

function setupTree(emit?: any, customPageSize?: number) {
  const toast = useToast();
  const userStore = useUserStore();
  const favourites = computed(() => userStore.favourites);

  const selectedKeys: Ref<any> = ref({});
  const selectedNode: Ref<TreeNode | undefined> = ref();
  const root: Ref<TreeNode[]> = ref([]);
  const expandedKeys: Ref<any> = ref({});
  const expandedData: Ref<TreeNode[]> = ref([]);
  const pageSize = ref(customPageSize ?? 50);

  const directService = new DirectService();

  function createTreeNode(
    conceptName: string,
    conceptIri: string,
    conceptTypes: TTIriRef[],
    hasChildren: boolean,
    parent: TreeNode | null,
    order?: number
  ): TreeNode {
    return {
      key: conceptIri,
      label: conceptName,
      typeIcon: getFAIconFromType(conceptTypes),
      color: getColourFromType(conceptTypes),
      conceptTypes: conceptTypes,
      data: conceptIri,
      leaf: !hasChildren,
      loading: false,
      children: [] as TreeNode[],
      order: order,
      parentNode: parent
    };
  }

  function createLoadMoreNode(parentNode: TreeNode, nextPage: number, totalCount: number): TreeNode {
    return {
      key: "loadMore" + parentNode.data,
      label: "Load more...",
      typeIcon: null,
      color: null,
      data: "loadMore",
      leaf: true,
      loading: false,
      children: [] as TreeNode[],
      parentNode: parentNode,
      nextPage: nextPage,
      totalCount: totalCount,
      style: "font-weight: bold;"
    };
  }

  async function onNodeSelect(node: TreeNode): Promise<void> {
    if (node.data === "loadMore") {
      if (!node.loading) await loadMore(node);
    } else {
      selectedNode.value = node;
      directService.select(node.data);
    }
  }

  function onNodeDblClick($event: MouseEvent, node: TreeNode) {
    if (!(node.data === "loadMore" || node.data === IM.FAVOURITES)) directService.view(node.key);
  }

  function customOnClick(event: MouseEvent, node: TreeNode, useEmits?: boolean) {
    if (useEmits) {
      if (!emit) throw new Error("setupTree requires vue emits for custom clicks");
      if (checkForControlClick(event)) emit("rowControlClicked", node.data);
      else emit("rowClicked", node.data);
    } else {
      if (checkForControlClick(event)) directService.view(node.data);
      else directService.select(node.data);
    }
  }

  function checkForControlClick(event: MouseEvent): boolean {
    return event.metaKey || event.ctrlKey;
  }

  async function loadMore(node: TreeNode) {
    node.loading = true;
    if (node.nextPage * pageSize.value <= node.totalCount) {
      const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
      node.parentNode.children.pop();
      children.result.forEach(child => {
        if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
      });
      node.nextPage = node.nextPage + 1;
      node.parentNode.children.push(createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
    } else if (node.nextPage * pageSize.value > node.totalCount) {
      const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
      node.parentNode.children.pop();
      children.result.forEach((child: any) => {
        if (!nodeHasChild(node.parentNode, child))
          node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node.parentNode));
      });
    } else {
      node.parentNode.children.pop();
    }
    node.loading = false;
  }

  async function onNodeExpand(node: any) {
    if (isObjectHasKeys(node)) {
      node.loading = true;
      if (!isObjectHasKeys(expandedKeys.value, [node.key])) expandedKeys.value[node.key] = true;
      if (!expandedData.value.find(x => x.key === node.key)) expandedData.value.push(node);
      if (node.data === IM.FAVOURITES && node.children.length < favourites.value.length) {
        for (const fav of favourites.value) {
          const favChild = await EntityService.getEntityAsEntityReferenceNode(fav);
          if (favChild) node.children.push(createTreeNode(favChild.name, favChild["@id"], favChild.type, false, node));
        }
      } else {
        const children = await EntityService.getPagedChildren(node.data, 1, pageSize.value);
        children.result.forEach((child: any) => {
          if (!nodeHasChild(node, child)) node.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
        });
        if (
          children.totalCount >= pageSize.value &&
          node.children.length !== children.totalCount &&
          node.children[node.children.length - 1].data !== "loadMore"
        ) {
          node.children.push(createLoadMoreNode(node, 2, children.totalCount));
        }
      }
      node.loading = false;
    }
  }

  function onNodeCollapse(node: any) {
    deleteKeysRecursively(node);
    delete expandedKeys.value[node.key];
  }

  function deleteKeysRecursively(node: any) {
    const collapsedKeys = [];
    if (node.children) {
      for (const child of node.children) {
        if (child.children.length) {
          collapsedKeys.push(child.key);
          deleteKeysRecursively(child);
        }
      }
    }
    for (const key of collapsedKeys) {
      delete expandedKeys.value[key];
    }
  }

  function nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
    return !!node.children?.find(nodeChild => child["@id"] === nodeChild.data);
  }

  function selectKey(selectedKey: string) {
    Object.keys(selectedKeys.value).forEach(key => {
      selectedKeys.value[key] = false;
    });
    selectedKeys.value[selectedKey] = true;
  }

  async function findPathToNode(iri: string, loading: Ref<boolean>, treeContainerId: string) {
    loading.value = true;
    const path = await EntityService.getPathBetweenNodes(iri, IM.MODULE_IM);

    // Recursively expand
    let n = root.value.find(c => path.find(p => p["@id"] === c.data));
    let i = 0;
    if (n) {
      expandedKeys.value = {};
      while (n && n.data != path[0]["@id"] && i++ < 50) {
        await selectAndExpand(n);
        // Find relevant child
        n = await locateChildInLoadMore(n, path);
      }
      if (n && n.data === path[0]["@id"]) {
        await selectAndExpand(n);

        while (!n.children?.some(child => child.data === iri)) {
          await loadMoreChildren(n);
        }
        for (const gc of n.children) {
          if (gc.data === iri && gc.key) {
            selectKey(gc.key);
          }
        }
        selectedNode.value = n;
      } else {
        toast.add({
          severity: "warn",
          summary: "Unable to locate",
          detail: "Unable to locate concept in the current hierarchy"
        });
      }
    }
    scrollToHighlighted(treeContainerId);
    loading.value = false;
  }

  async function locateChildInLoadMore(n: TreeNode, path: TTIriRef[]): Promise<TreeNode | undefined> {
    if (n.children && n.children.find(c => c.data === "loadMore")) {
      const found = n.children.find(c => path.find(p => p["@id"] === c.data));
      if (found) {
        return n.children.find(c => path.find(p => p["@id"] === c.data));
      } else {
        await loadMoreChildren(n);
        return await locateChildInLoadMore(n, path);
      }
    } else {
      return n.children?.find(c => path.find(p => p["@id"] === c.data));
    }
  }

  async function selectAndExpand(node: any) {
    selectKey(node.key);
    if (!node.children || node.children.length === 0) {
      await onNodeExpand(node);
    }
    expandedKeys.value[node.key] = true;
    expandedKeys.value = { ...expandedKeys.value };
    expandedData.value.push(node);
  }

  function scrollToHighlighted(containerId: string) {
    const container = document.getElementById(containerId) as HTMLElement;
    if (container) {
      const highlighted = container.getElementsByClassName("p-tree-node-selected")?.[0];
      if (highlighted) highlighted.scrollIntoView();
    }
  }

  async function loadMoreChildren(node: any) {
    if (node.children[node.children.length - 1].data === "loadMore") {
      await loadMore(node.children[node.children.length - 1]);
    }
  }

  return {
    selectedKeys,
    selectedNode,
    root,
    expandedKeys,
    expandedData,
    createTreeNode,
    createLoadMoreNode,
    onNodeCollapse,
    onNodeDblClick,
    onNodeExpand,
    onNodeSelect,
    customOnClick,
    loadMore,
    loadMoreChildren,
    locateChildInLoadMore,
    findPathToNode,
    scrollToHighlighted,
    selectAndExpand,
    selectKey,
    nodeHasChild,
    pageSize
  };
}

export default setupTree;
