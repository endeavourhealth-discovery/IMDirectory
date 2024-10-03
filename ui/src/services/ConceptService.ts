import { FiltersAsIris, TermCode } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";
const API_URL = Env.API + "api/concept";

const ConceptService = {
  async getMatchedFrom(iri: string): Promise<any[]> {
    return axios.get(API_URL + "/public/matchedFrom", {
      params: {
        iri: iri
      }
    });
  },

  async getMatchedTo(iri: string): Promise<any[]> {
    return axios.get(API_URL + "/public/matchedTo", {
      params: {
        iri: iri
      }
    });
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    return axios.get(API_URL + "/public/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
  },

  async getSuperiorPropertiesPaged(
    conceptIri: string,
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.get(API_URL + "/public/superiorPropertiesPaged", {
      params: { conceptIri: conceptIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getSuperiorPropertiesBoolFocusPaged(
    focus: any,
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.post(
      Env.VITE_NODE_API + "node_api/entity/public/superiorPropertiesBoolFocusPaged",
      { focus: focus, pageIndex: pageIndex, pageSize: pageSize, filters: filters },
      { signal: controller?.signal }
    );
  },

  async getSuperiorPropertyValuesPaged(
    propertyIri: string,
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.get(API_URL + "/public/superiorPropertyValuesPaged", {
      params: { propertyIri: propertyIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getContextMaps(conceptIri: string): Promise<any[]> {
    return axios.get(API_URL + "/public/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
