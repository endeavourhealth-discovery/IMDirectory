import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { Match, Path, PropertyShape, Node, Where } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Ref, ref } from "vue";
import { Orderable } from "@/models/orderable";
import { TreeSelectionKeys } from "primevue/tree";

export function usePropertyTree() {
  const baseType: Ref<Node> = ref({} as Node);
  const loading: Ref<boolean> = ref(false);

  async function createPropertyTree(iri: string, parent: TreeNode) {
    const entity = await DataModelService.getDataModelProperties(iri, false);
    const propertyList = [] as TreeNode[];
    if (entity.property && isArrayHasLength(entity.property)) {
      for (const [index, property] of entity.property.entries()) {
        if (!isBase(property)) propertyList.push(createPropertyNode(index.toString(), property, parent));
      }
      if (propertyList.length > 0) parent.children = propertyList;
    }
  }

  async function createFeatureTree(queryBaseType: Node, propertiesOnly?: boolean): Promise<TreeNode[]> {
    baseType.value = queryBaseType;
    const data = ref([] as TreeNode[]);
    let key = "0";
    let keyIndex = 0;
    if (!propertiesOnly) {
      data.value.push(createNode(key, "Add a cohort as feature", "cohort", "cohort", IM.QUERY, undefined, "", null));
      key = "1";
      keyIndex++;
    }
    data.value.push(createNode(key, "Select features of  " + queryBaseType.name, "features", "folder", IM.FOLDER, undefined, "", null));
    data.value[0].selectable = true;
    await createPropertyTree(queryBaseType.iri!, data.value[keyIndex]);
    return data.value;
  }

  function createNode(
    index: string,
    name: string | undefined,
    iri: string,
    type: string,
    iconType: string,
    typeOf: string | undefined,
    rangeType: string | undefined,
    parent: TreeNode | null,
    ascending?: string,
    descending?: string,
    definingProperty?: boolean
  ): TreeNode {
    const key = parent === null ? index : parent.key + "_" + index;
    let path;
    if (parent && parent.type === "property") {
      if (parent.data.path) path = parent.data.path;
    }
    if (typeOf) path = (path ? path + "\t" : "") + iri + "\t" + typeOf;
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
        definingProperty: definingProperty,
        ascending: ascending,
        descending: descending,
        parentNode: parent
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

  function createGroupNode(index: string, property: PropertyShape, parent: TreeNode): TreeNode {
    const name = property.group!.name;
    const groupNode = createNode(index, name, property.group!.iri, "folder", IM.FOLDER, undefined, "", parent) as TreeNode;
    if (property.property) {
      const propertyList = [] as TreeNode[];
      for (const [propertyIndex, groupedProperty] of property.property.entries()) {
        propertyList.push(createPropertyNode(propertyIndex.toString(), groupedProperty, groupNode));
      }
      groupNode.children = propertyList;
    }
    groupNode.selectable = false;
    return groupNode;
  }

  function createPropertyNode(index: string, property: PropertyShape, parent: TreeNode): TreeNode {
    if (property.group) {
      return createGroupNode(index, property, parent);
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
      index,
      name!,
      property.path.iri,
      "property",
      RDF.PROPERTY,
      typeOf,
      rangeType,
      parent,
      property.ascending,
      property.descending,
      property.definingProperty
    ) as TreeNode;
    propertyNode.selectable = true;
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

  async function getRootNodes(match: Match, nodes: TreeNode[]): Promise<TreeNode[]> {
    if (!match.path) return nodes;
    const rootNodes = [] as TreeNode[];
    await setRootNodesFromMatch(match, nodes, rootNodes);
    return rootNodes;
  }

  async function setRootNodesFromMatch(match: Match, nodes: TreeNode[], rootNodes: TreeNode[]) {
    const path = match.path![0]!;
    for (const node of nodes) {
      if (node.type === "folder") {
        await setRootNodesFromMatch(match, node.children!, rootNodes);
      } else if (node.data.iri === path.iri) {
        rootNodes.push(node);
        if (node.children!.length === 0) await expandNode(node);
        if (path.path && node.children && node.children.length > 0) {
          const subPath = path.path[0];
          await addRootNodes(rootNodes, subPath, node);
        }
      }
    }
    return rootNodes;
  }
  async function addRootNodes(rootNodes: TreeNode[], subPath: Path, node: TreeNode) {
    for (const child of node.children!) {
      if (child.type === "folder") {
        await addRootNodes(rootNodes, subPath, child);
      } else if (child.data.iri === subPath.iri) {
        rootNodes.push(child);
        if (child.children!.length === 0) await expandNode(child);
        if (subPath.path && child.children && child.children.length > 0) {
          const subSubPath = subPath.path[0];
          await addRootNodes(rootNodes, subSubPath, child);
        }
      }
    }
  }
  function getDefiningProperty(node: TreeNode): string | undefined {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.data.definingProperty) return child.data.iri;
      }
    }
    return undefined;
  }

  function getOrderables(node: TreeNode): Orderable[] {
    const orderables = [] as Orderable[];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.data.ascending) {
          orderables.push({
            iri: child.data.iri,
            name: child.label,
            ascending: child.data.ascending,
            descending: child.data.descending
          });
        }
      }
    }
    return orderables;
  }
  async function initialiseSelected(nodes: TreeNode[], expandedKeys: Record<string, boolean>, selectedKeys: TreeSelectionKeys, match: Match) {
    await initialiseSelectedPaths(nodes, expandedKeys, selectedKeys, match, match.path ? match.path[0] : undefined);
  }
  async function initialiseSelectedPaths(
    nodes: TreeNode[],
    expandedKeys: Record<string, boolean>,
    selectedKeys: TreeSelectionKeys,
    match: Match,
    path: Path | undefined
  ) {
    for (const node of nodes) {
      node.expanded = true;
      if (node.type === "folder") {
        await initialiseSelectedPaths(node.children!, expandedKeys, selectedKeys, match, path);
      } else if (path) {
        if (node.data.iri && node.data.iri === path.iri) {
          expandedKeys[node.key] = true;
          if (node.data.parentNode) expandedKeys[node.data.parentNode.key] = true;
          await expandNode(node);
          if (path.path) {
            await initialiseSelectedPaths(node.children!, expandedKeys, selectedKeys, match, path.path[0]);
          }
          if (match.where) await initialiseSelectedWheres(node.children!, expandedKeys, selectedKeys, match.where, path.variable);
        }
      } else if (match.where) await initialiseSelectedWheres(nodes, expandedKeys, selectedKeys, match.where, undefined);
    }
    if (match.or) {
      for (const or of match.or) {
        await initialiseSelectedPaths(nodes, expandedKeys, selectedKeys, or, or.path ? or.path[0] : undefined);
      }
    }
    if (match.and) {
      for (const and of match.and) {
        await initialiseSelectedPaths(nodes, expandedKeys, selectedKeys, and, and.path ? and.path[0] : undefined);
      }
    }
  }
  async function initialiseSelectedWheres(
    nodes: TreeNode[],
    expandedKeys: Record<string, boolean>,
    selectedKeys: TreeSelectionKeys,
    where: Where,
    nodeRef: string | undefined
  ) {
    if (where.iri && where.nodeRef == nodeRef) {
      for (const node of nodes) {
        if (node.type === "folder") {
          await initialiseSelectedWheres(node.children!, expandedKeys, selectedKeys, where, nodeRef);
        }
        if (node.data.iri && node.data.iri === where.iri) {
          selectedKeys[node.key] = { checked: true, partialChecked: false };
          await expandNode(node);
          if (node.data.parentNode) expandedKeys[node.data.parentNode.key] = true;
        }
      }
    }
    if (where.or) {
      for (const or of where.or) {
        await initialiseSelectedWheres(nodes, expandedKeys, selectedKeys, or, nodeRef);
      }
    }
    if (where.and) {
      for (const and of where.and) {
        await initialiseSelectedWheres(nodes, expandedKeys, selectedKeys, and, nodeRef);
      }
    }
    if (where.and) {
      for (const and of where.and) {
        await initialiseSelectedWheres(nodes, expandedKeys, selectedKeys, and, nodeRef);
      }
    }
  }
  return {
    getRootNodes,
    getOrderables,
    getDefiningProperty,
    createFeatureTree,
    expandNode,
    initialiseSelected,
    createPropertyTree,
    loading
  };
}
