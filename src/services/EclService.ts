import { entityToAliasEntity } from "@/helpers/Transforms";
import axios from "axios";
import Env from "./Env";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Query, SearchResultSummary, EclSearchRequest, BoolGroup, SearchResponse } from "@/interfaces/AutoGen";

const EclService = {
  async ECLSearch(eclSearchRequest: EclSearchRequest, controller?: AbortController): Promise<SearchResponse> {
    const results = (await axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest, {
      signal: controller?.signal
    })) as SearchResponse;
    if (isObjectHasKeys(results, ["entities"])) results.entities?.forEach((result: SearchResultSummary) => entityToAliasEntity(result));
    return results;
  },

  async getEcl(query: Query): Promise<string> {
    return await axios.post(Env.API + "api/ecl/public/ecl", query);
  },

  async getQueryFromECL(ecl: string, raw: boolean = false): Promise<Query> {
    return axios.post(Env.API + "api/ecl/public/queryFromEcl", ecl, { headers: { "Content-Type": "text/plain" }, raw: raw });
  },

  async isValidECL(ecl: string): Promise<boolean> {
    return axios.post(Env.API + "api/ecl/public/validateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getECLFromQuery(query: Query, includeNames?: boolean): Promise<string> {
    if (includeNames) {
      const result: string | { err: string } = await axios.post(Env.API + "api/ecl/public/eclFromQueryWithNames", query);
      if (typeof result === "object" && "err" in result) throw new Error(result.err);
      else return result;
    } else {
      const result: string | { err: string } = await axios.post(Env.API + "api/ecl/public/eclFromQuery", query);
      if (typeof result === "object" && "err" in result) throw new Error(result.err);
      else return result;
    }
  },

  async getEclBuilderFromQuery(query: Query, raw: boolean = false): Promise<BoolGroup> {
    return axios.post(Env.API + "api/ecl/public/eclBuilderFromQuery", query, { raw: raw });
  },

  async getQueryFromEclBuilder(boolGroup: BoolGroup, raw: boolean = false): Promise<Query> {
    return axios.post(Env.API + "api/ecl/public/queryFromEclBuilder", boolGroup, { raw: raw });
  }
};

export default EclService;
