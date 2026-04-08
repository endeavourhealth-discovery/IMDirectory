import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { getColourFromType, getFAIconFromType, isArrayHasLength } from "vue-library/helpers";
import { IM, RDF, RDFS, SHACL } from "vue-library/enums";
import type { Match, Node, PropertyShape, Where } from "vue-library/interfaces";
import { Ref, ref } from "vue";
import { addWhereToMatch, setPathGetNodeRef } from "@/helpers/buildQuery";
const codeable = [IM.VALUE_SET, IM.CONCEPT_SET, IM.CONCEPT];

export function usePropertyTree() {
  const baseType: Ref<Node> = ref({} as Node);
  const loading: Ref<boolean> = ref(false);

  async function createPropertyTree(iri: string, parent: TreeNode) {
    const parentKey = parent.key;
    const entity = await DataModelService.getDataModelProperties(iri, false);
    const propertyList = [] as TreeNode[];
    const path = parent.data.path ? parent.data.path : "";
    if (entity.property && isArrayHasLength(entity.property)) {
      for (const [index, property] of entity.property.entries()) {
        if (!isBase(property)) propertyList.push(createPropertyNode(parentKey + "_" + index.toString(), property, path, parentKey));
      }
      if (propertyList.length > 0) parent.children = propertyList;
    }
  }

  async function createFeatureTree(queryBaseType: Node): Promise<TreeNode[]> {
    baseType.value = queryBaseType;
    const data = ref([] as TreeNode[]);
    data.value.push(createNode("0", "Select features of  " + queryBaseType.name, "features", "folder", IM.FOLDER, undefined, "", "", "", false));
    data.value[0].selectable = false;
    await createPropertyTree(queryBaseType.iri!, data.value[0]);
    return data.value;
  }

  function createNode(
    key: string,
    name: string | undefined,
    iri: string,
    type: string,
    iconType: string,
    typeOf: string | undefined,
    rangeType: string | undefined,
    path: string,
    parentKey: string,
    highCardinality?: boolean,
    ascending?: string,
    descending?: string,
    definingProperty?: boolean
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
        typeIcon: getFAIconFromType([{ iri: iconType }]),
        color: getColourFromType([{ iri: iconType }]),
        iri: iri,
        path: path,
        typeOf: typeOf,
        parentKey: parentKey,
        definingProperty: definingProperty,
        ascending: ascending,
        descending: descending,
        rangeType: rangeType,
        highCardinality: highCardinality
      },
      loading: false,
      children: [] as TreeNode[],
      type: type
    } as TreeNode;
    if (rangeType) {
      if (rangeType === SHACL.NODESHAPE) node.leaf = false;
      node.data.rangeTypeIcon = getFAIconFromType([{ iri: rangeType }]);
      node.data.rangeTypeColor = getColourFromType([{ iri: rangeType }]);
    }
    return node;
  }

  function createGroupNode(key: string, property: PropertyShape, path: string, parentKey: string): TreeNode {
    const name = property.group!.name;
    const groupNode = createNode(key, name, property.group!.iri, "folder", IM.FOLDER, undefined, "", path, parentKey, false) as TreeNode;
    if (property.property) {
      const propertyList = [] as TreeNode[];
      for (const [propertyIndex, groupedProperty] of property.property.entries()) {
        propertyList.push(createPropertyNode(key + "_" + propertyIndex.toString(), groupedProperty, path, key));
      }
      groupNode.children = propertyList;
    }
    groupNode.selectable = false;
    return groupNode;
  }

  function createPropertyNode(key: string, property: PropertyShape, path: string, parentKey: string): TreeNode {
    if (property.group) {
      return createGroupNode(key, property, path, parentKey);
    }
    if (property.inversePath) {
      return createTypeNode(key, property, path, parentKey);
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
    const propertyNode = createNode(
      key,
      name!,
      property.path.iri,
      "property",
      RDF.PROPERTY,
      typeOf,
      rangeType,
      path,
      parentKey,
      property.highCardinality,
      property.ascending,
      property.descending,
      property.definingProperty
    ) as TreeNode;

    if (rangeType === SHACL.NODESHAPE) {
      propertyNode.selectable = false;
      propertyNode.leaf = false;
    } else propertyNode.selectable = true;
    return propertyNode;
  }

  function createTypeNode(key: string, property: PropertyShape, path: string, parentKey: string): TreeNode {
    let rangeType;
    let typeOf;
    let name = "";
    if (property.clazz) {
      rangeType = property.clazz.type!.iri;
    } else if (property.node) {
      typeOf = property.node.iri;
      rangeType = property.node.type!.iri;
      name = property.node.name!;
    }

    const propertyNode = createNode(
      key,
      name!,
      property.path.iri,
      "type",
      SHACL.NODESHAPE,
      typeOf,
      rangeType,
      path,
      parentKey,
      property.highCardinality,
      property.ascending,
      property.descending,
      property.definingProperty
    ) as TreeNode;
    propertyNode.selectable = false;
    propertyNode.leaf = false;
    return propertyNode;
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
          if (child.data.typeOf) {
            child.leaf = false;
          } else child.lead = false;
        }
      }
    } else if (node.data.typeOf) {
      await createPropertyTree(node.data.typeOf, node);
    }
    node.loading = false;
  }

  function addWhereFromTree(match: Match, node: TreeNode) {
    const path = node.data.path;
    let nodeRef = undefined;
    if (path) nodeRef = setPathGetNodeRef(match, path);
    if (node.type === "property" && node.data.rangeType != SHACL.NODESHAPE) {
      const where = { iri: node.data.iri, invalid: true } as Where;
      if (nodeRef) where.nodeRef = nodeRef;
      if (node.data.rangeType === IM.VALUESET || node.data.rangeType === IM.CONCEPT) where.is = [{}];
      addWhereToMatch(match, where);
    }
  }
  function findNodeFromFlatPath(path: string, nodes: TreeNode[]): TreeNode[] | undefined {
    for (const node of nodes) {
      if (node.data.path === path) return [node];
      if (node.children && node.children.length > 0) {
        const foundNode = findNodeFromFlatPath(path, node.children);
        if (foundNode) return foundNode;
      }
    }
    return undefined;
  }

  async function getPathNode(path: string, nodes: TreeNode[]): Promise<TreeNode | undefined> {
    for (const node of nodes) {
      if (node.data.path.split("\t")[0] === path) {
        await expandNode(node);
        return node;
      } else if (node.data.path === "" && node.children && node.children.length > 0) {
        const foundNode = await getPathNode(path, node.children);
        if (foundNode) return foundNode;
      }
    }
    return undefined;
  }

  async function getTypeNode(type: string, nodes: TreeNode[]): Promise<TreeNode | undefined> {
    for (const node of nodes) {
      if (node.data.typeOf === type) {
        await expandNode(node);
        return node;
      } else if (node.children && node.children.length > 0) {
        const foundNode = await getTypeNode(type, node.children);
        if (foundNode) return foundNode;
      }
    }
    return undefined;
  }
  async function findNodesFromMatch(match: Match, nodes: TreeNode[]): Promise<TreeNode[]> {
    if (match.typeOf) {
      const pathNode = await getTypeNode(match.typeOf.iri!, nodes);
      if (pathNode) return [pathNode];
      else return nodes;
    } else {
      return nodes;
    }
  }

  async function findReturnNodesFromMatch(match: Match, nodes: TreeNode[]): Promise<TreeNode[]> {
    const newNodes: TreeNode[] = [];
    if (match.path) {
      const pathNode = await getPathNode(match.path[0]!.iri!, nodes);
      if (!pathNode) return nodes;
      newNodes.push(pathNode!);
      pathNode.children = findReturnNodes(pathNode.children!);
      return newNodes;
    } else return findReturnNodes(nodes);
  }

  function findReturnNodes(nodes: TreeNode[]): TreeNode[] {
    const newNodes: TreeNode[] = [];
    for (const node of nodes) {
      if (!node.data.highCardinality) {
        const newNode = { ...node };
        delete newNode.children;
        if (node.data.rangeType) {
          if (codeable.includes(node.data.rangeType)) {
            newNode.leaf = false;
            newNode.data.rangeType = IM.CODEABLE;
          }
        }
        if (node.type === "folder" && node.children && node.children.length > 0) {
          newNode.children = findReturnNodes(node.children);
          if (newNode.children.length > 0) newNodes.push(newNode);
        } else newNodes.push(newNode);
      }
    }
    return newNodes;
  }

  return {
    createFeatureTree,
    expandNode,
    createPropertyTree,
    addWhereFromTree,
    findNodeFromFlatPath,
    findNodesFromMatch,
    findReturnNodesFromMatch,
    createNode,
    loading
  };
}
