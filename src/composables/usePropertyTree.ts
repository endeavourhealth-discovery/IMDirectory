import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { Match, Node, PropertyShape, Where } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Ref, ref } from "vue";
import { addWhereToMatch, setPathGetNodeRef } from "@/helpers/buildQuery";

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
    data.value.push(createNode("0", "Select features of  " + queryBaseType.name, "features", "folder", IM.FOLDER, undefined, "", "", ""));
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
        rangeType: rangeType
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
    const groupNode = createNode(key, name, property.group!.iri, "folder", IM.FOLDER, undefined, "", path, parentKey) as TreeNode;
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
  async function findNodeFromMatchPath(match: Match, nodes: TreeNode[]): Promise<TreeNode[] | undefined> {
    if (match.path) {
      for (const node of nodes) {
        if (node.data.iri === match.path[0].iri) {
          if (!node.children || node.children.length === 0) {
            await expandNode(node);
          }
          return [node];
        } else if (node.type && node.type === "folder" && node.children && node.children.length > 0) {
          const foundNode = await findNodeFromMatchPath(match, node.children);
          if (foundNode) return foundNode;
        }
      }
    }
    return undefined;
  }

  return {
    createFeatureTree,
    expandNode,
    createPropertyTree,
    addWhereFromTree,
    findNodeFromFlatPath,
    findNodeFromMatchPath,
    loading
  };
}
