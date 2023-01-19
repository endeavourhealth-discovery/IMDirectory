import { EntityService, QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query, QueryRequest } from "@im-library/interfaces";
import { IM } from "@im-library/vocabulary";
import { Ref, ref } from "vue";

function setupRunQuery() {
  const showTestQueryResults: Ref<boolean> = ref(false);
  const imquery: Ref<Query> = ref({} as Query);
  const queryResults: Ref<{ entities: any[]; "@context": any }> = ref({} as { entities: any[]; "@context": any });

  async function runQueryFromIri(iri: string) {
    getQueryFromIri(iri);
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
    imquery,
    queryResults,
    runQuery,
    runQueryFromIri,
    runQueryRequest,
    getQueryFromIri
  };
}

export default setupRunQuery;
