import { useRootStore } from "@/stores/rootStore";

function findInTree() {
  const rootStore = useRootStore();
  async function locateInTree(event: any, iri: string) {
    event.stopPropagation();
    rootStore.updateFindInTreeIri(iri);
  }
  return { locateInTree };
}

export default findInTree;
