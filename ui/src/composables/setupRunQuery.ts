import { EntityService, QueryService } from "@/services";
import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { RDFS, SHACL } from "@im-library/vocabulary";
import { Ref, ref } from "vue";

function setupRunQuery() {
  const showTestQueryResults: Ref<boolean> = ref(false);
  const showTestQueryParams: Ref<boolean> = ref(false);
  const queryRequest: Ref<QueryRequest> = ref({} as QueryRequest);
  const params: Ref<{ name: string; desc: string; type: string; minCount: number; maxCount: number; value: any }[]> = ref([]);
  const queryResults: Ref<{ entities: any[]; "@context": any }> = ref({} as { entities: any[]; "@context": any });

  async function hasParams(iri: string) {
    return await EntityService.hasPredicates(iri, [SHACL.PARAMETER]);
  }

  async function getParams(iri: string) {
    params.value = [];
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PARAMETER]);
    for (const param of entity[SHACL.PARAMETER]) {
      params.value.push({
        name: param[RDFS.LABEL],
        desc: param[RDFS.COMMENT],
        type: param[SHACL.CLASS]?.[0]?.name || param[SHACL.DATATYPE]?.[0]?.name,
        minCount: param[SHACL.MINCOUNT],
        maxCount: param[SHACL.MAXCOUNT],
        value: ""
      });
    }
  }

  async function runQueryFromIri(iri: string) {
    queryRequest.value.query = { "@id": iri } as Query;
    queryResults.value = await QueryService.queryIM(queryRequest.value);
  }

  return {
    showTestQueryResults,
    showTestQueryParams,
    queryResults,
    params,
    queryRequest,
    hasParams,
    getParams,
    runQueryFromIri
  };
}

export default setupRunQuery;
