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


  async getContextMaps(conceptIri: string): Promise<ConceptContextMap[]> {
    return await axios.get(API_URL + "/public/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(ConceptService);

export default ConceptService;
