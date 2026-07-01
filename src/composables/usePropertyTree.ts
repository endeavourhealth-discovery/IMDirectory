import { Ref, ref } from "vue";

import { IM, RDF, RDFS, SHACL } from "@endeavour/vue-library/enums";
import { getColourFromType, getFAIconFromType, isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Match, Node, NodeShape, PropertyShape, TTIriRef } from "@endeavour/vue-library/interfaces";

import type { TreeNode } from "primevue/treenode";

import { DataModelService } from "@/services";

const codeable: string[] = [IM.VALUE_SET, IM.CONCEPT_SET, IM.CONCEPT];
export type Mode = "match" | "return";
type PropertyTreeNode = {
  key: string;
  name: string | undefined;
  iri: string;
  type: string;
  iconType: string;
  typeOf?: string;
  range?: string | undefined;
  rangeType?: string | undefined;
  path?: string | undefined;
  parentKey?: string;
  ascending?: string;
  descending?: string;
  returnType?: string;
  inversePath?: TTIriRef;
  minCount?: number;
  maxCount?: number;
  nodeRef?: string;
};

export function usePropertyTree() {
  const baseType: Ref<Node> = ref({} as Node);
  const loading: Ref<boolean> = ref(false);
  const mode: Ref<Mode> = ref("match");

  async function addToTreeFromAny(match: Match, nodes: TreeNode[]) {
    if (match.any) {
      for (const [index, any] of match.any.entries()) {
        if (any.typeOf) {
          const iri = any.typeOf!.iri!;
          const nodeShape = await DataModelService.getDataModelProperties(iri, false);
          const parent = createNode({
            key: (index + 1).toString(),
            name: any.node,
            iri: "features",
            type: "folder",
            iconType: IM.FOLDER,
            typeOf: nodeShape.iri
          });
          parent.data.nodeRef = any.node;
          parent.selectable = false;
          parent.leaf = false;
          nodes.push(parent);
          const propertyList = [] as TreeNode[];
          if (nodeShape.property && isArrayHasLength(nodeShape.property)) {
            for (const [index, property] of nodeShape.property.entries()) {
              if (!isBase(property))
                propertyList.push(createPropertyNode(parent.key + "_" + index.toString(), property, "", parent.key, nodeShape.iri, any.node));
            }
            if (propertyList.length > 0) parent.children = propertyList;
          }
        }
      }
    }
  }

  async function createPropertyTree(iri: string, nodeShape: NodeShape | undefined, parent: TreeNode) {
    const parentKey = parent.key;
    if (!nodeShape) nodeShape = await DataModelService.getDataModelProperties(iri, false);
    const propertyList = [] as TreeNode[];
    const path = parent.data.path ? parent.data.path : undefined;
    if (nodeShape.property && isArrayHasLength(nodeShape.property)) {
      for (const [index, property] of nodeShape.property.entries()) {
        if (!isBase(property))
          propertyList.push(createPropertyNode(parentKey + "_" + index.toString(), property, path, parentKey, nodeShape.iri, parent.data.nodeRef));
      }
      if (propertyList.length > 0) parent.children = propertyList;
    }
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
  function createFolderNode(parentKey: string, key: string, folder: NodeShape, propertyList: TreeNode[], nodeShape: NodeShape) {
    const folderNode = createNode({
      key: key,
      name: folder.name,
      iri: folder.iri,
      type: "folder",
      iconType: IM.FOLDER,
      parentKey: parentKey,
      path: "",
      typeOf: nodeShape.iri
    });
    folderNode.selectable = false;
    folderNode.children = [] as TreeNode[];
    folderNode.leaf = false;
    propertyList.push(folderNode);
    if (folder.type && folder.type.length > 0) {
      for (const [index, relatedType] of folder.type.entries()) {
        createTypeNode(key, key + "_" + index.toString(), relatedType, folderNode.children);
      }
    }
  }

  function createTypeNode(parentKey: string, key: string, type: NodeShape, typeList: TreeNode[]) {
    const typeNode = createNode({
      key: key,
      name: type.name,
      iri: type.iri,
      type: "type",
      iconType: SHACL.NODESHAPE,
      parentKey: parentKey,
      path: "",
      range: type.iri,
      rangeType: SHACL.NODESHAPE,
      typeOf: type.iri
    });
    typeNode.selectable = true;
    typeList.push(typeNode);
  }

  async function createFeatureTree(nodeShape: NodeShape, viewMode: Mode): Promise<TreeNode[]> {
    mode.value = viewMode;
    const data = ref([] as TreeNode[]);
    data.value.push(
      createNode({
        key: "0",
        name: "Select features of  " + nodeShape.name,
        iri: "features",
        type: "folder",
        iconType: IM.FOLDER,
        typeOf: nodeShape.iri
      })
    );
    data.value[0].selectable = false;
    await createPropertyTree(nodeShape.iri, nodeShape, data.value[0]);
    return data.value;
  }

  function createNode(pNode: PropertyTreeNode): TreeNode {
    if (pNode.type === "property") {
      if (pNode.range) {
        if (pNode.path) pNode.path = pNode.path + "\t" + pNode.iri + "\t" + pNode.range;
        else pNode.path = pNode.iri + "\t" + pNode.range;
      } else if (pNode.returnType) {
        if (pNode.path) pNode.path = pNode.path + "\t" + pNode.iri + "\t" + pNode.returnType;
        else pNode.path = pNode.iri + "\t" + pNode.returnType;
      }
    }
    const node = {
      key: pNode.key,
      label: pNode.name,
      expanded: false,
      data: {
        typeIcon: getFAIconFromType([{ iri: pNode.iconType }]),
        color: getColourFromType([{ iri: pNode.iconType }]),
        iri: pNode.iri,
        path: pNode.path,
        range: pNode.range,
        parentKey: pNode.parentKey,
        ascending: pNode.ascending,
        descending: pNode.descending,
        rangeType: pNode.rangeType,
        returnType: pNode.returnType,
        inversePath: pNode.inversePath,
        typeOf: pNode.typeOf,
        minCount: pNode.minCount,
        maxCount: pNode.maxCount,
        nodeRef: pNode.nodeRef
      },
      loading: false,
      children: [] as TreeNode[],
      type: pNode.type
    } as TreeNode;
    if (pNode.rangeType) {
      if (pNode.rangeType === SHACL.NODESHAPE) node.leaf = false;
      if (pNode.rangeType != pNode.iconType) {
        node.data.rangeTypeIcon = getFAIconFromType([{ iri: pNode.rangeType }]);
        node.data.rangeTypeColor = getColourFromType([{ iri: pNode.rangeType }]);
      }
    }
    return node;
  }

  function createGroupNode(key: string, property: PropertyShape, path: string, parentKey: string, typeOf: string): TreeNode {
    const name = property.group!.name;
    const groupNode = createNode({
      key: key,
      name: name,
      iri: property.group!.iri,
      type: "folder",
      iconType: IM.FOLDER,
      parentKey: parentKey,
      path: path,
      typeOf: typeOf
    });
    if (property.property) {
      const propertyList = [] as TreeNode[];
      for (const [propertyIndex, groupedProperty] of property.property.entries()) {
        propertyList.push(createPropertyNode(key + "_" + propertyIndex.toString(), groupedProperty, path, key, typeOf));
      }
      groupNode.children = propertyList;
    }
    groupNode.selectable = false;
    return groupNode;
  }

  function createPropertyNode(key: string, property: PropertyShape, path: string, parentKey: string, typeOf: string, nodeRef?: string): TreeNode {
    if (property.group) {
      return createGroupNode(key, property, path, parentKey, typeOf);
    }
    if (property.generic && property.node) {
      return createGenericNode(key, property, property.path.iri + "\t" + property.node.iri, parentKey);
    }
    let rangeType;
    let range;
    let returnType;
    if (property.clazz) {
      rangeType = property.clazz.type!.iri;
      if (mode.value === "return") {
        if (codeable.includes(rangeType)) {
          returnType = IM.CODEABLE;
        }
      }
    } else if (property.node) {
      range = property.node.iri;
      rangeType = property.node.type!.iri;
    }

    let name = property.path.name;
    if (property.hasValue) {
      const value = property.hasValueType?.iri === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
      name += ` (${value})`;
    }
    const propertyNode = createNode({
      key: key,
      name: name,
      iri: property.path.iri,
      type: "property",
      iconType: RDF.PROPERTY,
      range: range,
      rangeType: rangeType,
      path: path,
      parentKey: parentKey,
      ascending: property.ascending,
      descending: property.descending,
      returnType: returnType,
      inversePath: property.inversePath,
      typeOf: typeOf,
      minCount: property.minCount,
      maxCount: property.maxCount,
      nodeRef: nodeRef
    });
    propertyNode.leaf = true;
    if (rangeType === SHACL.NODESHAPE) {
      propertyNode.selectable = false;
      propertyNode.leaf = false;
    } else propertyNode.selectable = true;
    if (returnType) {
      propertyNode.selectable = false;
      propertyNode.leaf = false;
    }
    return propertyNode;
  }

  function createGenericNode(key: string, property: PropertyShape, path: string, parentKey: string): TreeNode {
    const range = property.node!.iri;
    const rangeType = property.node!.type!.iri;
    const name = property.node!.name!;
    const propertyNode = createNode({
      key: key,
      name: name!,
      iri: property.path!.iri,
      type: "type",
      iconType: SHACL.NODESHAPE,
      range: range,
      rangeType: rangeType,
      path: path,
      parentKey: parentKey,
      ascending: property.ascending,
      descending: property.descending,
      inversePath: property.inversePath,
      typeOf: property.node!.iri
    });
    propertyNode.selectable = true;
    propertyNode.leaf = false;
    return propertyNode;
  }

  function isBase(property: PropertyShape): boolean {
    if (property.node) {
      return property.node.iri === baseType.value.iri;
    }
    return false;
  }
  async function expandNode(node: TreeNode, expandMode: Mode) {
    mode.value = expandMode;
    node.loading = true;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          child.leaf = !child.data.range;
        }
      }
    } else if (node.data.returnType && expandMode === "return") {
      await createPropertyTree(node.data.returnType, undefined, node);
    } else if (node.data.range) {
      await createPropertyTree(node.data.range, undefined, node);
    }
    if (node.children) createModeView(node.children, expandMode);
    node.loading = false;
  }

  function createModeView(nodes: TreeNode[], viewMode: Mode) {
    return nodes.map(node => {
      if (node.data.returnType) {
        if (viewMode === "return") {
          node.leaf = false;
        } else {
          delete node.children;
          delete node.data.path;
          node.selectable = true;
          node.leaf = true;
        }
      }
    });
  }

  return {
    createFeatureTree,
    expandNode,
    createPropertyTree,
    createModeView,
    addToTreeFromAny,
    createRelatedTypeTree,
    loading
  };
}
