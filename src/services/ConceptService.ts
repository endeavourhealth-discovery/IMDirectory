import { parseApiResponse } from "@endeavour/vue-library/helpers";

import z from "zod";

import { type ConceptContextMap, ConceptContextMapSchema, SimpleMap, SimpleMapSchema, TermCode, TermCodeSchema } from "@/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/concept/protected";

const ConceptService = {
  async getMatchedFrom(iri: string): Promise<SimpleMap[]> {
    const result = await api.get(API_URL + "/matchedFrom", {
      params: {
        iri: iri
      }
    });
    return parseApiResponse(result, z.array(SimpleMapSchema));
  },

  async getMatchedTo(iri: string): Promise<SimpleMap[]> {
    const result = await api.get(API_URL + "/matchedTo", {
      params: {
        iri: iri
      }
    });
    return parseApiResponse(result, z.array(SimpleMapSchema));
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    const result = await api.get(API_URL + "/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
    return parseApiResponse(result, z.array(TermCodeSchema));
  },

  async getContextMaps(conceptIri: string): Promise<ConceptContextMap[]> {
    const result = await api.get(API_URL + "/conceptContextMaps", {
      params: { iri: conceptIri }
    });
    return parseApiResponse(result, z.array(ConceptContextMapSchema));
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
