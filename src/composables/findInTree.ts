import { useStore } from "vuex";

function findInTree() {
  const store = useStore();
  async function locateInTree(event: any, iri: string) {
    event.stopPropagation();
    store.commit("updateFindInTreeIri", iri);
  }
  return { locateInTree };
}

export default findInTree;
