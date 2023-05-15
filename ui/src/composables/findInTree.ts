import { useDirectoryStore } from "@/stores/directoryStore";

function findInTree() {
  const directoryStore = useDirectoryStore();
  async function locateInTree(event: any, iri: string) {
    event.stopPropagation();
    directoryStore.updateFindInTreeIri(iri);
  }
  return { locateInTree };
}

export default findInTree;
