import axios, { CancelToken } from "axios";
import { Query, SearchResponse, SetQueryObject } from "@im-library/interfaces";
import Env from "./Env";

const SetService = {
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
