import { EntityService } from "@/services";
import { ref, Ref } from "vue";
import { SearchTermCode } from "@im-library/interfaces/AutoGen";

function setupTerms() {
  const terms: Ref<SearchTermCode[]> = ref([]);
  async function getTerms(iri: string) {
    terms.value = await EntityService.getEntityTermCodes(iri, true);
  }
  return { terms, getTerms };
}

export default setupTerms;
