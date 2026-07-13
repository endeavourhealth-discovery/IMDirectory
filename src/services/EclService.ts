import type { ECLQueryRequest, Query, SearchResponse } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/ecl/protected";

const EclService = {
  async ECLSearch(eclSearchRequest: ECLQueryRequest, controller?: AbortController): Promise<SearchResponse> {
    const results: SearchResponse = await api.post(API_URL + "/eclSearch", eclSearchRequest, {
      signal: controller?.signal
    });
    return results;
  },

  async getEcl(query: Query): Promise<string> {
    return await api.post(API_URL + "/ecl", { query: query });
  },

  async getQueryFromECL(ecl: string, raw: boolean = false): Promise<ECLQueryRequest> {
    return await api.post(API_URL + "/queryFromEcl", { ecl: ecl, status: { valid: true } }, { headers: { "Content-Type": "application/json" }, raw: raw });
  },

  async getEclFromEcl(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await api.post(
      API_URL + "/eclFromEcl",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },

  async validateECL(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await api.post(
      API_URL + "/validateEcl",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" } }
    );
  },

  async validateModelFromECL(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await api.post(
      API_URL + "/validateModelFromECL",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },
  async validateModelFromQuery(query: Query): Promise<ECLQueryRequest> {
    return await api.post(
      API_URL + "/validateModelFromQuery",
      { query: query, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },

  async getPropertiesForDomains(conceptIri: string[], controller?: AbortController): Promise<string[]> {
    return await api.get(API_URL + "/propertiesForDomains", {
      params: { conceptIri: conceptIri.join(",") },
      signal: controller?.signal
    });
  },

  async isValidPropertyForDomains(propertyIri: string, conceptIri: string[], controller?: AbortController): Promise<string[]> {
    return await api.get(API_URL + "/isValidPropertyForDomains", {
      params: { propertyIri: propertyIri, conceptIri: conceptIri.join(",") },
      signal: controller?.signal
    });
  },

  async getRangesForProperty(propertyIri: string, controller?: AbortController): Promise<string[]> {
    return await api.get(API_URL + "/rangesForProperty", {
      params: { propertyIri: propertyIri },
      signal: controller?.signal
    });
  },

  async getECLFromQuery(query: Query, showNames?: boolean): Promise<ECLQueryRequest> {
    return await api.post(API_URL + "/eclFromQuery", { query: query, showNames: showNames }, { headers: { "Content-Type": "application/json" }, raw: true });
  }
};
export default EclService;
