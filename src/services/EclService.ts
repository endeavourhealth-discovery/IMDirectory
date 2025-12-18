import axios from "axios";
import Env from "./Env";
import { Query, EclSearchRequest, SearchResponse, ECLQueryRequest } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/ecl";

const EclService = {
  async ECLSearch(eclSearchRequest: EclSearchRequest, controller?: AbortController): Promise<SearchResponse> {
    const results: SearchResponse = await axios.post(API_URL + "/public/eclSearch", eclSearchRequest, {
      signal: controller?.signal
    });
    return results;
  },

  async getEcl(query: Query): Promise<string> {
    return await axios.post(API_URL + "/public/ecl", { eclQuery: query });
  },

  async getQueryFromECL(ecl: string, raw: boolean = false): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/queryFromEcl",
      { ecl: ecl, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: raw }
    );
  },

  async getEclFromEcl(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/eclFromEcl",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },

  async validateECL(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/validateEcl",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" } }
    );
  },

  async validateModelFromECL(ecl: string, showNames: boolean): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/validateModelFromECL",
      { ecl: ecl, showNames: showNames, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },
  async validateModelFromQuery(query: Query): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/validateModelFromQuery",
      { query: query, status: { valid: true } },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  },
  async getPropertiesForDomains(conceptIri: string[], controller?: AbortController): Promise<string[]> {
    return await axios.get(API_URL + "/public/propertiesForDomains", {
      params: { conceptIri: conceptIri.join(",") },
      signal: controller?.signal
    });
  },

  async isValidPropertyForDomains(propertyIri: string, conceptIris: string[], controller?: AbortController): Promise<boolean> {
    return await axios.get(API_URL + "/public/propertiesForDomains", {
      params: { propertyIri: propertyIri, conceptIri: conceptIris.join(",") },
      signal: controller?.signal
    });
  },

  async getRangesForProperty(propertyIri: string, controller?: AbortController): Promise<string[]> {
    return await axios.get(API_URL + "/public/rangesForProperty", {
      params: { propertyIri: propertyIri },
      signal: controller?.signal
    });
  },

  async getECLFromQuery(query: Query, showNames?: boolean): Promise<ECLQueryRequest> {
    return await axios.post(
      API_URL + "/public/eclFromQuery",
      { query: query, showNames: showNames },
      { headers: { "Content-Type": "application/json" }, raw: true }
    );
  }
};
export default EclService;
