import { FiltersAsIris, SimpleMap, TermCode } from "@/interfaces";
import Env from "./Env";
import axios from "axios";
import { ConceptContextMap, EntityReferenceNode, Pageable } from "@/interfaces/AutoGen";
const API_URL = Env.API + "api/concept";

const ConceptService = {
  async getMatchedFrom(iri: string): Promise<SimpleMap[]> {
    return await axios.get(API_URL + "/public/matchedFrom", {
      params: {
        iri: iri
      }
    });
  },

  async getMatchedTo(iri: string): Promise<SimpleMap[]> {
    return await axios.get(API_URL + "/public/matchedTo", {
      params: {
        iri: iri
      }
    });
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    return await axios.get(API_URL + "/public/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
  },

  async getSuperiorPropertiesPaged(
    conceptIri: string,
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<Pageable<EntityReferenceNode>> {
    return await axios.get(API_URL + "/public/superiorPropertiesPaged", {
      params: { conceptIri: conceptIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getSuperiorPropertiesBoolFocusPaged(
    focus: {
      conjunction: string;
      items: any[];
      type: string;
      ecl?: string;
    },
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController,
    inactive?: boolean
  ): Promise<Pageable<EntityReferenceNode>> {
    return await axios.post(
      API_URL + "/public/superiorPropertiesBoolFocusPaged",
      { ecl: focus.ecl, page: pageIndex, size: pageSize, schemeFilters: filters, inactive: inactive },
      { signal: controller?.signal }
    );
  },

  async getSuperiorPropertyValuesPaged(
    propertyIri: string,
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<Pageable<EntityReferenceNode>> {
    return await axios.get(API_URL + "/public/superiorPropertyValuesPaged", {
      params: { propertyIri: propertyIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getContextMaps(conceptIri: string): Promise<ConceptContextMap[]> {
    return await axios.get(API_URL + "/public/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
