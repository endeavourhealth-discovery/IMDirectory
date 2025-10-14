import type { TreeNode } from "primevue/treenode";
import { Match, NodeShape, Where, Query } from "@/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { IM } from "@/vocabulary";
import { DataModelService } from "@/services";
import { getTypeFromClause } from "@/helpers/QueryEditorMethods";
import { useQueryStore } from "@/stores/queryStore";

function setupRelationTree() {
  const expandedKeys: Ref<any> = ref({});
  const loading: Ref<boolean> = ref(false);
  const nodes: Ref<TreeNode[]> = ref([]);
  const queryStore = useQueryStore();

  function createReturnTree(match: Match, nodes: TreeNode[], shapes: NodeShape[]): void {
    for (const as of queryStore.returnMap.keys()) {
      const match = queryStore.returnMap.get(as) as Match;
      const node = createNode(as, as, null, as, undefined, match, "nodeShape", false);
      nodes.push(node);
      const matchType = getTypeFromClause(match);
      if (matchType) {
        shapes
          .find(shape => shape.iri === matchType)
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

  async function getPotentialTargetsInQuery(query: Query, valueType: string): Promise<NodeShape[]> {
    const potentialTargetIris = [] as string[];
    potentialTargetIris.push(query.typeOf!.iri!);
    for (const as of queryStore.returnMap.keys()) {
      const match = queryStore.returnMap.get(as) as Match;
      const matchType = getTypeFromClause(match);
      if (matchType) potentialTargetIris.push(matchType);
    }
    return await DataModelService.getDataModelPropertiesWithValueType(potentialTargetIris, valueType);
  }

  async function createRelationTree(match: Match, dataType: string): Promise<TreeNode[]> {
    if (dataType === IM.DATE) {
      nodes.value.push(createNode("searchDate", "Search date", "$searchDate", null, undefined, null, "parameter", true));
      nodes.value.push(createNode("achievementDate", "Achievement date", "$achievementDate", null, undefined, null, "parameter", true));
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
