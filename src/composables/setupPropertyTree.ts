import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { Match, Path, PropertyShape, Node, PropertyRange } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Ref, ref } from "vue";

function setupPropertyTree() {
  const baseType: Ref<Node> = ref({} as Node);
  const expandedKeys: Ref<any> = ref({});
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
    data.value.push(createNode(key, "Add a cohort as feature", "cohort", "cohort", IM.QUERY, null, "", null));
    key = "1";
    keyIndex++;
    data.value.push(createNode(key, "Select features of  " + queryBaseType.name, "features", "folder", IM.FOLDER, null, "", null));
    data.value[0].selectable = true;
    await createPropertyTree(queryBaseType.iri!, data.value[keyIndex]);
    expandedKeys.value = key === "1" ? { "1": true } : { "0": true };
    return data.value;
  }

  function createNode(
    index: string,
    conceptName: string | undefined,
    conceptIri: string,
    type: string,
    iconType: string,
    range: PropertyRange | null,
    rangeType: string,
    parent: TreeNode | null
  ): TreeNode {
    const key = parent === null ? index : parent.key + "_" + index;
    const node = {
      key: key,
      label: conceptName,
      expanded: false,
      data: {
        typeIcon: getFAIconFromType([{ iri: iconType }]),
        color: getColourFromType([{ iri: iconType }]),
        iri: conceptIri,
        parentNode: parent,
        range: range
      },
      loading: false,
      children: [] as TreeNode[],
      type: type
    } as TreeNode;
    if (rangeType != "") {
      if (rangeType === SHACL.NODESHAPE) node.leaf = false;
      node.data.rangeTypeIcon = getFAIconFromType([{ iri: rangeType }]);
      node.data.rangeTypeColor = getColourFromType([{ iri: rangeType }]);
    }
    return node;
  }

  function createGroupNode(index: string, property: PropertyShape, parent: TreeNode): TreeNode {
    const name = property.group!.name;
    const groupNode = createNode(index, name, property.group!.iri, "folder", IM.FOLDER, null, "", parent) as TreeNode;
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
    let rangeType = "";
    let range = {} as PropertyRange;
    if (property.clazz) {
      rangeType = property.clazz.type!.iri;
    } else if (property.node) {
      range = property.node;
      rangeType = property.node.type!.iri;
    }

    let name = "";
    if (property.path.name) name = property.path.name;
    if (property.hasValue) {
      const value = property.hasValueType?.iri === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
      name += ` (${value})`;
    }
    const propertyNode = createNode(index, name!, property.path.iri, "property", RDF.PROPERTY, range, rangeType, parent) as TreeNode;
    propertyNode.selectable = true;
    if (property.node) {
      propertyNode.data.range = property.node.iri;
      propertyNode.data.rangeName = property.node.name;
    }
    return propertyNode;
  }

  function isBase(property: PropertyShape): boolean {
    if (property.node) {
      if (property.node.iri === baseType.value.iri) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  async function expandNode(node: TreeNode) {
    node.loading = true;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          if (child.data.range) {
            child.leaf = false;
          } else child.lead = false;
        }
      }
    } else if (node.data.range) {
      node.data.path = node.data.path === "" ? node.data.iri + "," + node.data.range : node.data.path + "," + node.data.iri + "," + node.data.range;
      await createPropertyTree(node.data.range, node);
    }
    node.loading = false;
  }

  function collapseNode(node: TreeNode) {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: false };
    for (const key of Object.keys(expandedKeys.value)) {
      if (key.toString().startsWith(node.key!)) {
        delete expandedKeys.value[key];
      }
    }
  }
  function getRootNodes(match: Match, nodes: TreeNode[]): TreeNode[] {
    if (!match.path) return nodes;
    const rootNodes = [] as TreeNode[];
    for (const path of match.path) {
      for (const node of nodes) {
        if (node.type === "folder") {
          getRootNodes(match, node.children!);
        } else if (node.data.iri === path.iri) {
          rootNodes.push(node);
          if (path.path && path.path.length > 0 && node.children && node.children.length > 0) {
            for (const subPath of path.path) {
              addRootNodes(rootNodes, subPath, node);
            }
          }
        }
      }
    }
    return rootNodes;
  }
  function addRootNodes(rootNodes: TreeNode[], subPath: Path, node: TreeNode) {
    for (const child of node.children!) {
      if (child.type === "folder") {
        addRootNodes(rootNodes, subPath, child);
      } else if (child.data.iri === subPath.iri) {
        rootNodes.push(child);
        if (subPath.path && subPath.path.length > 0 && child.children && child.children.length > 0) {
          for (const subSubPath of subPath.path) {
            addRootNodes(rootNodes, subSubPath, child);
          }
        }
      }
    }
  }
  return {
    getRootNodes,
    createFeatureTree,
    createNode,
    expandNode,
    collapseNode,
    expandedKeys,
    loading
  };
}
export default setupPropertyTree;
