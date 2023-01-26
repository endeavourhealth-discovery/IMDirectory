import { Query, SearchResponse } from "@im-library/interfaces";
import axios from "axios";
import Env from "./Env";

const EclService = {
  async ECLSearch(eclSearchRequest: any, controller: AbortController): Promise<SearchResponse> {
    try {
      return await axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest, {
        signal: controller.signal
      });
    } catch (error) {
      return {} as SearchResponse;
    }
  },

  async getEcl(query: any): Promise<string> {
    try {
      return await axios.post(Env.API + "api/ecl/public/ecl", query);
    } catch (error) {
      return "";
    }
  },

  async evaluateEcl(ecl: string): Promise<any> {
    return axios.post(Env.API + "api/ecl/public/evaluateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getQueryFromECL(ecl: string): Promise<Query> {
    return axios.get(Env.API + "api/ecl/public/queryFromEcl", {
      params: { ecl: ecl }
    });
  },

  async isValidECL(ecl: string): Promise<boolean> {
    return axios.get(Env.API + "api/ecl/public/validateEcl", {
      params: { ecl: ecl }
    });
  },

  async getECLFromQuery(query: Query): Promise<string> {
    return axios.post(Env.API + "api/ecl/public/eclFromQuery", query);
  },

  async parseEcl(ecl: string): Promise<any> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/parseEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  }
};

export default EclService;
