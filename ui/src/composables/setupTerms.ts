import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { IM, RDFS } from "@im-library/vocabulary";
import { ref, Ref } from "vue";

function setupTerms() {
  const terms: Ref<any[] | undefined> = ref([]);
  async function getTerms(iri: string) {
    terms.value = await EntityService.getEntityTermCodes(iri, true);
  }
  return { terms, getTerms };
}

export default setupTerms;
