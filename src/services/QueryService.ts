import Env from "./Env";
import { QueryResponse } from "@/interfaces";
import axios from "axios";
import {
  DBEntry,
  DisplayMode,
  Match,
  PathQuery,
  Query,
  QueryExecutorStatus,
  QueryRequest,
  RequeueQueryRequest,
  SearchResponse,
  PropertyShape,
  ArgumentReference
} from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
const API_URL = Env.API + "api/query";

const QueryService = {
  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<QueryResponse> {
    if (controller) return await axios.post(API_URL + "/public/queryIM", query, { signal: controller.signal, raw: raw });
    else return await axios.post(API_URL + "/public/queryIM", query, { raw: raw });
  },
  async flattenBooleans(query: Query | Match): Promise<Query | Match> {
    return await axios.post(API_URL + "/public/flattenBooleans", query);
  },
  async optimiseECLQuery(query: Query): Promise<Query> {
    return await axios.post(API_URL + "/public/optimiseECLQuery", query);
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResponse> {
    return await axios.post(API_URL + "/public/queryIMSearch", query, { signal: controller?.signal, raw: raw });
  },

  async pathQuery(pathQuery: PathQuery, controller?: AbortController, raw: boolean = false): Promise<{ match: Match[] }> {
    return await axios.post(API_URL + "/public/pathQuery", pathQuery, { signal: controller?.signal, raw: raw });
  },

  async askQuery(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<boolean> {
    return await axios.post(API_URL + "/public/askQueryIM", query, { signal: controller?.signal, raw: raw });
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return await axios.get(API_URL + "/public/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getQueryDisplayFromQuery(query: Query, displayMode: DisplayMode): Promise<Query> {
    return await axios.post(API_URL + "/public/queryDisplayFromQuery", query, { params: { displayMode } });
  },

  async getDisplayFromQueryIri(iri: string, displayMode: DisplayMode): Promise<Query> {
    return await axios.get(API_URL + "/public/queryDisplay", { params: { queryIri: iri, displayMode: displayMode } });
  },
  async getQueryFromIri(iri: string): Promise<Query> {
    return await axios.get(API_URL + "/public/queryFromIri", { params: { queryIri: iri } });
  },

  async getDefaultQuery(): Promise<Query> {
    return await axios.get(API_URL + "/public/defaultQuery");
  },
  async generateQuerySQL(queryIri: string, lang?: string): Promise<string> {
    return await axios.get(API_URL + "/public/sql", { params: { queryIri: queryIri, lang: lang } });
  },

  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return await axios.post(API_URL + "/public/sql", query);
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
    return axios.post(API_URL + "/addToQueue", queryRequest);
  },

  async getQueryQueue(page: number, size: number): Promise<{ totalCount: number; result: DBEntry[]; currentPage: number; pageSize: number }> {
    return axios.get(API_URL + "/userQueryQueue", { params: { page: page, size: size } });
  },

  async getQueryQueueByStatus(
    status: string,
    page: number,
    size: number
  ): Promise<{ result: DBEntry[]; totalCount: number; pageSize: number; currentPage: number }> {
    return axios.get(API_URL + "/userQueryQueueByStatus", {
      params: { status: status, page: page, size: size }
    });
  },

  async deleteFromQueryQueue(id: string): Promise<void> {
    return axios.delete(API_URL + "/deleteFromQueue", {
      params: { id: id }
    });
  },

  async cancelQuery(id: string): Promise<void> {
    return axios.post(API_URL + "/cancelQuery", { value: id });
  },

  async requeueQuery(request: RequeueQueryRequest): Promise<void> {
    return axios.post(API_URL + "/requeueQuery", request);
  },

  async getQueryResults(request: QueryRequest): Promise<string[]> {
    return axios.post(API_URL + "/getQueryResults", request);
  },

  async killActiveQuery(): Promise<void> {
    return axios.post(API_URL + "/killActiveQuery");
  },

  async testRunQuery(request: QueryRequest): Promise<string[]> {
    return axios.post(API_URL + "/testRunQuery", request);
  },

  async findMissingArguments(request: QueryRequest): Promise<ArgumentReference[]> {
    return axios.post(API_URL + "/findRequestMissingArguments", request);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
