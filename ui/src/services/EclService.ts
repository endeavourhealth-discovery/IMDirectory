import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import axios from "axios";
import Env from "./Env";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query, SearchResultSummary, EclSearchRequest, BoolGroup } from "@im-library/interfaces/AutoGen";

const EclService = {
  async ECLSearch(eclSearchRequest: EclSearchRequest, controller?: AbortController): Promise<{ count: number; entities: SearchResultSummary[]; page: number }> {
    const results = (await axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclSearch", eclSearchRequest, {
      signal: controller?.signal
    })) as { count: number; entities: any[]; page: number };
    if (isObjectHasKeys(results, ["entities"])) results.entities.forEach((result: any) => entityToAliasEntity(result));
    return results;
  },

  async eclSearchTotalCount(eclSearchRequest: EclSearchRequest, controller?: AbortController): Promise<number> {
    return axios.post(Env.API + "api/ecl/public/eclSearchTotalCount", eclSearchRequest, { signal: controller?.signal });
  },

  async getEcl(query: any): Promise<string> {
    return await axios.post(Env.API + "api/ecl/public/ecl", query);
  },

  async evaluateEclQuery(eclSearchRequest: EclSearchRequest): Promise<any> {
    return axios.post(Env.API + "api/ecl/public/evaluateEcl", eclSearchRequest, { headers: { "Content-Type": "application/json" } });
  },

  async getQueryFromECL(ecl: string): Promise<Query> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclToIMQ", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async isValidECL(ecl: string): Promise<boolean> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/validateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getECLFromQuery(query: Query, includeNames?: boolean): Promise<any> {
    if (includeNames) {
      const result: any = await axios.post(Env.API + "api/ecl/public/eclFromQueryWithNames", query);
      if (isObjectHasKeys(result, ["err"])) throw new Error(result.err);
      else return result;
    } else {
      const result: any = await axios.post(Env.API + "api/ecl/public/eclFromQuery", query);
      if (isObjectHasKeys(result, ["err"])) throw new Error(result.err);
      else return result;
    }
  },

  async getBuildFromEcl(ecl: string, raw: boolean = false): Promise<any> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclToBuilder", ecl, { raw: raw, headers: { "Content-Type": "text/plain" } });
  },

  async getEclBuilderFromQuery(query: Query, raw: boolean = false): Promise<BoolGroup> {
    return axios.post(Env.API + "api/ecl/public/eclBuilderFromQuery", query, { raw: raw });
  },

  async getQueryFromEclBuilder(boolGroup: BoolGroup, raw: boolean = false): Promise<Query> {
    return axios.post(Env.API + "api/ecl/public/queryFromEclBuilder", boolGroup, { raw: raw });
  }
};

export default EclService;
