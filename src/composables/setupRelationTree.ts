import type { TreeNode } from "primevue/treenode";
import { Match, NodeShape, Where } from "@/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { IM } from "@/vocabulary";
import { DataModelService } from "@/services";

function setupRelationTree() {
  const expandedKeys: Ref<any> = ref({});
  const loading: Ref<boolean> = ref(false);
  const nodes: Ref<TreeNode[]> = ref([]);

  function createReturnTree(match: Match, nodes: TreeNode[], shapes: NodeShape[]): void {
    if (match.return) {
      if (match.return.as) {
        const node = createNode(match.return.as, match.return.as, null, match.return.as, undefined, match, "nodeShape", false);
        nodes.push(node);
        if (match.typeOf && match.typeOf.iri) {
          shapes
            .find(shape => shape.iri === match.typeOf!.iri!)
            ?.property?.forEach(property => {
              node.children!.push(
                createNode(
                  match.return!.as! + property.path.iri,
                  node.label + " (" + property.path.name + ")",
                  null,
                  node.data.nodeRef,
                  property.path.iri,
                  match,
                  "propertyShape",
                  true
                )
              );
            });
        }
      }
    }
    for (const key of ["rule", "and", "or", "not"] as const) {
      if (match[key]) {
        for (const subMatch of match[key]) {
          createReturnTree(subMatch, nodes, shapes);
        }
      }
    }
    if (match.then) createReturnTree(match.then, nodes, shapes);
  }

  async function getPotentialTargetsInQuery(query: Match, valueType: string): Promise<NodeShape[]> {
    const potentialTargetIris = [] as string[];
    for (const key of ["rule", "and", "or", "not"] as const) {
      if (query[key]) {
        for (const match of query[key]) {
          getPotentialTargetsInMatch(match, potentialTargetIris);
        }
      }
    }
    return await DataModelService.getDataModelPropertiesWithValueType(potentialTargetIris, valueType);
  }

  function getPotentialTargetsInMatch(match: Match, potentialTargets: string[]): void {
    if (match.return && match.typeOf) {
      if (match.return.as) potentialTargets.push(match.typeOf.iri!);
    }
    for (const key of ["rule", "and", "or", "not"] as const) {
      if (match[key]) {
        for (const subMatch of match[key]) {
          getPotentialTargetsInMatch(subMatch, potentialTargets);
        }
      }
    }
  }

  async function createRelationTree(match: Match, dataType: string): Promise<TreeNode[]> {
    if (dataType === IM.DATE) {
      nodes.value.push(createNode("searchDate", "Search date", "$referenceDate", null, undefined, null, "parameter", true));
      nodes.value.push(createNode("baseline", "Achievement date", "$baseline", null, undefined, null, "parameter", true));
    }
    const potentialTargets = await getPotentialTargetsInQuery(match, dataType);
    createReturnTree(match, nodes.value, potentialTargets);
    return nodes.value;
  }

  function createNode(
    key: string,
    label: string | undefined,
    parameter: string | null,
    nodeRef: string | null,
    iri: string | undefined,
    match: Match | null,
    type: "parameter" | "nodeShape" | "propertyShape",
    leaf: boolean
  ): TreeNode {
    return {
      key: key,
      label: label,
      expanded: false,
      leaf: leaf,
      data: {
        parameter: parameter,
        match: match,
        nodeRef: nodeRef,
        type: type,
        iri: iri
      },
      loading: false,
      children: [] as TreeNode[]
    } as TreeNode;
  }

  function collapseNode(node: TreeNode) {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: false };
    for (const key of Object.keys(expandedKeys.value)) {
      if (key.toString().startsWith(node.key!)) {
        delete expandedKeys.value[key];
      }
    }
  }
  function getDefaultTarget(where: Where, tree: TreeNode[]): TreeNode {
    if (where.relativeTo) {
      for (const node in tree) {
        if (where.relativeTo.parameter) {
          if (tree[node].data) {
            if (tree[node].data.parameter === where.relativeTo.parameter) return tree[node];
          }
        } else if (where.relativeTo.nodeRef) if (tree[node].data.nodeRef && tree[node].data.nodeRef === where.relativeTo.nodeRef) return tree[node];
      }
    }
    return tree[0];
  }
  return {
    collapseNode,
    expandedKeys,
    loading,
    createRelationTree,
    nodes,
    getDefaultTarget
  };
}
export default setupRelationTree;
