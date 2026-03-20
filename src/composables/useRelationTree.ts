import type { TreeNode } from "primevue/treenode";
import { PropertyShape, Where } from "@/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { IM, RDFS, SHACL } from "@/vocabulary";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

export interface NodePropertyFilter {
  skipProperty?: string;
  rangeType: string;
  rangeTypeName: string;
}

export function useRelationTree() {
  const expandedKeys: Ref<any> = ref({});
  const loading: Ref<boolean> = ref(false);

  async function createRelationTree(shapeIri: string | undefined, nodeFilter: NodePropertyFilter): Promise<TreeNode[]> {
    const nodes: TreeNode[] = [];
    let key = "0";
    if (nodeFilter.rangeType === IM.DATE) {
      nodes.push(createNode("0", "Search date", "$searchDate", "parameter", undefined, undefined, "", ""));
      nodes.push(createNode("1", "Achievement date", "$achievementDate", "parameter", undefined, undefined, "", ""));
      key = "2";
    }
    if (shapeIri) {
      const linkable = createNode(key, "Related fields  " + nodeFilter.rangeTypeName, "features", "folder", IM.FOLDER, undefined, "", "");
      nodes.push(linkable);
      await createPropertyTree(linkable, shapeIri, nodeFilter);
    }
    return nodes;
  }

  async function createPropertyTree(parent: TreeNode, shapeIri: string, nodeFilter: NodePropertyFilter) {
    const parentKey = parent.key;
    const entity = await DataModelService.getDataModelProperties(shapeIri, false);
    const propertyList = [] as TreeNode[];
    const path = parent.data.path ? parent.data.path : "";
    if (entity.property && isArrayHasLength(entity.property)) {
      for (const [index, property] of entity.property.entries()) {
        if (nodeFilter.skipProperty && property.path.iri === nodeFilter.skipProperty) continue;
        if (property.datatype && property.datatype.iri != nodeFilter.skipProperty) continue;
        if (!property.node) continue;
        propertyList.push(createPropertyNode(parentKey + "_" + index.toString(), property, path, parentKey, nodeFilter));
      }
      if (propertyList.length > 0) parent.children = propertyList;
    }
  }

  function createGroupNode(key: string, property: PropertyShape, path: string, parentKey: string, nodeFilter: NodePropertyFilter): TreeNode {
    const name = property.group!.name;
    const groupNode = createNode(key, name, property.group!.iri, "folder", IM.FOLDER, undefined, path, parentKey) as TreeNode;
    if (property.property) {
      const propertyList = [] as TreeNode[];
      for (const [propertyIndex, groupedProperty] of property.property.entries()) {
        propertyList.push(createPropertyNode(key + "_" + propertyIndex.toString(), groupedProperty, path, key, nodeFilter));
      }
      groupNode.children = propertyList;
    }
    groupNode.selectable = false;
    return groupNode;
  }

  function createPropertyNode(key: string, property: PropertyShape, path: string, parentKey: string, nodeFilter: NodePropertyFilter): TreeNode {
    if (property.group) {
      return createGroupNode(key, property, path, parentKey, nodeFilter);
    }
    let rangeType;
    let typeOf;
    if (property.clazz) {
      rangeType = property.clazz.type!.iri;
    } else if (property.node) {
      typeOf = property.node.iri;
      rangeType = property.node.type!.iri;
    }

    let name = property.path.name;
    if (property.hasValue) {
      const value = property.hasValueType?.iri === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
      name += ` (${value})`;
    }
    const propertyNode = createNode(key, name!, property.path.iri, "property", typeOf, rangeType, path, parentKey) as TreeNode;

    if (rangeType === SHACL.NODESHAPE) {
      propertyNode.selectable = false;
      propertyNode.leaf = false;
    } else propertyNode.selectable = true;
    return propertyNode;
  }

  async function expandNode(node: TreeNode, nodeFilter: NodePropertyFilter) {
    node.loading = true;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          if (child.data.typeOf) {
            child.leaf = false;
          } else child.lead = false;
        }
      }
    } else if (node.data.typeOf) {
      await createPropertyTree(node, node.data.typeOf, nodeFilter);
    }
    node.loading = false;
  }

  function createNode(
    key: string,
    name: string | undefined,
    iri: string,
    type: string,
    typeOf: string | undefined,
    rangeType: string | undefined,
    path: string,
    parentKey: string
  ): TreeNode {
    if (typeOf) {
      if (path === "") path = path + iri + "\t" + typeOf;
      else path = path + "\t" + iri + "\t" + typeOf;
    }
    const node = {
      key: key,
      label: name,
      expanded: false,
      data: {
        iri: iri,
        path: path,
        typeOf: typeOf,
        parentKey: parentKey,
        rangeType: rangeType
      },
      loading: false,
      children: [] as TreeNode[],
      type: type
    } as TreeNode;
    if (rangeType) {
      if (rangeType === SHACL.NODESHAPE) node.leaf = false;
    }
    return node;
  }

  function collapseNode(node: TreeNode) {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: false };
    for (const key of Object.keys(expandedKeys.value)) {
      if (key.toString().startsWith(node.key!)) {
        delete expandedKeys.value[key];
      }
    }
  }
  function getDefaultTarget(where: Where, tree: TreeNode[]): string {
    if (where.compare && where.compare.right) {
      for (const node in tree) {
        if (where.compare.right.parameter) {
          if (tree[node].data) {
            if (tree[node].data.parameter === where.compare.right.parameter) return tree[node].key;
          }
        } else if (where.compare.right.nodeRef) if (tree[node].data.nodeRef && tree[node].data.nodeRef === where.compare.right.nodeRef) return tree[node].key;
      }
    }
    return tree[0].key;
  }
  return {
    collapseNode,
    expandedKeys,
    loading,
    createRelationTree,
    getDefaultTarget,
    expandNode
  };
}
