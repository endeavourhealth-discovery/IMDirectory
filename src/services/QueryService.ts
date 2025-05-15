import Env from "./Env";
import { QueryResponse } from "@/interfaces";
import axios from "axios";
import { DisplayMode, Match, PathQuery, Query, QueryRequest, SearchResponse } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
const API_URL = Env.API + "api/query";

const QueryService = {
  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<QueryResponse> {
    if (controller) return await axios.post(API_URL + "/public/queryIM", query, { signal: controller.signal, raw: raw });
    else return await axios.post(API_URL + "/public/queryIM", query, { raw: raw });
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResponse> {
    return await axios.post(API_URL + "/public/queryIMSearch", query, { signal: controller?.signal, raw: raw });
  },

  async pathQuery(pathQuery: PathQuery, controller?: AbortController, raw: boolean = false): Promise<{ match: Match[] }> {
    return axios.post(API_URL + "/public/pathQuery", pathQuery, { signal: controller?.signal, raw: raw });
  },

  async askQuery(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<boolean> {
    return axios.post(API_URL + "/public/askQueryIM", query, { signal: controller?.signal, raw: raw });
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return axios.get(API_URL + "/public/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getQueryDisplayFromQuery(query: Query, displayMode: DisplayMode): Promise<Query> {
    return axios.post(API_URL + "/public/queryDisplayFromQuery", query, { params: { displayMode } });
  },

  async getDisplayFromQueryIri(iri: string, displayMode: DisplayMode): Promise<Query> {
    return axios.get(API_URL + "/public/queryDisplay", { params: { queryIri: iri, displayMode: displayMode } });
  },

  async getDefaultQuery(): Promise<Query> {
    return axios.get(API_URL + "/public/defaultQuery");
  },
  async generateQuerySQL(queryIri: string): Promise<string> {
    return axios.get(API_URL + "/public/sql", { params: { queryIri: queryIri } });
  },

  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return axios.post(API_URL + "/public/sql", query);
  },

  async validateSelectionWithQuery(selectedIri: string, queryRequest: QueryRequest): Promise<boolean> {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: TTEntity) => entity["@id"] === selectedIri)
    );
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
