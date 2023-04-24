import { useRootStore } from "@/stores/root";

function findInTree() {
  const store = useRootStore();
  async function locateInTree(event: any, iri: string) {
    event.stopPropagation();
    store.updateFindInTreeIri(iri);
  }
  return { locateInTree };
}

export default findInTree;
