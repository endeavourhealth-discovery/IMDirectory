import { isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import { EntityService } from "@/im_library/services";
import { IM, RDFS } from "@/im_library/vocabulary";
import { ref, Ref } from "vue";

function setupTerms() {
  const terms: Ref<any[] | undefined> = ref([]);
  async function getTerms(iri: string) {
    const entity = await EntityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
    terms.value = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
      ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
          return { name: term[RDFS.LABEL], code: term[IM.CODE] };
        })
      : undefined;
  }
  return { terms, getTerms };
}

export default setupTerms;
