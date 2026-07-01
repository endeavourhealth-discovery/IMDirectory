import { DisplayMode } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import {
  ArgumentReference,
  ExtendedTTEntity,
  IMLLanguage,
  Indicator,
  Match,
  PathQuery,
  Query,
  QueryRequest,
  Return,
  SearchResponse,
  TTEntity
} from "@endeavour/vue-library/interfaces";

import { QueryResponse } from "@/interfaces";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/query/protected";

const QueryService = {
  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<QueryResponse> {
    if (controller) return await api.post(API_URL + "/queryIM", query, { signal: controller.signal, raw: raw });
    else return await api.post(API_URL + "/queryIM", query, { raw: raw });
  },
  async flattenBooleans(query: Query | Match): Promise<Query | Match> {
    return await api.post(API_URL + "/flattenBooleans", query);
  },
  async optimiseECLQuery(query: Query): Promise<Query> {
    return await api.post(API_URL + "/optimiseECLQuery", query);
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResponse> {
    return await api.post(API_URL + "/queryIMSearch", query, { signal: controller?.signal, raw: raw });
  },

  async pathQuery(pathQuery: PathQuery, controller?: AbortController, raw: boolean = false): Promise<{ match: Match[] }> {
    return await api.post(API_URL + "/pathQuery", pathQuery, { signal: controller?.signal, raw: raw });
  },

  async askQuery(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<boolean> {
    return await api.post(API_URL + "/askQueryIM", query, { signal: controller?.signal, raw: raw });
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return await api.get(API_URL + "/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getQueryDisplayFromQuery(query: Query, displayMode: DisplayMode): Promise<Query> {
    return await api.post(API_URL + "/queryDisplayFromQuery", { query: query, displayMode: displayMode });
  },

  async getDisplayFromQueryIri(iri: string, displayMode: DisplayMode): Promise<Query> {
    return await api.get(API_URL + "/queryDisplay", { params: { queryIri: iri, displayMode: displayMode } });
  },
  async getQueryFromIri(iri: string): Promise<Query> {
    return await api.get(API_URL + "/queryFromIri", { params: { queryIri: iri } });
  },

  async getDisplayFromIndicatorIri(iri: string): Promise<Indicator> {
    return await api.get(API_URL + "/indicatorDisplay", { params: { queryIri: iri } });
  },

  async expandCohort(cohortIri: string, displayMode: DisplayMode): Promise<Query> {
    return await api.get(API_URL + "/expandCohort", { params: { cohortIri: cohortIri, displayMode: displayMode } });
  },

  async getDefaultQuery(): Promise<Query> {
    return await api.get(API_URL + "/defaultQuery");
  },
  async generateQuerySQL(queryIri: string, lang?: string): Promise<string> {
    return await api.get(API_URL + "/sql", { params: { queryIri: queryIri, lang: lang } });
  },

  async generateQueryIML(queryIri: string): Promise<IMLLanguage> {
    return await api.get(API_URL + "/imlFromIri", { params: { queryIri: queryIri } });
  },
  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return await api.post(API_URL + "/sql", query);
  },

  async validateSelectionWithQuery(selectedIri: string, queryRequest: QueryRequest): Promise<boolean> {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: ExtendedTTEntity) => entity.iri === selectedIri)
    );
  },

  async addQueryToRunnerQueue(queryRequest: QueryRequest): Promise<void> {
    return api.post(Env.QUERY_RUNNER + "/api/queue/job/add", queryRequest);
  },

  async testRunQuery(request: QueryRequest): Promise<string[]> {
    return api.post(API_URL + "/testRunQuery", request);
  },

  async findMissingArguments(request: QueryRequest): Promise<ArgumentReference[]> {
    return api.post(API_URL + "/public/findRequestMissingArguments", request);
  },
  async validateQuery(query: Query): Promise<Query> {
    return await api.post(API_URL + "/validateQuery", query);
  },

  async getNestedReturns(match: Match): Promise<Return[]> {
    return await api.post(API_URL + "/nestedReturns", { match: match });
  },

  async getSemanticMaps(match: Match): Promise<TTEntity[]> {
    return await api.post(API_URL + "/semanticMapsForDataset", match);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
