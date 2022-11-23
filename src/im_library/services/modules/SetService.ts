import axios, { CancelToken } from "axios";
import { Query, SearchResponse, SetQueryObject } from "@/im_library/interfaces";
import Env from "./Env";

const SetService = {
  async ECLSearch(searchString: string, includeLegacy: boolean, limit: number, controller: AbortController): Promise<SearchResponse> {
    try {
      return await axios.post(Env.API + "api/set/public/eclSearch", searchString, {
        headers: { "Content-Type": "text/plain" },
        params: { includeLegacy: includeLegacy, limit: limit },
        signal: controller.signal
      });
    } catch (error) {
      return {} as SearchResponse;
    }
  },

  async getQueryFromECL(ecl: string): Promise<Query> {
    return axios.get(Env.API + "api/set/public/ecl/query", {
      params: { ecl: ecl }
    });
  },

  async isValidECL(ecl: string): Promise<boolean> {
    return axios.get(Env.API + "api/set/public/ecl/validity", {
      params: { ecl: ecl }
    });
  },

  async getECLFromQuery(query: Query): Promise<string> {
    return axios.post(Env.API + "api/set/public/query/ecl", query);
  },

  async publish(conceptIri: string) {
    return axios.get(Env.API + "api/set/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string) {
    return axios.get(Env.API + "api/set/public/export", {
      params: { iri: conceptIri },
      responseType: "blob"
    });
  },

  async getSetQueryObjectFromQuery(query: Query) {
    return axios.post(Env.VITE_NODE_API + "node_api/set/public/query/setQueryObject", query);
  },

  async getQueryFromSetQueryObject(clauses: SetQueryObject[]) {
    return axios.post(Env.VITE_NODE_API + "node_api/set/public/setQueryObject/query", clauses);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
