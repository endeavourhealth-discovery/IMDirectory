import { DisplayMode } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isObjectHasKeys, parseArray } from "@endeavour/vue-library/helpers";
import {
  ArgumentReference,
  ArgumentReferenceSchema,
  IMLLanguage,
  IMLLanguageSchema,
  Indicator,
  IndicatorSchema,
  Match,
  PathDocument,
  PathDocumentSchema,
  PathQuery,
  Query,
  QueryRequest,
  QueryResponse,
  QueryResponseSchema,
  QuerySchema,
  Return,
  ReturnSchema,
  SearchResponse,
  SearchResponseSchema,
  TTEntity,
  TTEntitySchema
} from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/query/protected";

const QueryService = {
  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<QueryResponse> {
    if (controller) {
      const result = await api.post(API_URL + "/queryIM", query, { signal: controller.signal, raw: raw });
      return QueryResponseSchema.parse(result);
    } else {
      const result = await api.post(API_URL + "/queryIM", query, { raw: raw });
      return QueryResponseSchema.parse(result);
    }
  },
  async flattenBooleans(query: Query | Match): Promise<Query> {
    const result = await api.post(API_URL + "/flattenBooleans", query);
    return QuerySchema.parse(result);
  },
  async optimiseECLQuery(query: Query): Promise<Query> {
    const result = await api.post(API_URL + "/optimiseECLQuery", query);
    return QuerySchema.parse(result);
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResponse> {
    const result = await api.post(API_URL + "/queryIMSearch", query, { signal: controller?.signal, raw: raw });
    return SearchResponseSchema.parse(result);
  },

  async pathQuery(pathQuery: PathQuery, controller?: AbortController, raw: boolean = false): Promise<PathDocument> {
    const result = await api.post(API_URL + "/pathQuery", pathQuery, { signal: controller?.signal, raw: raw });
    return PathDocumentSchema.parse(result);
  },

  async askQuery(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<boolean> {
    return await api.post(API_URL + "/askQueryIM", query, { signal: controller?.signal, raw: raw });
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    const result = await api.get(API_URL + "/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
    return QuerySchema.parse(result);
  },

  async getQueryDisplayFromQuery(query: Query, displayMode: DisplayMode): Promise<Query> {
    const result = await api.post(API_URL + "/queryDisplayFromQuery", { query: query, displayMode: displayMode });
    return QuerySchema.parse(result);
  },

  async getDisplayFromQueryIri(iri: string, displayMode: DisplayMode): Promise<Query> {
    const result = await api.get(API_URL + "/queryDisplay", { params: { queryIri: iri, displayMode: displayMode } });
    return QuerySchema.parse(result);
  },
  async getQueryFromIri(iri: string): Promise<Query> {
    const result = await api.get(API_URL + "/queryFromIri", { params: { queryIri: iri } });
    return QuerySchema.parse(result);
  },

  async getDisplayFromIndicatorIri(iri: string): Promise<Indicator> {
    const result = await api.get(API_URL + "/indicatorDisplay", { params: { queryIri: iri } });
    return IndicatorSchema.parse(result);
  },

  async expandCohort(cohortIri: string, displayMode: DisplayMode): Promise<Query> {
    const result = await api.get(API_URL + "/expandCohort", { params: { cohortIri: cohortIri, displayMode: displayMode } });
    return QuerySchema.parse(result);
  },

  async getDefaultQuery(): Promise<Query> {
    const result = await api.get(API_URL + "/defaultQuery");
    return QuerySchema.parse(result);
  },
  async generateQuerySQL(queryIri: string, lang?: string): Promise<string> {
    return await api.get(API_URL + "/sql", { params: { queryIri: queryIri, lang: lang } });
  },

  async generateQueryIML(queryIri: string): Promise<IMLLanguage> {
    const result = await api.get(API_URL + "/imlFromIri", { params: { queryIri: queryIri } });
    return IMLLanguageSchema.parse(result);
  },
  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return await api.post(API_URL + "/sql", query);
  },

  async validateSelectionWithQuery(selectedIri: string, queryRequest: QueryRequest): Promise<boolean> {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: TTEntity) => entity.iri === selectedIri)
    );
  },

  async addQueryToRunnerQueue(queryRequest: QueryRequest): Promise<void> {
    return api.post(Env.QUERY_RUNNER + "/api/queue/job/add", queryRequest);
  },

  async testRunQuery(request: QueryRequest): Promise<string[]> {
    return api.post(API_URL + "/testRunQuery", request);
  },

  async findMissingArguments(request: QueryRequest): Promise<ArgumentReference[]> {
    const result = api.post(API_URL + "/public/findRequestMissingArguments", request);
    return parseArray(result, ArgumentReferenceSchema);
  },
  async validateQuery(query: Query): Promise<Query> {
    const result = await api.post(API_URL + "/validateQuery", query);
    return QuerySchema.parse(result);
  },

  async getNestedReturns(match: Match): Promise<Return[]> {
    const result = await api.post(API_URL + "/nestedReturns", { match: match });
    return parseArray(result, ReturnSchema);
  },

  async getSemanticMaps(match: Match, column: Return): Promise<TTEntity[]> {
    const result = await api.post(API_URL + "/semanticMapsForMatch", { match: match, return: column });
    return parseArray(result, TTEntitySchema);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
