import { EntityService, QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query, QueryRequest } from "@im-library/models/AutoGen";
import { IM, RDFS, SHACL } from "@im-library/vocabulary";
import { Ref, ref } from "vue";

function setupRunQuery() {
  const showTestQueryResults: Ref<boolean> = ref(false);
  const showTestQueryParams: Ref<boolean> = ref(false);
  const imquery: Ref<Query> = ref({} as Query);
  const params: Ref<{ name: string; desc: string; type: string; minCount: number; maxCount: number; value: any }[]> = ref([]);
  const queryResults: Ref<{ entities: any[]; "@context": any }> = ref({} as { entities: any[]; "@context": any });

  async function hasParams(iri: string) {
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PARAMETER]);
    return isObjectHasKeys(entity, [SHACL.PARAMETER]);
  }

  async function getParams(iri: string) {
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
    await getQueryFromIri(iri);
    const queryRequest = {
      query: imquery.value
    } as QueryRequest;
    queryResults.value = await QueryService.queryIM(queryRequest);
  }

  async function runQuery(query: Query) {
    const queryRequest = {
      query: query
    } as QueryRequest;
    queryResults.value = await QueryService.queryIM(queryRequest);
  }

  async function runQueryRequest(queryRequest: QueryRequest) {
    queryResults.value = await QueryService.queryIM(queryRequest);
  }

  async function getQueryFromIri(iri: string) {
    const entity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(entity, [IM.DEFINITION])) {
      imquery.value = JSON.parse(entity[IM.DEFINITION]);
    }
  }

  return {
    showTestQueryResults,
    showTestQueryParams,
    imquery,
    queryResults,
    params,
    hasParams,
    getParams,
    runQuery,
    runQueryFromIri,
    runQueryRequest,
    getQueryFromIri
  };
}

export default setupRunQuery;
