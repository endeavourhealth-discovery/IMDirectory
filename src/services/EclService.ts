import { entityToAliasEntity } from "@/helpers/Transforms";
import axios from "axios";
import Env from "./Env";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Query, SearchResultSummary, EclSearchRequest, SearchResponse, ECLStatus } from "@/interfaces/AutoGen";

const EclService = {
  async ECLSearch(eclSearchRequest: EclSearchRequest, controller?: AbortController): Promise<SearchResponse> {
    const results: SearchResponse = await axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest, {
      signal: controller?.signal
    });
    return results;
  },

  async getEcl(query: Query): Promise<string> {
    return await axios.post(Env.API + "api/ecl/public/ecl", query);
  },

  async getQueryFromECL(ecl: string, raw: boolean = false): Promise<Query> {
    return await axios.post(Env.API + "api/ecl/public/queryFromEcl", ecl, { headers: { "Content-Type": "text/plain" }, raw: raw });
  },

  async getEclFromEcl(ecl: string, showNames: boolean): Promise<string> {
    return axios.post(Env.API + "api/ecl/public/eclFromEcl", { ecl, showNames }, { headers: { "Content-Type": "application/json" }, raw: true });
  },

  async validateECL(ecl: string): Promise<ECLStatus> {
    return axios.post(Env.API + "api/ecl/public/validateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getECLFromQuery(query: Query, showNames?: boolean): Promise<any> {
    return await axios.post(
      Env.API + "api/ecl/public/eclFromQuery",
      { query: query, includeNames: showNames },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  }
};
export default EclService;
