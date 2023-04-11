import { ConceptSummary } from "@im-library/interfaces";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import axios from "axios";
import Env from "./Env";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";

const EclService = {
  async ECLSearch(eclSearchRequest: any, controller: AbortController): Promise<ConceptSummary[]> {
    const results = (await axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclSearch", eclSearchRequest, {
      signal: controller.signal
    })) as any[];
    results.forEach((result: any) => entityToAliasEntity(result));
    return results;
  },

  async getEcl(query: any): Promise<string> {
    return await axios.post(Env.API + "api/ecl/public/ecl", query);
  },

  async evaluateEclQuery(eclSearchRequest: any): Promise<any> {
    return axios.post(Env.API + "api/ecl/public/evaluateEcl", eclSearchRequest, { headers: { "Content-Type": "application/json" } });
  },

  async evaluateEcl(ecl: string): Promise<any> {
    return axios.post(Env.API + "api/ecl/public/evaluateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getQueryFromECL(ecl: string): Promise<Query> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclToIMQ", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async isValidECL(ecl: string): Promise<boolean> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/validateEcl", ecl, { headers: { "Content-Type": "text/plain" } });
  },

  async getECLFromQuery(query: Query): Promise<any> {
    const result: any = await axios.post(Env.API + "api/ecl/public/eclFromQuery", query);
    if (isObjectHasKeys(result, ["err"])) throw new Error(result.err);
    else return result;
  },

  async getBuildFromEcl(ecl: string, raw: boolean = false): Promise<any> {
    return axios.post(Env.VITE_NODE_API + "node_api/ecl/public/eclToBuilder", ecl, { raw: raw, headers: { "Content-Type": "text/plain" } });
  }
};

export default EclService;
