import { parseArray } from "@endeavour/vue-library";
import { type ConceptContextMap, ConceptContextMapSchema, SimpleMapSchema, TermCodeSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { SimpleMap, TermCode } from "@/interfaces";

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
    console.log(result);
    return parseArray(result, SimpleMapSchema);
  },

  async getMatchedTo(iri: string): Promise<SimpleMap[]> {
    const result = await api.get(API_URL + "/matchedTo", {
      params: {
        iri: iri
      }
    });
    return parseArray(result, SimpleMapSchema);
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    const result = await api.get(API_URL + "/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
    return parseArray(result, TermCodeSchema);
  },

  async getContextMaps(conceptIri: string): Promise<ConceptContextMap[]> {
    const result = await api.get(API_URL + "/conceptContextMaps", {
      params: { iri: conceptIri }
    });
    return parseArray(result, ConceptContextMapSchema);
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
