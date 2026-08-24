import { Ref, ref } from "vue";

import { IM, RDF } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Node, NodeShape, PropertyShape, Query } from "@endeavour/vue-library/models";

import type { TreeNode } from "primevue/treenode";

import { usePropertyTree } from "@/composables/usePropertyTree";
import { ViewMode } from "@/enums/PropertyViewMode";
import { DataModelService } from "@/services";

export function useReturnTree() {
  const loading: Ref<boolean> = ref(false);
  const baseType: Ref<Node> = ref({} as Node);
  const {createFolderNode, createPropertyTree, createNode, createPropertyNode } = usePropertyTree();

  async function createReturnTree(match: Query, base: Node): Promise<TreeNode[]> {
    baseType.value = base;
    const data = [] as TreeNode[];
    if (base.iri) {
      await createTypeReturnTree(match.typeOf ? match.typeOf.iri! : base.iri, data);
    }
    if (match.and) {
      for (const [index, any] of match.and.entries()) {
        addReturnedProperties(any, data);
      }
    }
    if (match.or) {
      for (const [index, any] of match.or.entries()) {
        addReturnedProperties(any, data);
      }
    }
    return data;
  }

  function addReturnedProperties(match: Query, data: TreeNode[]) {
    const key = data.length;
    if (match.as) {
      const parent = createNode({ key: key.toString(), name: "From " + match.as + " select", as: match.as, type: "folder", iconType: IM.FOLDER });
      parent.children = [] as TreeNode[];
      data.push(parent);
      if (match.return) {
        for (const [index, returned] of match.return.entries()) {
          const node = createNode({
            key: key.toString() + "_" + index.toString(),
            name: returned.as,
            iri: returned.iri,
            nodeRef: returned.nodeRef ? returned.nodeRef : match.as,
            type: "returned",
            iconType: RDF.PROPERTY
          });
          node.selectable = true;
          node.leaf = true;
          parent.children.push(node);
        }
      }
    }
  }

  async function createTypeReturnTree(iri: string, data: TreeNode[]) {
    const nodeShape = await DataModelService.getDataModelProperties(iri, false);
    const key = data.length;
    data.push(
      createNode({
        key: key.toString(),
        name: "Select features of  " + nodeShape.name,
        iri: "features",
        type: "folder",
        iconType: IM.FOLDER,
        typeOf: nodeShape.iri
      })
    );
    data[key].selectable = false;
    await createPropertyTree(nodeShape.iri, nodeShape, data[key], ViewMode.return);
    return data;
  }

  function createRelatedTypeTree(nodeShape: NodeShape): TreeNode[] {
    const propertyList = [] as TreeNode[];
    const parentKey = "0";
    if (nodeShape.property && isArrayHasLength(nodeShape.property)) {
      for (const [index, property] of nodeShape.property.entries()) {
        if (!isBase(property)) propertyList.push(createPropertyNode(parentKey + "_" + index.toString(), property, "", parentKey, nodeShape.iri));
      }
    }
    if (nodeShape.folder && nodeShape.folder.length > 0) {
      const propertyIndex = propertyList.length;
      for (const [index, folder] of nodeShape.folder.entries()) {
        createFolderNode(parentKey, parentKey + "_" + (propertyIndex + index).toString(), folder, propertyList, nodeShape);
      }
    }
    return propertyList;
  }

  function isBase(property: PropertyShape): boolean {
    if (property.node) {
      return property.node.iri === baseType.value.iri;
    }
    return false;
  }
  async function expandNode(node: TreeNode) {
    node.loading = true;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          child.leaf = !child.data.range;
        }
      }
    } else if (node.data.returnType) {
      await createPropertyTree(node.data.returnType, undefined, node, ViewMode.return);
    } else if (node.data.range) {
      await createPropertyTree(node.data.range, undefined, node, ViewMode.return);
    }
    node.loading = false;
  }

  return {
    createReturnTree,
    expandNode,
    createRelatedTypeTree,
    loading
  };
}
