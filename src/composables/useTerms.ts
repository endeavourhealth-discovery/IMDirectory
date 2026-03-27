import { ConceptService } from "@/services";
import { ref, Ref } from "vue";
import { SearchTermCode } from "vue-library/interfaces";

export function useTerms() {
  const terms: Ref<SearchTermCode[]> = ref([]);
  async function getTerms(iri: string) {
    terms.value = await ConceptService.getEntityTermCodes(iri, true);
  }
  return { terms, getTerms };
}
