import { EntityService, QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query, QueryRequest } from "@im-library/models/AutoGen";
import { IM } from "@im-library/vocabulary";
import { Ref, ref } from "vue";

function setupRunQuery() {
  const showTestQueryResults: Ref<boolean> = ref(false);
  const showTestQueryParams: Ref<boolean> = ref(false);
  const imquery: Ref<Query> = ref({} as Query);
  const params: Ref<Set<string>> = ref(new Set());
  const queryResults: Ref<{ entities: any[]; "@context": any }> = ref({} as { entities: any[]; "@context": any });

  async function hasParams(iri: string) {
    await getQueryFromIri(iri);
    return JSON.stringify(imquery.value).includes("$");
  }

  async function findParams(queryString: string) {
    for (const [index, letter] of queryString.split("").entries()) {
      if (letter === "$") {
        const substring = queryString.substring(index);
        const endIndex = substring.indexOf('"');
        const param = substring.substring(0, endIndex);
        params.value.add(param);
      }
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
    findParams,
    runQuery,
    runQueryFromIri,
    runQueryRequest,
    getQueryFromIri
  };
}

export default setupRunQuery;
