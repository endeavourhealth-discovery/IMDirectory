import Env from "./Env";
import { AllowableChildProperty, QueryResponse } from "@im-library/interfaces";
import axios from "axios";
import { Match, PathQuery, Query, QueryRequest, SearchResponse } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const QueryService = {
  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<QueryResponse> {
    if (controller) return await axios.post(Env.API + "api/query/public/queryIM", query, { signal: controller.signal, raw: raw });
    else return await axios.post(Env.API + "api/query/public/queryIM", query, { raw: raw });
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResponse> {
    return await axios.post(Env.API + "api/query/public/queryIMSearch", query, { signal: controller?.signal, raw: raw });
  },

  async pathQuery(pathQuery: PathQuery, controller?: AbortController, raw: boolean = false): Promise<{ match: Match[] }> {
    return axios.post(Env.API + "api/query/public/pathQuery", pathQuery, { signal: controller?.signal, raw: raw });
  },

  async askQuery(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<boolean> {
    return axios.post(Env.API + "api/query/public/askQueryIM", query, { signal: controller?.signal, raw: raw });
  },

  async getLabeledQuery(query: Query): Promise<Query> {
    return axios.post(Env.API + "api/query/public/labelQuery", query);
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return axios.get(Env.API + "api/query/public/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getQueryDisplayFromQuery(query: Query, includeLogicDesc: boolean): Promise<Query> {
    return axios.post(Env.API + "api/query/public/queryDisplayFromQuery", query, {
      params: { includeLogicDesc: includeLogicDesc }
    });
  },

  async getDisplayFromQueryIri(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return axios.get(Env.API + "api/query/public/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getDisplayFromQuery(query: Query, includeLogicDesc: boolean): Promise<Query> {
    return axios.post(Env.API + "api/query/public/queryDisplayFromQuery", query, {
      params: { includeLogicDesc: includeLogicDesc }
    });
  },

  async generateQuerySQL(queryIri: string): Promise<string> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/generateQuerySQL", { params: { queryIri: queryIri } });
  },

  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return axios.post(Env.VITE_NODE_API + "node_api/query/public/generateQuerySQL", query);
  },

  async validateSelectionWithQuery(selectedIri: string, queryRequest: QueryRequest): Promise<boolean> {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: any) => entity["@id"] === selectedIri)
    );
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
