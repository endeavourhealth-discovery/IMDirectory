import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { PropertyShape, Node } from "@/interfaces/AutoGen";
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
    data.value.push(createNode("0", "Add a cohort as feature", "cohort", "cohort", IM.QUERY, "", null, ""));
    data.value.push(createNode("1", "Add " + baseType.value.name + " features", "features", "folder", IM.FOLDER, "", null, ""));
    data.value[0].selectable = true;
    await createPropertyTree(baseType.value.iri!, data.value[1]);
    expandedKeys.value = { 1: true };
    return data.value;
  }

  function createNode(
    index: string,
    conceptName: string | undefined,
    conceptIri: string,
    type: string,
    iconType: string,
    rangeType: string,
    parent: TreeNode | null,
    path: string
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
        path: path
      },
      loading: false,
      children: [] as TreeNode[],
      parentNode: parent,
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
    const groupNode = createNode(index, name, property.group!.iri, "folder", IM.FOLDER, "", parent, parent.data.path) as TreeNode;
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
    let path = "";
    if (property.clazz) {
      rangeType = property.clazz.type!.iri;
    } else if (property.node) {
      rangeType = property.node.type!.iri;
      path = parent.data.path === "" ? property.path.iri + "," + property.node.iri : parent.data.path + "," + property.path.iri + property.node.iri;
    }

    let name = "";
    if (property.path.name) name = property.path.name;
    if (property.hasValue) {
      const value = property.hasValueType?.iri === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
      name += ` (${value})`;
    }
    const propertyNode = createNode(index, name!, property.path.iri, "property", RDF.PROPERTY, rangeType, parent, path);
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
  return {
    createFeatureTree,
    expandNode,
    collapseNode,
    expandedKeys,
    loading
  };
}
export default setupPropertyTree;
