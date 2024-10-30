import Env from "./Env";
import { AllowableChildProperty, QueryResponse } from "@im-library/interfaces";
import axios from "axios";
import { Match, PathQuery, Query, QueryRequest, SearchResponse } from "@im-library/interfaces/AutoGen";
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

  async checkValidation(validationIri: string, data: any): Promise<{ isValid: boolean; message: string | undefined }> {
    return axios.post(Env.VITE_NODE_API + "node_api/validation/public/validate", data, { params: { iri: validationIri } });
  },

  async getAllowableChildTypes(conceptIri: string): Promise<AllowableChildProperty[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableChildTypes", {
      params: { iri: conceptIri }
    });
  },

  async getPropertyRange(propIri: string): Promise<any[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/propertyRange", {
      params: { propIri: propIri }
    });
  },

  async getLabeledQuery(query: Query): Promise<Query> {
    return axios.post(API_URL + "/public/labelQuery", query);
  },

  async getQueryDisplay(iri: string, includeLogicDesc: boolean): Promise<Query> {
    return axios.get(API_URL + "/public/queryDisplay", { params: { queryIri: iri, includeLogicDesc: includeLogicDesc } });
  },

  async getQueryDisplayFromQuery(query: Query, includeLogicDesc: boolean): Promise<Query> {
    return axios.post(API_URL + "/public/queryDisplayFromQuery", query, {
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
    return axios.get(API_URL + "/public/sql", { params: { queryIri: queryIri } });
  },

  async generateQuerySQLfromQuery(query: Query): Promise<string> {
    return axios.post(API_URL + "/public/sql", query);
  },

  async validateSelectionWithQuery(selectedIri: string, queryRequest: QueryRequest): Promise<string> {
    return axios.post(Env.VITE_NODE_API + "node_api/query/public/selection/validate", { iri: selectedIri, queryRequest: queryRequest });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
