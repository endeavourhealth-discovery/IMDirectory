import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { Match, Path, PropertyShape, Node } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Ref, ref } from "vue";

function setupPropertyTree() {
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

  async function createFeatureTree(queryBaseType: Node): Promise<TreeNode[]> {
    baseType.value = queryBaseType;
    const data = ref([] as TreeNode[]);
    let key = "0";
    let keyIndex = 0;
    data.value.push(createNode(key, "Add a cohort as feature", "cohort", "cohort", IM.QUERY, undefined, "", null));
    key = "1";
    keyIndex++;
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
    parent: TreeNode | null
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
        typeOf: typeOf
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
    const propertyNode = createNode(index, name!, property.path.iri, "property", RDF.PROPERTY, typeOf, rangeType, parent) as TreeNode;
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
    for (const path of match.path!) {
      for (const node of nodes) {
        if (node.type === "folder") {
          await setRootNodesFromMatch(match, node.children!, rootNodes);
        } else if (node.data.iri === path.iri) {
          rootNodes.push(node);
          if (node.children!.length === 0) await expandNode(node);
          if (path.path && path.path.length > 0 && node.children && node.children.length > 0) {
            for (const subPath of path.path) {
              await addRootNodes(rootNodes, subPath, node);
            }
          }
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
        if (subPath.path && subPath.path.length > 0 && child.children && child.children.length > 0) {
          for (const subSubPath of subPath.path) {
            await addRootNodes(rootNodes, subSubPath, child);
          }
        }
      }
    }
  }
  return {
    getRootNodes,
    createFeatureTree,
    expandNode,
    loading
  };
}
export default setupPropertyTree;
