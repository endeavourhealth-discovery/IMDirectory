import type { ConceptContextMap } from "@endeavour/vue-library/interfaces";

import axios from "axios";

import { SimpleMap, TermCode } from "@/interfaces";

import Env from "./Env";

const API_URL = Env.API + "api/concept/protected";

const ConceptService = {
  async getMatchedFrom(iri: string): Promise<SimpleMap[]> {
    return await axios.get(API_URL + "/matchedFrom", {
      params: {
        iri: iri
      }
    });
  },

  async getMatchedTo(iri: string): Promise<SimpleMap[]> {
    return await axios.get(API_URL + "/matchedTo", {
      params: {
        iri: iri
      }
    });
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    return await axios.get(API_URL + "/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
  },

  async getContextMaps(conceptIri: string): Promise<ConceptContextMap[]> {
    return await axios.get(API_URL + "/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
