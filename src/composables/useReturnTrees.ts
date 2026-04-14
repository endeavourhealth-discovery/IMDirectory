import type { TreeNode } from "primevue/treenode";
import { DataModelService } from "@/services";
import { getColourFromType, getFAIconFromType, isArrayHasLength } from "vue-library/helpers";
import { IM, RDF, RDFS, SHACL } from "vue-library/enums";
import type { PropertyShape, Node } from "vue-library/interfaces";
import { Ref, ref } from "vue";

export function useReturnTrees() {
  const baseType: Ref<Node> = ref({} as Node);
  const loading: Ref<boolean> = ref(false);
  const codeable = [IM.VALUE_SET, IM.CONCEPT_SET, IM.CONCEPT];

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

  async function createTypeTree(iri: string, parent: TreeNode) {
    const entity = await DataModelService.getDataModelProperties(iri, false);
    const propertyList = [] as TreeNode[];
    if (entity.property && isArrayHasLength(entity.property)) {
      for (const [index, property] of entity.property.entries()) {
        if (!isBase(property)) {
          if (property.node || property.group) {
            propertyList.push(createReturnNode(index.toString(), property, parent));
          }
        }
      }
      if (propertyList.length > 0) parent.children = propertyList;
    }
  }

  async function createReturnTree(queryBaseType: Node): Promise<TreeNode[]> {
    baseType.value = queryBaseType;
    const data = ref([] as TreeNode[]);
    const key = "0";
    data.value.push(createNode(key, "Select features of  " + queryBaseType.name, "features", "folder", IM.FOLDER, undefined, "", null));
    data.value[0].selectable = true;
    await createTypeTree(queryBaseType.iri!, data.value[0]);
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
        parent: parent ? parent.key : null,
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
  function createReturnGroupNode(index: string, property: PropertyShape, parent: TreeNode): TreeNode {
    const name = property.group!.name;
    parent.leaf = false;
    const groupNode = createNode(index, name, property.group!.iri, "folder", IM.FOLDER, undefined, "", parent) as TreeNode;
    if (property.property) {
      const propertyList = [] as TreeNode[];
      for (const [propertyIndex, groupedProperty] of property.property.entries()) {
        if (groupedProperty.node) {
          propertyList.push(createReturnNode(propertyIndex.toString(), groupedProperty, parent));
        }
      }
      groupNode.children = propertyList;
    }
    groupNode.selectable = true;
    return groupNode;
  }

  function createReturnNode(index: string, property: PropertyShape, parent: TreeNode): TreeNode {
    if (property.group) {
      return createReturnGroupNode(index, property, parent);
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
    if (propertyNode.data.rangeType) {
      if (codeable.includes(propertyNode.data.rangeType)) {
        propertyNode.leaf = false;
        propertyNode.data.rangeType = IM.CODEABLE;
      }
    }
    propertyNode.selectable = true;
    propertyNode.leaf = false;
    delete propertyNode.children;
    return propertyNode;
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
  async function expandNode(queryBaseType: Node, node: TreeNode): Promise<TreeNode[]> {
    const fieldNodes = ref([] as TreeNode[]);
    node.loading = true;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          if (child.data.typeOf) {
            child.leaf = true;
          } else child.leaf = false;
        }
      }
    }
    if (node.data.typeOf) {
      fieldNodes.value.push(createNode("0", node.label, node.data.iri, "folder", IM.FOLDER, undefined, "", node));
      await createPropertyTree(node.data.typeOf, fieldNodes.value[0]);
      if (fieldNodes.value[0].children && fieldNodes.value[0].children.length > 0) {
        return fieldNodes.value;
      } else fieldNodes.value = [];
    }
    node.loading = false;
    return fieldNodes.value;
  }

  return {
    createReturnTree,
    expandNode,
    createPropertyTree,
    loading
  };
}
