import { Ref, ref } from "vue";

import type { SearchTermCode } from "vue-library/interfaces";

import { ConceptService } from "@/services";

export function useTerms() {
  const terms: Ref<SearchTermCode[]> = ref([]);
  async function getTerms(iri: string) {
    terms.value = await ConceptService.getEntityTermCodes(iri, true);
  }
  return { terms, getTerms };
}
